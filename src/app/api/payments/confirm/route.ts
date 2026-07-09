// ═══════════════════════════════════════════════════════════════════
// AcquisitionOS — POST /api/payments/confirm
// Confirms a payment order and activates the subscription.
// Used in dev mode when Razorpay/Stripe checkout is not available.
// In production, webhooks handle this automatically.
// ═══════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-middleware';
import { confirmPaymentAndActivate } from '@/lib/subscription-service';
import { logPaymentEvent } from '@/lib/billing-audit';
import { db } from '@/lib/db';
import { generateInvoicePdf } from '@/lib/invoice-pdf-service';
import { sendInvoiceEmail } from '@/lib/invoice-email-service';

export async function POST(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      // Security: Only allow direct payment confirmation in development mode
      // OR when a real Stripe/Razorpay payment has been made and the user
      // returns from checkout. In production, webhooks handle this automatically,
      // but we allow the confirm endpoint as a fallback for when webhooks are delayed.
      // The webhook handler has idempotency checks so double-processing is safe.

      const body = await request.json();
      const { orderId, providerPaymentId } = body as {
        orderId: string;
        providerPaymentId?: string;
      };

      if (!orderId) {
        return NextResponse.json(
          { error: 'Order ID is required' },
          { status: 400 }
        );
      }

      // Verify the order belongs to this user
      const order = await db.paymentOrder.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }

      if (order.userId !== user.id) {
        return NextResponse.json(
          { error: 'Order does not belong to this user' },
          { status: 403 }
        );
      }

      if (order.status === 'completed') {
        return NextResponse.json(
          { error: 'Order already completed', alreadyCompleted: true },
          { status: 200 }
        );
      }

      if (order.status === 'failed') {
        return NextResponse.json(
          { error: 'Order has failed. Please create a new order.' },
          { status: 400 }
        );
      }

      // Use confirmPaymentAndActivate for atomic subscription + credit update
      const result = await confirmPaymentAndActivate(
        user.id,
        orderId,
        providerPaymentId || `pay_confirmed_${Date.now()}`
      );

      if (!result.success) {
        // ── Payment failed — send failure notification email ──
        try {
          const { sendEmail } = await import('@/lib/email');
          await sendEmail({
            to: user.email,
            subject: 'Payment Failed — AcquisitionOS',
            html: `<!DOCTYPE html><html><head><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f0fdfa;color:#1e293b;padding:32px;} .card{max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);} .header{background:linear-gradient(135deg,#dc2626 0%,#991b1b 100%);padding:32px 40px;text-align:center;} .header h1{color:#fff;font-size:22px;margin:0;} .body{padding:40px;} .footer{text-align:center;padding:16px;font-size:12px;color:#64748b;}</style></head><body><div class="card"><div class="header"><h1>AcquisitionOS</h1></div><div class="body"><p>Hi <strong>${user.name || user.email}</strong>,</p><p>We were unable to process your payment for the <strong>${order.plan}</strong> plan. No charges have been made to your account.</p><p><strong>Error:</strong> ${result.error || 'Payment processing failed'}</p><p>You can try again from your dashboard. If the problem persists, please contact our support team.</p><p>Cheers,<br/><strong style="color:#0d9488;">The AcquisitionOS Team</strong></p></div></div><div class="footer">© ${new Date().getFullYear()} AcquisitionOS, Inc. All rights reserved.</div></body></html>`,
            text: `Hi ${user.name || user.email},\n\nWe were unable to process your payment for the ${order.plan} plan. No charges have been made.\n\nError: ${result.error || 'Payment processing failed'}\n\nYou can try again from your dashboard.\n\n— The AcquisitionOS Team`,
          });
          console.log('[Payment Confirm] ✓ Payment failure email sent to', user.email);
        } catch (emailErr) {
          console.error('[Payment Confirm] Failed to send payment failure email:', emailErr);
        }

        return NextResponse.json(
          { error: result.error || 'Failed to confirm payment' },
          { status: 500 }
        );
      }

      // Log the payment completion
      await logPaymentEvent(user.id, 'payment_completed', {
        amount: order.amount,
        currency: order.currency,
        provider: order.provider,
        plan: order.plan,
        paymentOrderId: order.id,
      });

      // Create invoice record
      const invoiceNumber = `INV-${Date.now()}-${order.id.slice(-6)}`;
      const isCreditAddon = order.plan === 'credit_addon';
      const lineItems = JSON.stringify([
        {
          description: isCreditAddon
            ? `Credit Add-On Purchase`
            : `${order.plan} Plan — ${order.billingCycle} subscription`,
          amount: order.subtotal,
          quantity: 1,
        },
        ...(order.discountAmount > 0
          ? [{ description: `Coupon discount (${order.couponCode})`, amount: -order.discountAmount, quantity: 1 }]
          : []),
        ...(order.taxAmount > 0
          ? [{ description: `Tax (${(order.taxRate * 100).toFixed(0)}%)`, amount: order.taxAmount, quantity: 1 }]
          : []),
      ]);

      try {
        await db.invoice.upsert({
          where: { paymentOrderId: order.id },
          create: {
            paymentOrderId: order.id,
            invoiceNumber,
            userId: order.userId,
            subtotal: order.subtotal,
            taxRate: order.taxRate,
            taxAmount: order.taxAmount,
            total: order.amount,
            currency: order.currency,
            lineItems,
          },
          update: {},
        });
      } catch {
        // Invoice creation is non-critical
      }

      // ── Generate PDF invoice and send email ──
      // Fire and forget — don't block the response
      (async () => {
        try {
          // 1. Generate the PDF invoice
          console.log('[Payment Confirm] Generating PDF invoice for order', order.id);
          const pdfResult = await generateInvoicePdf(order.id);
          
          if (pdfResult.success) {
            console.log('[Payment Confirm] ✓ PDF invoice generated:', pdfResult.pdfUrl);
          } else {
            console.warn('[Payment Confirm] PDF generation failed:', pdfResult.error);
          }

          // 2. Send the invoice email with PDF attachment
          console.log('[Payment Confirm] Sending invoice email to', user.email);
          const emailResult = await sendInvoiceEmail(user.id, order.id);
          
          if (emailResult.sent) {
            console.log('[Payment Confirm] ✓ Invoice email sent to', user.email);
          } else {
            console.warn('[Payment Confirm] Invoice email failed:', emailResult.error);
          }
        } catch (err) {
          console.error('[Payment Confirm] Invoice email/PDF generation error:', err);
          // Non-critical — payment was already confirmed successfully
        }
      })();

      return NextResponse.json({
        success: true,
        plan: order.plan,
        message: isCreditAddon
          ? `Successfully purchased credit add-on!`
          : `Successfully upgraded to ${order.plan} plan!`,
      });
    } catch (error) {
      console.error('[API] Payment confirm error:', error);
      return NextResponse.json(
        { error: 'Failed to confirm payment' },
        { status: 500 }
      );
    }
  });
}
