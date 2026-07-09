import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  generateOTP,
  logAuthEvent,
  getClientIp,
  getUserAgent,
  OTP_EXPIRY_SECONDS,
} from '@/lib/auth';
import { shouldLogOtp, shouldBypassEmail } from '@/lib/feature-flags';
import { sendPasswordResetEmail, isEmailServiceConfigured } from '@/lib/email';
import { withRateLimit } from '@/lib/security/rate-limiter';

export async function POST(request: NextRequest) {
  // Rate limit: 5 auth requests per minute per IP
  const rateLimitResult = withRateLimit(request, 'auth');
  if (rateLimitResult) return rateLimitResult;

  try {
    const body = await request.json();
    const { email } = body;

    // ── Validation ──────────────────────────────────────────────
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ── Find user (always return same message to prevent enumeration) ──
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Don't reveal whether the user exists
      return NextResponse.json({
        message: 'If an account exists with this email, a reset code has been sent.',
      });
    }

    // ── Rate limit: don't allow resend if OTP is still fresh (< 60s old) ──
    if (
      user.resetOtpExpiry &&
      new Date() < new Date(user.resetOtpExpiry.getTime() - (OTP_EXPIRY_SECONDS - 60) * 1000)
    ) {
      return NextResponse.json(
        { error: 'Please wait before requesting a new reset code.' },
        { status: 429 }
      );
    }

    // ── Generate OTP & store on user record ─────────────────────
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + OTP_EXPIRY_SECONDS * 1000);

    await db.user.update({
      where: { id: user.id },
      data: {
        resetOtp: otp,
        resetOtpExpiry: otpExpiry,
        otpAttemptCount: 0,
        otpLockedUntil: null,
      },
    });

    // ── Audit log ───────────────────────────────────────────────
    const ip = getClientIp(request);
    const ua = getUserAgent(request);

    await logAuthEvent({
      userId: user.id,
      action: 'password_reset',
      details: 'Password reset OTP generated',
      ipAddress: ip,
      userAgent: ua,
    });

    // ── Send password reset OTP via email ───────────────────────
    const emailConfigured = isEmailServiceConfigured();
    const bypassEmail = shouldBypassEmail();

    console.log(`[Forgot Password] emailConfigured=${emailConfigured}, bypassEmail=${bypassEmail}`);

    if (emailConfigured && !bypassEmail) {
      try {
        const result = await sendPasswordResetEmail(normalizedEmail, user.name || 'User', otp);
        console.log(`[Forgot Password] Email send result: sent=${result.sent}, devMode=${result.devMode}, error=${result.error || 'none'}`);
      } catch (emailError) {
        console.error('[Forgot Password] Failed to send reset email:', emailError);
      }
    } else {
      console.warn(`[Forgot Password] Email skipped: emailConfigured=${emailConfigured}, bypassEmail=${bypassEmail}`);
    }

    if (shouldLogOtp()) {
      console.log(`[FORGOT PASSWORD] Reset OTP for ${normalizedEmail}: ${otp}`);
    }

    return NextResponse.json({
      message: 'If an account exists with this email, a reset code has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
