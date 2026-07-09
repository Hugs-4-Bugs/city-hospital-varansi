import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  generateAccessToken,
  generateRefreshToken,
  createSession,
  recordLoginAttempt,
  logAuthEvent,
  getClientIp,
  getUserAgent,
  setAuthCookies,
} from '@/lib/auth';
import { buildRedirectUrl, getAppUrl } from '@/lib/app-url';

interface GoogleTokenResponse {
  access_token: string;
  id_token?: string;
  token_type?: string;
  expires_in?: number;
}

interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

/**
 * Shared helper: exchange a Google OAuth authorization code for tokens,
 * find or create the user, set up a session, and return auth cookies.
 * Returns null on error (caller decides how to surface it).
 */
async function handleGoogleOAuth(code: string, request: NextRequest, stateFromQuery?: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const publicClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  console.log(`[Google OAuth /google/callback] ===== CALLBACK REACHED =====`);
  console.log(`[Google OAuth /google/callback] code=${code ? code.substring(0, 10) + '...' : 'MISSING'}`);
  console.log(`[Google OAuth /google/callback] clientId=${clientId ? 'SET (' + clientId.substring(0, 10) + '...)' : 'MISSING'}, clientSecret=${clientSecret ? 'SET' : 'MISSING'}, publicClientId=${publicClientId ? 'SET' : 'MISSING'}`);

  if (!clientId || !clientSecret) {
    console.error('Google OAuth: Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
    return null;
  }

  const ip = getClientIp(request);
  const ua = getUserAgent(request);

  // ── Reconstruct the EXACT redirect_uri used during authorization ──
  // The state parameter encodes { nonce, redirectUri, origin } from the
  // /api/auth/google/state endpoint. We MUST send the same redirect_uri
  // to Google's token endpoint, otherwise we get redirect_uri_mismatch.
  let redirectUri: string;
  try {
    if (stateFromQuery) {
      const decoded = JSON.parse(Buffer.from(stateFromQuery, 'base64url').toString('utf-8'));
      if (decoded.redirectUri) {
        redirectUri = decoded.redirectUri;
        console.log(`[Google OAuth /google/callback] redirect_uri from state: ${redirectUri}`);
      } else {
        throw new Error('No redirectUri in state');
      }
    } else {
      throw new Error('No state parameter');
    }
  } catch {
    // Fallback: derive from env vars, forwarded headers, or request origin
    // Use getAppUrl() — never fall back to request.url which resolves to 0.0.0.0
    const appUrl = getAppUrl();
    redirectUri = `${appUrl}/api/auth/google/callback`;
    console.log(`[Google OAuth /google/callback] redirect_uri from fallback: ${redirectUri}`);
  }
  console.log(`[Google OAuth /google/callback] final redirect_uri=${redirectUri}`);

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenResponse.ok) {
    const errorData = await tokenResponse.text();
    console.error(`[Google OAuth /google/callback] ✗ Token exchange FAILED (status=${tokenResponse.status}):`, errorData);
    return null;
  }
  console.log(`[Google OAuth /google/callback] ✓ Token exchange successful`);

  const tokenData: GoogleTokenResponse = await tokenResponse.json();

  // ── Fetch user profile from Google ──────────────────────────
  const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  if (!profileResponse.ok) {
    console.error('[Google OAuth /google/callback] ✗ Failed to fetch user profile');
    return null;
  }

  const googleUser: GoogleUserInfo = await profileResponse.json();
  console.log(`[Google OAuth /google/callback] ✓ User profile fetched: email=${googleUser.email}, name=${googleUser.name}`);

  if (!googleUser.email) {
    return null;
  }

  const normalizedEmail = googleUser.email.toLowerCase().trim();

  // ── Find existing user by email or googleId ─────────────────
  let user = await db.user.findFirst({
    where: {
      OR: [
        { email: normalizedEmail },
        ...(googleUser.sub ? [{ googleId: googleUser.sub }] : []),
      ],
    },
    include: { mfaConfig: true },
  });

  if (user) {
    // ── Update googleId if not set ─────────────────────────────
    if (!user.googleId && googleUser.sub) {
      await db.user.update({
        where: { id: user.id },
        data: { googleId: googleUser.sub },
      });
    }

    // ── Check if account is active ─────────────────────────────
    if (!user.isActive) {
      return null;
    }
  } else {
    // ── Create new user ────────────────────────────────────────
    user = await db.user.create({
      data: {
        email: normalizedEmail,
        name: googleUser.name || googleUser.given_name || 'Google User',
        avatar: googleUser.picture || null,
        googleId: googleUser.sub,
        emailVerified: googleUser.email_verified ?? true,
        authProvider: 'google',
        role: 'owner',
        plan: 'free',
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
      include: { mfaConfig: true },
    });

    // ── Log signup event ───────────────────────────────────────
    await logAuthEvent({
      userId: user.id,
      action: 'signup',
      details: `New account created via Google OAuth for ${normalizedEmail}`,
      ipAddress: ip,
      userAgent: ua,
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
  await recordLoginAttempt({
    userId: user.id,
    ip,
    userAgent: ua,
    success: true,
  });

  await logAuthEvent({
    userId: user.id,
    action: 'google_oauth_login',
    details: 'Successful Google OAuth login',
    ipAddress: ip,
    userAgent: ua,
  });

  await logAuthEvent({
    userId: user.id,
    action: 'signin',
    details: 'Successful login via Google OAuth',
    ipAddress: ip,
    userAgent: ua,
  });

  return { accessToken, refreshToken, user };
}

// ── GET handler: Google redirects back with ?code=xxx&state=yyy ──
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state') || undefined;

    if (!code) {
      return NextResponse.redirect(
        buildRedirectUrl('/?auth_error=google_failed')
      );
    }

    const result = await handleGoogleOAuth(code, request, state);

    if (!result) {
      console.error('[Google OAuth /google/callback] GET handler: handleGoogleOAuth returned null, redirecting to error');
      return NextResponse.redirect(
        buildRedirectUrl('/?auth_error=google_failed')
      );
    }

    console.log(`[Google OAuth /google/callback] ✓ GET handler success — user=${result.user.email}, redirecting to /`);

    const { accessToken, refreshToken } = result;

    // Redirect to home page with auth cookies set
    const response = NextResponse.redirect(buildRedirectUrl('/'));
    return setAuthCookies(response, accessToken, refreshToken);
  } catch (error) {
    console.error('[Google OAuth /google/callback] GET handler error:', error);
    return NextResponse.redirect(
      buildRedirectUrl('/?auth_error=google_failed')
    );
  }
}

// ── POST handler: programmatic exchange (e.g. from client-side fetch) ──
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    // ── Validation ──────────────────────────────────────────────
    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }

    const result = await handleGoogleOAuth(code, request);

    if (!result) {
      return NextResponse.json(
        { error: 'Google authentication failed. Please try again.' },
        { status: 401 }
      );
    }

    const { accessToken, refreshToken, user } = result;

    // ── Build response ──────────────────────────────────────────
    const mfaEnabled = user.mfaConfig?.isEnabled ?? false;

    const response = NextResponse.json({
      message: 'Signed in successfully via Google',
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
    console.error('Google OAuth callback error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
