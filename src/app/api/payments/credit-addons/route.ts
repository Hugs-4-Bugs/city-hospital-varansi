import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const CREDIT_ADDONS = [
  { id: 'credits_100', credits: 100, priceINR: 199, priceUSD: 2.49 },
  { id: 'credits_500', credits: 500, priceINR: 799, priceUSD: 9.99 },
  { id: 'credits_1000', credits: 1000, priceINR: 1299, priceUSD: 15.99 },
];

export async function GET() {
  return NextResponse.json({ addons: CREDIT_ADDONS });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { addonId, currency = 'INR' } = body;

    const addon = CREDIT_ADDONS.find(a => a.id === addonId);
    if (!addon) {
      return NextResponse.json({ error: 'Invalid addon' }, { status: 400 });
    }

    const user = await db.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const amount = currency === 'INR' ? addon.priceINR : addon.priceUSD;
    const taxAmount = currency === 'INR' ? Math.round(amount * 0.18) : 0;

    // Create payment order
    const order = await db.paymentOrder.create({
      data: {
        userId: user.id,
        provider: currency === 'INR' ? 'razorpay' : 'stripe',
        amount: amount + taxAmount,
        currency,
        plan: 'credit_addon',
        billingCycle: 'one_time',
        status: 'pending',
        taxAmount,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      addonId: addon.id,
      credits: addon.credits,
      amount: amount + taxAmount,
      subtotal: amount,
      taxAmount,
      currency,
    });
  } catch (error) {
    console.error('Credit addon error:', error);
    return NextResponse.json({ error: 'Failed to create addon order' }, { status: 500 });
  }
}
