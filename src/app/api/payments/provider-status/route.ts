// ═══════════════════════════════════════════════════════════════════
// AcquisitionOS — GET /api/payments/provider-status
// Returns which payment providers are configured and available.
// This is a PUBLIC endpoint (no auth required) — it only reveals
// provider availability, not secrets.
// ═══════════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';

export async function GET() {
  const stripeKey = process.env.STRIPE_SECRET_KEY ?? '';
  const razorpayKeyId = process.env.RAZORPAY_KEY_ID ?? '';
  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET ?? '';

  const isStripeConfigured = !!stripeKey;
  const isRazorpayConfigured = !!(razorpayKeyId && razorpayKeySecret);

  return NextResponse.json({
    stripe: {
      available: isStripeConfigured,
      mode: isStripeConfigured
        ? stripeKey.startsWith('sk_test_')
          ? 'test'
          : 'live'
        : null,
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || null,
    },
    razorpay: {
      available: isRazorpayConfigured,
      mode: isRazorpayConfigured
        ? razorpayKeyId.startsWith('rzp_test_')
          ? 'test'
          : 'live'
        : null,
      keyId: isRazorpayConfigured
        ? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || razorpayKeyId
        : null,
    },
    anyAvailable: isStripeConfigured || isRazorpayConfigured,
  });
}
