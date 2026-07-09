import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  validateEmail,
  generateOTP,
  logAuthEvent,
  getClientIp,
  getUserAgent,
  OTP_EXPIRY_SECONDS,
} from '@/lib/auth';
import { shouldLogOtp, shouldBypassEmail } from '@/lib/feature-flags';
import { sendOtpLoginEmail, isEmailServiceConfigured } from '@/lib/email';
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

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ── Find user (return same message regardless of existence) ──
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Don't reveal whether the user exists
      return NextResponse.json({
        message: 'If an account exists with this email, an OTP has been sent.',
      });
    }

    // ── Rate limit: don't allow new OTP if previous one is still fresh (< 60s old) ──
    if (
      user.loginOtpExpiry &&
      new Date() < new Date(user.loginOtpExpiry.getTime() - (OTP_EXPIRY_SECONDS - 60) * 1000)
    ) {
      return NextResponse.json(
        { error: 'Please wait before requesting a new OTP.' },
        { status: 429 }
      );
    }

    // ── Generate OTP & store on user record ─────────────────────
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + OTP_EXPIRY_SECONDS * 1000);

    await db.user.update({
      where: { id: user.id },
      data: {
        loginOtp: otp,
        loginOtpExpiry: otpExpiry,
        otpAttemptCount: 0, // Reset attempt count on new OTP
        otpLockedUntil: null,
      },
    });

    // ── Audit log ───────────────────────────────────────────────
    const ip = getClientIp(request);
    const ua = getUserAgent(request);

    await logAuthEvent({
      userId: user.id,
      action: 'otp_login',
      details: 'OTP login code generated',
      ipAddress: ip,
      userAgent: ua,
    });

    // ── Send OTP via email ──────────────────────────────────────
    const emailConfigured = isEmailServiceConfigured();
    const bypassEmail = shouldBypassEmail();
    let emailDelivered = false;
    let emailPreviewUrl: string | undefined;

    console.log(`[OTP Request] emailConfigured=${emailConfigured}, bypassEmail=${bypassEmail}`);

    if (emailConfigured && !bypassEmail) {
      try {
        // Await email delivery to detect failures
        const result = await sendOtpLoginEmail(normalizedEmail, user.name || 'User', otp);
        emailDelivered = result.sent && !result.devMode;
        emailPreviewUrl = result.previewUrl;
        console.log(`[OTP Request] Email send result: sent=${result.sent}, devMode=${result.devMode}, error=${result.error || 'none'}, previewUrl=${result.previewUrl || 'none'}`);
      } catch (emailError) {
        console.error('[OTP Request] Failed to send OTP email:', emailError);
      }
    } else {
      console.warn(`[OTP Request] Email skipped: emailConfigured=${emailConfigured}, bypassEmail=${bypassEmail}`);
    }

    // Always log OTP for debugging (can be disabled via feature flag)
    if (shouldLogOtp()) {
      console.log(`[OTP LOGIN] OTP for ${normalizedEmail}: ${otp}`);
    }

    // ── Build response ──────────────────────────────────────────
    // If email delivery failed, include OTP as fallback so users aren't locked out
    // If email was delivered successfully, never include OTP in response
    return NextResponse.json({
      message: 'If an account exists with this email, an OTP has been sent.',
    });
  } catch (error) {
    console.error('OTP request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
