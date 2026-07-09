import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  validateEmail,
  generateMagicLinkToken,
  logAuthEvent,
  getClientIp,
  getUserAgent,
} from '@/lib/auth';
import { shouldLogOtp, shouldBypassEmail } from '@/lib/feature-flags';
import { sendMagicLinkEmail, isEmailServiceConfigured } from '@/lib/email';
import { withRateLimit } from '@/lib/security/rate-limiter';
import { getAppUrl } from '@/lib/app-url';

const MAGIC_LINK_EXPIRY_SECONDS = 15 * 60; // 15 minutes

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
        message: 'If an account exists with this email, a magic link has been sent.',
      });
    }

    // ── Rate limit: don't allow new magic link if previous one is still fresh (< 60s old) ──
    if (
      user.magicLinkTokenExpiry &&
      new Date() < new Date(user.magicLinkTokenExpiry.getTime() - (MAGIC_LINK_EXPIRY_SECONDS - 60) * 1000)
    ) {
      return NextResponse.json(
        { error: 'Please wait before requesting a new magic link.' },
        { status: 429 }
      );
    }

    // ── Generate magic link token & store on SEPARATE user fields ──
    const token = generateMagicLinkToken();
    const tokenExpiry = new Date(Date.now() + MAGIC_LINK_EXPIRY_SECONDS * 1000);

    await db.user.update({
      where: { id: user.id },
      data: {
        magicLinkToken: token,
        magicLinkTokenExpiry: tokenExpiry,
      },
    });

    // ── Build the magic link URL ────────────────────────────────
    // Always use getAppUrl() — never fall back to request.url which resolves to 0.0.0.0
    const baseUrl = getAppUrl();
    console.log(`[Magic Link] baseUrl resolved: ${baseUrl}`);
    const magicLinkUrl = `${baseUrl}/api/auth/magic-link/verify?token=${encodeURIComponent(token)}&email=${encodeURIComponent(normalizedEmail)}`;

    // ── Audit log ───────────────────────────────────────────────
    const ip = getClientIp(request);
    const ua = getUserAgent(request);

    await logAuthEvent({
      userId: user.id,
      action: 'magic_link_sent',
      details: 'Magic link token generated',
      ipAddress: ip,
      userAgent: ua,
    });

    // ── Send magic link via email ───────────────────────────────
    const emailConfigured = isEmailServiceConfigured();
    const bypassEmail = shouldBypassEmail();
    let emailDelivered = false;
    let emailPreviewUrl: string | undefined;

    console.log(`[Magic Link] emailConfigured=${emailConfigured}, bypassEmail=${bypassEmail}`);

    if (emailConfigured && !bypassEmail) {
      try {
        // Await email delivery to detect failures
        const result = await sendMagicLinkEmail(normalizedEmail, user.name || 'User', magicLinkUrl);
        emailDelivered = result.sent && !result.devMode;
        emailPreviewUrl = result.previewUrl;
        console.log(`[Magic Link] Email send result: sent=${result.sent}, devMode=${result.devMode}, error=${result.error || 'none'}, previewUrl=${result.previewUrl || 'none'}`);
      } catch (emailError) {
        console.error('[Magic Link] Failed to send email:', emailError);
      }
    } else {
      console.warn(`[Magic Link] Email skipped: emailConfigured=${emailConfigured}, bypassEmail=${bypassEmail}`);
    }

    if (shouldLogOtp()) {
      console.log(`[MAGIC LINK] Token for ${normalizedEmail}: ${token}`);
      console.log(`[MAGIC LINK] URL: ${magicLinkUrl}`);
    }

    // ── Build response ──────────────────────────────────────────
    // If email delivery failed, include link as fallback so users aren't locked out
    // If email was delivered successfully, never include link in response

    return NextResponse.json({
      message: 'If an account exists with this email, a magic link has been sent.',
    });
  } catch (error) {
    console.error('Magic link request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
