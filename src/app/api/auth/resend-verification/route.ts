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
import { sendVerificationEmail, isEmailServiceConfigured } from '@/lib/email';

export async function POST(request: NextRequest) {
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

    // ── Find user (return generic message regardless) ───────────
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Don't reveal whether the user exists
      return NextResponse.json({
        message: 'If an account exists and is not yet verified, a new verification code has been sent.',
      });
    }

    // ── Already verified ────────────────────────────────────────
    if (user.emailVerified) {
      return NextResponse.json({
        message: 'If an account exists and is not yet verified, a new verification code has been sent.',
      });
    }

    // ── Rate limit (60s cooldown) ──────────────────────────────
    if (
      user.emailVerificationOtpExpiry &&
      new Date() < new Date(user.emailVerificationOtpExpiry.getTime() - (OTP_EXPIRY_SECONDS - 60) * 1000)
    ) {
      return NextResponse.json(
        { error: 'Please wait before requesting a new verification code.' },
        { status: 429 }
      );
    }

    // ── Generate new OTP ────────────────────────────────────────
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + OTP_EXPIRY_SECONDS * 1000);

    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerificationOtp: otp,
        emailVerificationOtpExpiry: otpExpiry,
      },
    });

    // ── Audit log ───────────────────────────────────────────────
    const ip = getClientIp(request);
    const ua = getUserAgent(request);

    await logAuthEvent({
      userId: user.id,
      action: 'email_verification_sent',
      details: 'Verification OTP resent via resend-verification endpoint',
      ipAddress: ip,
      userAgent: ua,
    });

    // ── Send verification email ─────────────────────────────────
    const emailConfigured = isEmailServiceConfigured();
    const bypassEmail = shouldBypassEmail();

    if (emailConfigured && !bypassEmail) {
      try {
        await sendVerificationEmail(normalizedEmail, user.name || 'User', otp);
      } catch (emailError) {
        console.error('[Resend Verification] Failed to send email:', emailError);
      }
    }

    if (shouldLogOtp()) {
      console.log(`[RESEND VERIFICATION] OTP for ${normalizedEmail}: ${otp}`);
    }

    return NextResponse.json({
      message: 'If an account exists and is not yet verified, a new verification code has been sent.',
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
