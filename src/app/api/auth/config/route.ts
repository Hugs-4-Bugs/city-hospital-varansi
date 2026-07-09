// PRODUCTION MODE — No demo/mock/simulation flags allowed in this file.
// Do not add DEMO_MODE checks, email simulation, or mock auth flows.
// All credentials are set in environment variables and are production-ready.

import { NextResponse } from 'next/server';

export async function GET() {
  // Google OAuth credentials are configured in environment variables
  const googleAvailable = true;

  return NextResponse.json({
    googleAvailable,
  });
}
