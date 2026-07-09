import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  createSession,
  isAccountLocked,
  recordLoginAttemptByEmail,
  logAuthEvent,
  getClientIp,
  getUserAgent,
  setAuthCookies,
  detectSuspiciousLogin,
  sendSecurityAlert,
} from '@/lib/auth';
import { withRateLimit } from '@/lib/security/rate-limiter';
import { withMonitoring } from '@/lib/observability/middleware';

export const POST = withMonitoring(async (request: NextRequest) => {
  // Rate limit: 5 auth requests per minute per IP
  const rateLimitResult = withRateLimit(request, 'auth');
  if (rateLimitResult) return rateLimitResult;

  try {
    const body = await request.json();
    const { email, password } = body;

    // ── Validation ──────────────────────────────────────────────
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const ip = getClientIp(request);
    const ua = getUserAgent(request);

    // ── Check account lockout ───────────────────────────────────
    if (await isAccountLocked(normalizedEmail)) {
      await logAuthEvent({
        userId: 'unknown',
        action: 'signin_failed',
        details: `Account locked: ${normalizedEmail}`,
        ipAddress: ip,
        userAgent: ua,
      });
      return NextResponse.json(
        { error: 'Account temporarily locked due to too many failed attempts. Please try again later.' },
        { status: 423 }
      );
    }

    // ── Find user ───────────────────────────────────────────────
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
      include: { mfaConfig: true },
    });

    if (!user) {
      // Constant-time delay to match bcrypt verification timing
      // This prevents timing attacks that reveal whether an email is registered
      await verifyPassword(password, '$2b$12$fakehashfakehashfakehashfakehashfakeh');

      await recordLoginAttemptByEmail({
        email: normalizedEmail,
        ip,
        userAgent: ua,
        success: false,
        failReason: 'User not found',
      });
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // ── Check OAuth-only accounts ───────────────────────────────
    // Generic message — don't reveal the account exists or its auth provider
    if (user.authProvider === 'google' && !user.passwordHash) {
      // Constant-time delay to match bcrypt
      await verifyPassword(password, '$2b$12$fakehashfakehashfakehashfakehashfakeh');

      await recordLoginAttemptByEmail({
        email: normalizedEmail,
        ip,
        userAgent: ua,
        success: false,
        failReason: 'OAuth-only account tried password',
      });
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // ── Verify password ─────────────────────────────────────────
    const validPassword = await verifyPassword(password, user.passwordHash || '');
    if (!validPassword) {
      await recordLoginAttemptByEmail({
        email: normalizedEmail,
        ip,
        userAgent: ua,
        success: false,
        failReason: 'Invalid password',
      });
      await logAuthEvent({
        userId: user.id,
        action: 'signin_failed',
        details: 'Invalid password',
        ipAddress: ip,
        userAgent: ua,
      });
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // ── Check email verification ────────────────────────────────
    if (!user.emailVerified) {
      // Generic: don't reveal whether account exists or email verified status
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // ── Check if account is active ──────────────────────────────
    if (!user.isActive) {
      // Generic: don't reveal that account exists but is deactivated
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // ── Check MFA ───────────────────────────────────────────────
    const mfaEnabled = user.mfaConfig?.isEnabled ?? false;
    if (mfaEnabled) {
      // Generate a temporary MFA session token (short-lived access token)
      const mfaSessionToken = generateAccessToken({
        id: user.id,
        email: user.email,
        role: user.role,
        plan: user.plan,
        orgId: user.orgId,
        isTrial: user.isTrial,
        trialEndsAt: user.trialEndsAt,
      });

      await recordLoginAttemptByEmail({
        email: normalizedEmail,
        ip,
        userAgent: ua,
        success: true,
      });

      await logAuthEvent({
        userId: user.id,
        action: 'signin',
        details: 'MFA required — awaiting TOTP verification',
        ipAddress: ip,
        userAgent: ua,
      });

      return NextResponse.json({
        mfaRequired: true,
        mfaSessionToken,
        message: 'MFA verification required',
      });
    }

    // ── Generate tokens ─────────────────────────────────────────
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

    // ── Create session ──────────────────────────────────────────
    await createSession({
      userId: user.id,
      refreshToken,
      deviceInfo: ua.substring(0, 255),
      ipAddress: ip,
      userAgent: ua,
    });

    // ── Update last login ───────────────────────────────────────
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // ── Record successful login & audit ─────────────────────────
    await recordLoginAttemptByEmail({
      email: normalizedEmail,
      ip,
      userAgent: ua,
      success: true,
    });

    await logAuthEvent({
      userId: user.id,
      action: 'signin',
      details: 'Successful login',
      ipAddress: ip,
      userAgent: ua,
    });

    // ── Suspicious login detection ──────────────────────────────
    try {
      const isSuspicious = await detectSuspiciousLogin({
        userId: user.id,
        ip,
        userAgent: ua,
      });

      if (isSuspicious) {
        // Fire and forget — don't block the login flow
        sendSecurityAlert({
          userId: user.id,
          email: user.email,
          name: user.name || 'User',
          event: 'Login from new device or location',
          ip,
          userAgent: ua,
        }).catch(() => {
          // Silently fail — never block login
        });
      }
    } catch {
      // Never block login due to suspicious detection failure
    }

    // ── Build response ──────────────────────────────────────────
    const response = NextResponse.json({
      message: 'Signed in successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        plan: user.plan || 'free',
        orgId: user.orgId,
        emailVerified: user.emailVerified,
        mfaEnabled,
        avatarUrl: user.avatar,
      },
    });

    return setAuthCookies(response, accessToken, refreshToken);
  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}, '/api/auth/signin');
