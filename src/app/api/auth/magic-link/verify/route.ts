import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  validateEmail,
  generateAccessToken,
  generateRefreshToken,
  createSession,
  recordLoginAttempt,
  logAuthEvent,
  getClientIp,
  getUserAgent,
  setAuthCookies,
  secureCompare,
} from '@/lib/auth';
import { buildRedirectUrl } from '@/lib/app-url';

const MAGIC_LINK_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes

/**
 * GET handler — magic links are typically clicked from email (GET request)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    // ── Validation ──────────────────────────────────────────────
    if (!token || !email) {
      return NextResponse.redirect(
        buildRedirectUrl('/?auth_error=missing_params')
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!validateEmail(normalizedEmail)) {
      return NextResponse.redirect(
        buildRedirectUrl('/?auth_error=invalid_email')
      );
    }

    const ip = getClientIp(request);
    const ua = getUserAgent(request);

    // ── Find user ───────────────────────────────────────────────
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
      include: { mfaConfig: true },
    });

    if (!user) {
      return NextResponse.redirect(
        buildRedirectUrl('/?auth_error=invalid_link')
      );
    }

    // ── Verify token matches (use dedicated magicLinkToken field) ─
    if (!user.magicLinkToken || !secureCompare(user.magicLinkToken, token)) {
      return NextResponse.redirect(
        buildRedirectUrl('/?auth_error=invalid_link')
      );
    }

    // ── Check expiry (15 minutes) ──────────────────────────────
    if (!user.magicLinkTokenExpiry || new Date() > user.magicLinkTokenExpiry) {
      return NextResponse.redirect(
        buildRedirectUrl('/?auth_error=expired_link')
      );
    }

    // ── Clear token fields ──────────────────────────────────────
    await db.user.update({
      where: { id: user.id },
      data: {
        magicLinkToken: null,
        magicLinkTokenExpiry: null,
      },
    });

    // ── Auto-verify email on magic link use ─────────────────────
    if (!user.emailVerified) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      });
    }

    // ── Check if account is active ──────────────────────────────
    if (!user.isActive) {
      // Anti-enumeration: don't reveal that account exists but is deactivated
      return NextResponse.redirect(
        buildRedirectUrl('/?auth_error=invalid_link')
      );
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
    await recordLoginAttempt({
      userId: user.id,
      ip,
      userAgent: ua,
      success: true,
    });

    await logAuthEvent({
      userId: user.id,
      action: 'magic_link_used',
      details: 'Successful magic link login',
      ipAddress: ip,
      userAgent: ua,
    });

    await logAuthEvent({
      userId: user.id,
      action: 'signin',
      details: 'Successful login via magic link',
      ipAddress: ip,
      userAgent: ua,
    });

    // ── Redirect to home with auth cookies ──────────────────────
    const response = NextResponse.redirect(buildRedirectUrl('/'));
    return setAuthCookies(response, accessToken, refreshToken);
  } catch (error) {
    console.error('Magic link verify (GET) error:', error);
    return NextResponse.redirect(
      buildRedirectUrl('/?auth_error=server_error')
    );
  }
}

/**
 * POST handler — for API-based verification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, token } = body;

    // ── Validation ──────────────────────────────────────────────
    if (!email || !token) {
      return NextResponse.json(
        { error: 'Email and token are required' },
        { status: 400 }
      );
    }

    if (typeof email !== 'string' || !validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const ip = getClientIp(request);
    const ua = getUserAgent(request);

    // ── Find user ───────────────────────────────────────────────
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
      include: { mfaConfig: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired magic link' },
        { status: 401 }
      );
    }

    // ── Verify token matches (use dedicated magicLinkToken field) ─
    if (!user.magicLinkToken || !secureCompare(user.magicLinkToken, token)) {
      return NextResponse.json(
        { error: 'Invalid or expired magic link' },
        { status: 401 }
      );
    }

    // ── Check expiry (15 minutes) ──────────────────────────────
    if (!user.magicLinkTokenExpiry || new Date() > user.magicLinkTokenExpiry) {
      return NextResponse.json(
        { error: 'Magic link has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // ── Clear token fields ──────────────────────────────────────
    await db.user.update({
      where: { id: user.id },
      data: {
        magicLinkToken: null,
        magicLinkTokenExpiry: null,
      },
    });

    // ── Auto-verify email on magic link use ─────────────────────
    if (!user.emailVerified) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      });
    }

    // ── Check if account is active ──────────────────────────────
    if (!user.isActive) {
      // Anti-enumeration: don't reveal that account exists but is deactivated
      return NextResponse.json(
        { error: 'Invalid or expired magic link' },
        { status: 401 }
      );
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
    await recordLoginAttempt({
      userId: user.id,
      ip,
      userAgent: ua,
      success: true,
    });

    await logAuthEvent({
      userId: user.id,
      action: 'magic_link_used',
      details: 'Successful magic link login',
      ipAddress: ip,
      userAgent: ua,
    });

    await logAuthEvent({
      userId: user.id,
      action: 'signin',
      details: 'Successful login via magic link',
      ipAddress: ip,
      userAgent: ua,
    });

    // ── Build response ──────────────────────────────────────────
    const mfaEnabled = user.mfaConfig?.isEnabled ?? false;

    const response = NextResponse.json({
      message: 'Signed in successfully via magic link',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        plan: user.plan || 'free',
        orgId: user.orgId,
        emailVerified: true, // Auto-verified
        mfaEnabled,
        avatarUrl: user.avatar,
      },
    });

    return setAuthCookies(response, accessToken, refreshToken);
  } catch (error) {
    console.error('Magic link verify (POST) error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
