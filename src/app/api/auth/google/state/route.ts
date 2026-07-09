// PRODUCTION MODE — No demo/mock/simulation flags allowed in this file.
// Do not add DEMO_MODE checks, email simulation, or mock auth flows.
// All credentials are set in environment variables and are production-ready.

import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { getAppUrl } from '@/lib/app-url';

export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error('[Google OAuth State] Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
      return NextResponse.json(
        { error: 'Google OAuth is not configured on the server.' },
        { status: 500 }
      );
    }

    // Determine the origin — always use getAppUrl(), never request.url
    // Priority: query param > env vars (via getAppUrl)
    const origin = request.nextUrl.searchParams.get('origin') ||
      getAppUrl();

    // Always use /api/auth/callback/google as the redirect path
    // This is the route registered in Google Cloud Console
    const redirectUri = `${origin}/api/auth/callback/google`;

    // Encode the origin + redirect_uri into the state so the callback
    // route can reconstruct the EXACT same redirect_uri for token exchange.
    // This solves the redirect_uri_mismatch error when the app is accessed
    // via the preview domain (origin differs from NEXT_PUBLIC_APP_URL).
    const statePayload = JSON.stringify({
      nonce: randomBytes(16).toString('base64url'),
      redirectUri,
      origin,
    });
    const state = Buffer.from(statePayload).toString('base64url');

    const scope = 'openid email profile';

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(scope)}` +
      `&state=${state}` +
      `&access_type=offline` +
      `&prompt=consent`;

    console.log(`[Google OAuth State] Generated auth URL. redirectUri=${redirectUri}, origin=${origin}`);

    return NextResponse.json({
      authUrl,
      state,
      googleEnabled: true,
    });
  } catch (error) {
    console.error('[Google OAuth State] Error generating state:', error);
    return NextResponse.json(
      { error: 'Failed to generate OAuth state' },
      { status: 500 }
    );
  }
}
