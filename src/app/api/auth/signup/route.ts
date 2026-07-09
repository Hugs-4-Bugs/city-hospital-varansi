import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  hashPassword,
  validateEmail,
  validatePasswordStrength,
  generateAccessToken,
  generateRefreshToken,
  generateOTP,
  createSession,
  logAuthEvent,
  getClientIp,
  getUserAgent,
  setAuthCookies,
  OTP_EXPIRY_SECONDS,
} from '@/lib/auth';
import { shouldAutoVerifyEmail, shouldLogOtp, shouldBypassEmail } from '@/lib/feature-flags';
import { sendVerificationEmail, isEmailServiceConfigured } from '@/lib/email';
import { withRateLimit } from '@/lib/security/rate-limiter';

export async function POST(request: NextRequest) {
  // Rate limit: 5 auth requests per minute per IP to prevent bulk account creation
  const rateLimitResult = withRateLimit(request, 'auth');
  if (rateLimitResult) return rateLimitResult;

  try {
    const body = await request.json();
    const { name, email, password } = body;

    // ── Validation ──────────────────────────────────────────────
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Name must be at least 2 characters' },
        { status: 400 }
      );
    }

    if (typeof email !== 'string' || !validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password must be a string' },
        { status: 400 }
      );
    }

    const passwordCheck = validatePasswordStrength(password);
    if (!passwordCheck.valid) {
      return NextResponse.json(
        { error: passwordCheck.errors.join('. ') },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ── Check for existing user ─────────────────────────────────
    const existing = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      // Anti-enumeration: don't reveal that email is already registered
      // Return generic success + send warning email to existing user
      return NextResponse.json(
        {
          message: 'If this email is available, an account will be created and you will receive a verification code.',
          requiresVerification: true,
          email: normalizedEmail,
        },
        { status: 201 }
      );
    }

    // ── Hash password ───────────────────────────────────────────
    const hashedPassword = await hashPassword(password);

    // ── Determine email verification behavior ───────────────────
    const autoVerify = shouldAutoVerifyEmail();
    const bypassEmail = shouldBypassEmail();
    const emailConfigured = isEmailServiceConfigured();

    // Generate OTP for email verification (always, even if auto-verifying)
    const verificationOtp = generateOTP();
    const verificationOtpExpiry = new Date(Date.now() + OTP_EXPIRY_SECONDS * 1000);

    // ── Create user ─────────────────────────────────────────────
    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash: hashedPassword,
        role: 'owner',
        plan: 'free',
        authProvider: 'email',
        emailVerified: autoVerify, // Only auto-verify in dev mode
        emailVerificationOtp: autoVerify ? null : verificationOtp,
        emailVerificationOtpExpiry: autoVerify ? null : verificationOtpExpiry,
        isTrial: true,
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        settings: { create: {} },
        subscriptions: {
          create: {
            plan: 'free',
            status: 'trial',
            isTrial: true,
            trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
      },
      include: { mfaConfig: { select: { isEnabled: true } } },
    });

    // ── Audit logging ───────────────────────────────────────────
    const ip = getClientIp(request);
    const ua = getUserAgent(request);

    await logAuthEvent({
      userId: user.id,
      action: 'signup',
      details: `New account created for ${normalizedEmail}`,
      ipAddress: ip,
      userAgent: ua,
    });

    // ── Send verification email (production flow) ───────────────
    if (!autoVerify) {
      console.log(`[Signup] autoVerify=${autoVerify}, emailConfigured=${emailConfigured}, bypassEmail=${bypassEmail}`);
      // Production: Send verification email with OTP
      if (emailConfigured && !bypassEmail) {
        try {
          const result = await sendVerificationEmail(normalizedEmail, name.trim(), verificationOtp);
          console.log(`[Signup] Verification email result: sent=${result.sent}, devMode=${result.devMode}, error=${result.error || 'none'}`);
          await logAuthEvent({
            userId: user.id,
            action: 'email_verification_sent',
            details: 'Verification email sent after signup',
            ipAddress: ip,
            userAgent: ua,
          });
        } catch (emailError) {
          console.error('[Signup] Failed to send verification email:', emailError);
          // Don't fail signup if email fails — user can resend verification
        }
      } else {
        // No email service configured or bypass enabled — log the OTP
        console.warn(`[Signup] Email skipped: emailConfigured=${emailConfigured}, bypassEmail=${bypassEmail}`);
        if (shouldLogOtp()) {
          console.log(`[SIGNUP] Verification OTP for ${normalizedEmail}: ${verificationOtp}`);
        }
      }

      // Return response requiring email verification
      const response = NextResponse.json(
        {
          message: 'Account created! Please check your email for a verification code.',
          requiresVerification: true,
          email: normalizedEmail,
        },
        { status: 201 }
      );

      return response;
    }

    // ── Dev mode: Auto-verify + Auto-login ──────────────────────
    await logAuthEvent({
      userId: user.id,
      action: 'email_verified',
      details: 'Email auto-verified (dev mode)',
      ipAddress: ip,
      userAgent: ua,
    });

    // Generate tokens for auto-login
    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      plan: user.plan,
      orgId: user.orgId,
      isTrial: user.isTrial,
      trialEndsAt: user.trialEndsAt,
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
      email: user.email,
      role: user.role,
      plan: user.plan,
      orgId: user.orgId,
      isTrial: user.isTrial,
      trialEndsAt: user.trialEndsAt,
    });

    // Create session
    await createSession({
      userId: user.id,
      refreshToken,
      deviceInfo: ua.substring(0, 255),
      ipAddress: ip,
      userAgent: ua,
    });

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Build response with auth cookies
    const response = NextResponse.json(
      {
        message: 'Account created successfully. Welcome to AcquisitionOS!',
        requiresVerification: false,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          plan: user.plan || 'free',
          orgId: user.orgId,
          emailVerified: user.emailVerified,
          mfaEnabled: user.mfaConfig?.isEnabled ?? false,
          avatarUrl: user.avatar,
        },
      },
      { status: 201 }
    );

    return setAuthCookies(response, accessToken, refreshToken);
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
