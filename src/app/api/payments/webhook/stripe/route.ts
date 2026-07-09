// ═══════════════════════════════════════════════════════════════════
// AcquisitionOS — POST /api/payments/webhook/stripe
// Handles Stripe payment webhooks:
//   - checkout.session.completed: Confirms payment, activates subscription, adds credits
//   - checkout.session.expired: Marks order as failed
//   - charge.refunded: Handles refunds, downgrades plan on full refund
//   - customer.subscription.updated: Syncs subscription changes from Stripe
//   - customer.subscription.deleted: Handles subscription cancellation
//   - invoice.payment_succeeded: Handles renewal payments
//   - invoice.payment_failed: Handles failed renewal payments
// Uses PaymentWebhook table for idempotency and confirmPaymentAndActivate
// from subscription-service for atomic subscription + credit updates.
// ═══════════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { confirmPaymentAndActivate } from '@/lib/subscription-service';
import { logPaymentEvent, logSubscriptionEvent, logCreditEvent } from '@/lib/billing-audit';
import { PLAN_CREDITS, type PlanType } from '@/lib/entitlement-service';
import { incrementCouponUsage } from '@/lib/coupon-service';
import { resetMonthlyCredits } from '@/lib/credit-service';
import { generateInvoicePdf } from '@/lib/invoice-pdf-service';
import { sendInvoiceEmail } from '@/lib/invoice-email-service';
import { sendPaymentNotification } from '@/lib/payment-notification-service';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const sigHeader = request.headers.get('stripe-signature');

    // Verify Stripe webhook signature if secret is configured
    // Detect placeholder secrets like "whsec_YOUR_STRIPE_WEBHOOK_SECRET"
    const isPlaceholderSecret = !process.env.STRIPE_WEBHOOK_SECRET ||
      process.env.STRIPE_WEBHOOK_SECRET.includes('YOUR_') ||
      process.env.STRIPE_WEBHOOK_SECRET === 'whsec_YOUR_STRIPE_WEBHOOK_SECRET';

    let event;
    if (!isPlaceholderSecret && process.env.STRIPE_WEBHOOK_SECRET && sigHeader) {
      try {
        const Stripe = (await import('stripe')).default;
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
        event = stripe.webhooks.constructEvent(
          body,
          sigHeader,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } catch (err) {
        console.error('[Stripe Webhook] Signature verification failed:', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    } else if (sigHeader && !isPlaceholderSecret) {
      // Signature header present but no secret configured in prod
      console.error('[Stripe Webhook] CRITICAL: Missing webhook secret in production');
      return NextResponse.json({ error: 'Webhook verification not configured' }, { status: 500 });
    } else {
      // Dev mode OR placeholder secret — parse directly without verification
      try {
        event = JSON.parse(body);
      } catch {
        return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
      }
      if (isPlaceholderSecret) {
        console.warn('[Stripe Webhook] Placeholder webhook secret detected — skipping signature verification. Configure STRIPE_WEBHOOK_SECRET for production.');
      } else {
        console.warn('[Stripe Webhook] No webhook secret configured — skipping signature verification (dev mode)');
      }
    }

    const eventType = event.type;
    const eventId = event.id || `stripe_${Date.now()}`;

    // Idempotency check using PaymentWebhook table
    const existingWebhook = await db.paymentWebhook.findUnique({
      where: { eventId },
    });

    if (existingWebhook) {
      if (existingWebhook.processed) {
        return NextResponse.json({ success: true, message: 'Already processed' });
      }
      // If not processed but exists (errored before), continue processing
    }

    // Record webhook receipt
    await db.paymentWebhook.upsert({
      where: { eventId },
      create: {
        eventId,
        provider: 'stripe',
        eventType,
        payload: body,
        signature: sigHeader || null,
        processed: false,
      },
      update: {
        payload: body,
        signature: sigHeader || null,
      },
    });

    // ═══════════════════════════════════════════════════════════
    // Handle checkout.session.completed
    // ═══════════════════════════════════════════════════════════
    if (eventType === 'checkout.session.completed') {
      const session = event.data.object;

      // Find the order — either by metadata.orderId or by providerOrderId
      let order: Awaited<ReturnType<typeof db.paymentOrder.findUnique>> = null;

      // First try: metadata contains order_id (snake_case as set by create-order)
      if (session.metadata?.order_id) {
        order = await db.paymentOrder.findUnique({
          where: { id: session.metadata.order_id },
        });
      }

      // Second try: find by providerOrderId (checkout session ID)
      if (!order && session.id) {
        order = await db.paymentOrder.findFirst({
          where: { providerOrderId: session.id },
        });
      }

      // Third try: find by user_id + plan + pending status
      if (!order && session.metadata?.user_id && session.metadata?.plan) {
        order = await db.paymentOrder.findFirst({
          where: {
            userId: session.metadata.user_id,
            plan: session.metadata.plan,
            status: 'pending',
            provider: 'stripe',
          },
          orderBy: { createdAt: 'desc' },
        });
      }

      if (!order) {
        console.error('[Stripe Webhook] No matching payment order found for session:', session.id);
        await db.paymentWebhook.update({
          where: { eventId },
          data: {
            processingError: 'No matching payment order found',
            paymentOrderId: null,
          },
        });
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      if (order.status === 'completed') {
        await db.paymentWebhook.update({
          where: { eventId },
          data: {
            processed: true,
            processedAt: new Date(),
            paymentOrderId: order.id,
          },
        });
        return NextResponse.json({ success: true, message: 'Already processed' });
      }

      // Verify payment amount matches order amount to prevent amount manipulation
      const sessionAmountTotal = session.amount_total ? session.amount_total / 100 : 0;
      if (sessionAmountTotal > 0 && Math.abs(sessionAmountTotal - order.amount) > 0.01) {
        console.error(`[Stripe Webhook] Amount mismatch: session=${sessionAmountTotal}, order=${order.amount}`);
        await db.paymentWebhook.update({
          where: { eventId },
          data: {
            processingError: `Amount mismatch: expected ${order.amount}, got ${sessionAmountTotal}`,
            paymentOrderId: order.id,
          },
        });
        return NextResponse.json({ error: 'Amount verification failed' }, { status: 400 });
      }

      // Use confirmPaymentAndActivate for atomic subscription + credit update
      const providerPaymentId = session.payment_intent?.toString() || session.id;
      const result = await confirmPaymentAndActivate(
        order.userId,
        order.id,
        providerPaymentId
      );

      if (!result.success) {
        console.error('[Stripe Webhook] confirmPaymentAndActivate failed:', result.error);
        await db.paymentWebhook.update({
          where: { eventId },
          data: {
            processingError: result.error || 'Failed to confirm payment',
            paymentOrderId: order.id,
          },
        });
        return NextResponse.json({ error: 'Payment activation failed' }, { status: 500 });
      }

      // ── Credit Add-On specific handling ─────────────────────────
      if (order.plan === 'credit_addon') {
        // For credit add-ons, skip subscription update and use add-on notification
        const addonCredits = session.metadata?.addon_credits ? parseInt(session.metadata.addon_credits, 10) : 0;

        await db.notification.create({
          data: {
            userId: order.userId,
            type: 'payment_success',
            title: 'Credit Add-On Purchased!',
            message: `Your ${addonCredits} credit add-on has been added to your account. Credits never expire!`,
            actionUrl: '/dashboard',
          },
        });

        await logPaymentEvent(order.userId, 'payment_completed', {
          amount: order.amount,
          currency: order.currency,
          provider: 'stripe',
          plan: 'credit_addon',
          addonCredits,
          paymentOrderId: order.id,
        });

        // Generate invoice PDF + send email for addon
        try {
          const pdfResult = await generateInvoicePdf(order.id);
          if (pdfResult.success) {
            console.log(`[Stripe Webhook] ✓ Addon PDF invoice generated: ${pdfResult.pdfUrl}`);
          }
        } catch (pdfErr) {
          console.error('[Stripe Webhook] ✗ Addon invoice PDF error:', pdfErr);
        }

        try {
          const emailResult = await sendInvoiceEmail(order.userId, order.id);
          if (emailResult?.sent) {
            console.log(`[Stripe Webhook] ✓ Addon invoice email sent to user ${order.userId}`);
          }
        } catch (emailErr) {
          console.error('[Stripe Webhook] ✗ Addon invoice email error:', emailErr);
        }

        // Mark webhook as processed
        await db.paymentWebhook.update({
          where: { eventId },
          data: {
            processed: true,
            processedAt: new Date(),
            paymentOrderId: order.id,
          },
        });

        return NextResponse.json({ success: true });
      }

      // Increment coupon usage now that payment has succeeded
      if (order.couponCode) {
        try {
          await incrementCouponUsage(order.couponCode);
        } catch (couponErr) {
          // Non-critical — don't block the main flow
          console.error('[Stripe Webhook] Failed to increment coupon usage (non-critical):', couponErr);
        }
      }

      // Update subscription with Stripe-specific fields
      const subscription = await db.subscription.findFirst({
        where: { userId: order.userId, status: 'active' },
      });

      if (subscription && session.subscription) {
        await db.subscription.update({
          where: { id: subscription.id },
          data: {
            stripeSubscriptionId: session.subscription.toString(),
            stripeCustomerId: session.customer?.toString() || null,
          },
        });
      }

      // Generate PDF invoice + create Invoice DB record + send email (BLOCKING)
      // generateInvoicePdf() handles both DB record creation and PDF generation
      // to avoid duplicate invoice numbering issues
      try {
        console.log(`[Stripe Webhook] Starting invoice PDF generation for order ${order.id}...`);
        const pdfResult = await generateInvoicePdf(order.id);
        if (pdfResult.success) {
          console.log(`[Stripe Webhook] ✓ PDF invoice generated: ${pdfResult.pdfUrl}`);
        } else {
          console.error('[Stripe Webhook] ✗ PDF generation failed:', pdfResult.error);
        }
      } catch (pdfErr) {
        console.error('[Stripe Webhook] ✗ Invoice PDF generation error (will retry email without PDF):', pdfErr);
      }

      // Send invoice email (with or without PDF attachment)
      try {
        console.log(`[Stripe Webhook] Sending invoice email to user ${order.userId}...`);
        const emailResult = await sendInvoiceEmail(order.userId, order.id);
        if (emailResult?.sent) {
          console.log(`[Stripe Webhook] ✓ Invoice email sent to user ${order.userId}`);
        } else {
          console.error('[Stripe Webhook] ✗ Invoice email failed:', emailResult?.error);
        }
      } catch (emailErr) {
        console.error('[Stripe Webhook] ✗ Invoice email error:', emailErr);
      }

      // Create a notification for the user
      const planCredits = PLAN_CREDITS[order.plan as PlanType] || PLAN_CREDITS.free;
      await db.notification.create({
        data: {
          userId: order.userId,
          type: 'payment_success',
          title: 'Payment Successful',
          message: `Your ${order.plan} plan subscription is now active! ${planCredits} credits have been added to your account.`,
          actionUrl: '/dashboard',
        },
      });

      // Log the payment completion
      await logPaymentEvent(order.userId, 'payment_completed', {
        amount: order.amount,
        currency: order.currency,
        provider: 'stripe',
        plan: order.plan,
        paymentOrderId: order.id,
      });

      // Mark webhook as processed
      await db.paymentWebhook.update({
        where: { eventId },
        data: {
          processed: true,
          processedAt: new Date(),
          paymentOrderId: order.id,
        },
      });
    }

    // ═══════════════════════════════════════════════════════════
    // Handle checkout.session.expired
    // ═══════════════════════════════════════════════════════════
    if (eventType === 'checkout.session.expired') {
      const session = event.data.object;

      // Find the order (metadata uses snake_case as set by create-order)
      let order: Awaited<ReturnType<typeof db.paymentOrder.findUnique>> = null;
      if (session.metadata?.order_id) {
        order = await db.paymentOrder.findUnique({ where: { id: session.metadata.order_id } });
      }
      if (!order && session.id) {
        order = await db.paymentOrder.findFirst({ where: { providerOrderId: session.id } });
      }

      if (order && order.status === 'pending') {
        await db.paymentOrder.update({
          where: { id: order.id },
          data: { status: 'failed' },
        });

        // Send payment failed email notification
        try {
          const user = await db.user.findUnique({ where: { id: order.userId }, select: { email: true, name: true } });
          if (user) {
            await sendPaymentNotification({
              userId: order.userId,
              type: 'payment_failed',
              email: user.email,
              name: user.name || undefined,
              plan: order.plan,
              amount: order.amount,
              currency: order.currency,
              failureReason: 'Checkout session expired',
            });
          }
        } catch (emailErr) {
          console.error('[Stripe Webhook] Failed to send payment_failed email:', emailErr);
        }

        await logPaymentEvent(order.userId, 'payment_failed', {
          amount: order.amount,
          currency: order.currency,
          provider: 'stripe',
          plan: order.plan,
          paymentOrderId: order.id,
          reason: 'Checkout session expired',
        });
      }

      await db.paymentWebhook.update({
        where: { eventId },
        data: {
          processed: true,
          processedAt: new Date(),
          paymentOrderId: order?.id || null,
        },
      });
    }

    // ═══════════════════════════════════════════════════════════
    // Handle charge.refunded
    // ═══════════════════════════════════════════════════════════
    if (eventType === 'charge.refunded') {
      const charge = event.data.object;
      const paymentIntentId = charge.payment_intent?.toString();

      if (!paymentIntentId) {
        console.error('[Stripe Webhook] charge.refunded: No payment_intent on charge');
        await db.paymentWebhook.update({
          where: { eventId },
          data: { processingError: 'No payment_intent on charge', processed: true, processedAt: new Date() },
        });
        return NextResponse.json({ success: true });
      }

      // Find the payment order by providerPaymentId (which stores the payment_intent)
      const order = await db.paymentOrder.findFirst({
        where: { providerPaymentId: paymentIntentId },
      });

      if (!order) {
        console.error('[Stripe Webhook] charge.refunded: No matching order for payment_intent:', paymentIntentId);
        await db.paymentWebhook.update({
          where: { eventId },
          data: { processingError: 'No matching payment order found', processed: true, processedAt: new Date() },
        });
        return NextResponse.json({ success: true });
      }

      // Idempotency: skip if already refunded
      if (order.status === 'refunded') {
        await db.paymentWebhook.update({
          where: { eventId },
          data: { processed: true, processedAt: new Date(), paymentOrderId: order.id },
        });
        return NextResponse.json({ success: true, message: 'Already processed' });
      }

      // Determine if this is a full or partial refund
      const refundAmount = charge.amount_refunded ? charge.amount_refunded / 100 : order.amount;
      const isFullRefund = refundAmount >= order.amount;

      // Update order status
      await db.paymentOrder.update({
        where: { id: order.id },
        data: { status: 'refunded' },
      });

      // If full refund, downgrade subscription to free
      if (isFullRefund) {
        const subscription = await db.subscription.findFirst({
          where: { userId: order.userId, status: { in: ['active', 'trialing', 'past_due'] } },
        });

        if (subscription) {
          const previousPlan = subscription.plan;
          await db.subscription.update({
            where: { id: subscription.id },
            data: { status: 'expired', plan: 'free' },
          });

          await logSubscriptionEvent(order.userId, 'subscription_expired', {
            fromPlan: previousPlan,
            toPlan: 'free',
            fromStatus: subscription.status,
            toStatus: 'expired',
          });
        }

        // Downgrade user to free plan
        const freeCredits = PLAN_CREDITS.free;
        await db.user.update({
          where: { id: order.userId },
          data: {
            plan: 'free',
            isTrial: false,
            credits: freeCredits,
            creditsMonthly: freeCredits,
            rolloverCredits: 0,
          },
        });

        // Create credit ledger entry (negative adjustment)
        await db.creditsLedger.create({
          data: {
            userId: order.userId,
            action: 'refund_adjustment',
            credits: -order.amount,
            balance: freeCredits,
            description: `Credits adjusted due to full refund for ${order.plan} plan order`,
            referenceId: order.id,
          },
        });

        await logCreditEvent(order.userId, 'credits_refunded', {
          amount: freeCredits,
          balance: freeCredits,
          source: 'stripe_refund',
          referenceId: order.id,
        });
      }

      // Create notification for the user
      await db.notification.create({
        data: {
          userId: order.userId,
          type: 'payment_refunded',
          title: 'Payment Refunded',
          message: isFullRefund
            ? `A full refund has been processed for your ${order.plan} plan subscription. Your account has been downgraded to the free plan.`
            : `A partial refund of ${refundAmount} ${order.currency} has been processed for your ${order.plan} plan.`,
          actionUrl: '/dashboard',
        },
      });

      // Log the refund event
      await logPaymentEvent(order.userId, 'payment_refunded', {
        amount: refundAmount,
        currency: order.currency,
        provider: 'stripe',
        plan: order.plan,
        paymentOrderId: order.id,
        reason: isFullRefund ? 'Full refund' : 'Partial refund',
      });

      await db.paymentWebhook.update({
        where: { eventId },
        data: { processed: true, processedAt: new Date(), paymentOrderId: order.id },
      });
    }

    // ═══════════════════════════════════════════════════════════
    // Handle customer.subscription.updated
    // ═══════════════════════════════════════════════════════════
    if (eventType === 'customer.subscription.updated') {
      const stripeSub = event.data.object;
      const stripeSubscriptionId = stripeSub.id?.toString();

      if (!stripeSubscriptionId) {
        console.error('[Stripe Webhook] customer.subscription.updated: No subscription ID');
        await db.paymentWebhook.update({
          where: { eventId },
          data: { processingError: 'No subscription ID on event', processed: true, processedAt: new Date() },
        });
        return NextResponse.json({ success: true });
      }

      const subscription = await db.subscription.findFirst({
        where: { stripeSubscriptionId },
      });

      if (!subscription) {
        console.error('[Stripe Webhook] customer.subscription.updated: No matching subscription for stripeSubscriptionId:', stripeSubscriptionId);
        await db.paymentWebhook.update({
          where: { eventId },
          data: { processingError: 'No matching subscription found', processed: true, processedAt: new Date() },
        });
        return NextResponse.json({ success: true });
      }

      // Map Stripe status to our status
      const statusMap: Record<string, string> = {
        active: 'active',
        trialing: 'trialing',
        past_due: 'past_due',
        canceled: 'canceled',
        unpaid: 'expired',
        incomplete: 'past_due',
        incomplete_expired: 'expired',
        paused: 'canceled',
      };
      const newStatus = statusMap[stripeSub.status] || subscription.status;

      // Determine plan from Stripe price/product metadata or items
      // Stripe subscription items contain price info; use metadata.plan if available
      let newPlan = subscription.plan;
      if (stripeSub.metadata?.plan) {
        newPlan = stripeSub.metadata.plan;
      } else if (stripeSub.plan?.metadata?.plan) {
        newPlan = stripeSub.plan.metadata.plan;
      }

      const previousPlan = subscription.plan;
      const previousStatus = subscription.status;

      // Update subscription
      const updateData: Record<string, unknown> = {
        status: newStatus,
        plan: newPlan,
      };

      if (stripeSub.current_period_start) {
        updateData.currentPeriodStart = new Date(stripeSub.current_period_start * 1000);
      }
      if (stripeSub.current_period_end) {
        updateData.currentPeriodEnd = new Date(stripeSub.current_period_end * 1000);
      }
      if (typeof stripeSub.cancel_at_period_end === 'boolean') {
        updateData.cancelAtPeriodEnd = stripeSub.cancel_at_period_end;
      }

      await db.subscription.update({
        where: { id: subscription.id },
        data: updateData,
      });

      // If plan changed, update user record
      if (newPlan !== previousPlan) {
        const planCredits = PLAN_CREDITS[newPlan as PlanType] || PLAN_CREDITS.free;
        await db.user.update({
          where: { id: subscription.userId },
          data: { plan: newPlan, creditsMonthly: planCredits },
        });
      }

      // Log the subscription update
      await logSubscriptionEvent(subscription.userId, 'plan_change_processed', {
        fromPlan: previousPlan,
        toPlan: newPlan,
        fromStatus: previousStatus,
        toStatus: newStatus,
      });

      await db.paymentWebhook.update({
        where: { eventId },
        data: { processed: true, processedAt: new Date() },
      });
    }

    // ═══════════════════════════════════════════════════════════
    // Handle customer.subscription.deleted
    // ═══════════════════════════════════════════════════════════
    if (eventType === 'customer.subscription.deleted') {
      const stripeSub = event.data.object;
      const stripeSubscriptionId = stripeSub.id?.toString();

      if (!stripeSubscriptionId) {
        console.error('[Stripe Webhook] customer.subscription.deleted: No subscription ID');
        await db.paymentWebhook.update({
          where: { eventId },
          data: { processingError: 'No subscription ID on event', processed: true, processedAt: new Date() },
        });
        return NextResponse.json({ success: true });
      }

      const subscription = await db.subscription.findFirst({
        where: { stripeSubscriptionId },
      });

      if (!subscription) {
        console.error('[Stripe Webhook] customer.subscription.deleted: No matching subscription for stripeSubscriptionId:', stripeSubscriptionId);
        await db.paymentWebhook.update({
          where: { eventId },
          data: { processingError: 'No matching subscription found', processed: true, processedAt: new Date() },
        });
        return NextResponse.json({ success: true });
      }

      // Idempotency: skip if already expired
      if (subscription.status === 'expired') {
        await db.paymentWebhook.update({
          where: { eventId },
          data: { processed: true, processedAt: new Date() },
        });
        return NextResponse.json({ success: true, message: 'Already processed' });
      }

      const previousPlan = subscription.plan;
      const previousStatus = subscription.status;

      // Set subscription status to expired
      await db.subscription.update({
        where: { id: subscription.id },
        data: { status: 'expired' },
      });

      // Downgrade user to free plan and reset credits
      const freeCredits = PLAN_CREDITS.free;
      await db.user.update({
        where: { id: subscription.userId },
        data: {
          plan: 'free',
          isTrial: false,
          credits: freeCredits,
          creditsMonthly: freeCredits,
          rolloverCredits: 0,
        },
      });

      // Create credit ledger entry
      await db.creditsLedger.create({
        data: {
          userId: subscription.userId,
          action: 'subscription_cancelled',
          credits: freeCredits,
          balance: freeCredits,
          description: `Subscription cancelled — credits reset to free tier (${freeCredits})`,
          referenceId: subscription.id,
        },
      });

      // Create notification
      await db.notification.create({
        data: {
          userId: subscription.userId,
          type: 'subscription_cancelled',
          title: 'Subscription Cancelled',
          message: `Your ${previousPlan} plan subscription has been cancelled. Your account has been downgraded to the free plan.`,
          actionUrl: '/dashboard',
        },
      });

      // Log the event
      await logSubscriptionEvent(subscription.userId, 'subscription_expired', {
        fromPlan: previousPlan,
        toPlan: 'free',
        fromStatus: previousStatus,
        toStatus: 'expired',
      });

      await db.paymentWebhook.update({
        where: { eventId },
        data: { processed: true, processedAt: new Date() },
      });
    }

    // ═══════════════════════════════════════════════════════════
    // Handle invoice.payment_succeeded (renewal)
    // ═══════════════════════════════════════════════════════════
    if (eventType === 'invoice.payment_succeeded') {
      const invoice = event.data.object;
      const stripeSubscriptionId = invoice.subscription?.toString();

      // Only process if this is tied to a subscription (not a one-time payment)
      if (!stripeSubscriptionId) {
        await db.paymentWebhook.update({
          where: { eventId },
          data: { processed: true, processedAt: new Date() },
        });
        return NextResponse.json({ success: true });
      }

      const subscription = await db.subscription.findFirst({
        where: { stripeSubscriptionId },
      });

      if (!subscription) {
        console.error('[Stripe Webhook] invoice.payment_succeeded: No matching subscription for stripeSubscriptionId:', stripeSubscriptionId);
        await db.paymentWebhook.update({
          where: { eventId },
          data: { processingError: 'No matching subscription found', processed: true, processedAt: new Date() },
        });
        return NextResponse.json({ success: true });
      }

      // Reset credits for the new billing period
      await resetMonthlyCredits(subscription.userId, subscription.plan as PlanType);

      // Update period dates
      const updateData: Record<string, unknown> = {};
      if (invoice.period_start) {
        updateData.currentPeriodStart = new Date(invoice.period_start * 1000);
      }
      if (invoice.period_end) {
        updateData.currentPeriodEnd = new Date(invoice.period_end * 1000);
      }
      // Ensure subscription is active after successful renewal
      updateData.status = 'active';

      await db.subscription.update({
        where: { id: subscription.id },
        data: updateData,
      });

      // Log the renewal
      await logPaymentEvent(subscription.userId, 'payment_completed', {
        amount: invoice.total ? invoice.total / 100 : 0,
        currency: invoice.currency || 'usd',
        provider: 'stripe',
        plan: subscription.plan,
        reason: 'Subscription renewal payment',
      });

      // Create notification for renewal
      await db.notification.create({
        data: {
          userId: subscription.userId,
          type: 'payment_success',
          title: 'Renewal Payment Successful',
          message: `Your ${subscription.plan} plan subscription has been renewed successfully. Credits have been reset for the new billing period.`,
          actionUrl: '/dashboard',
        },
      });

      // Try to find associated payment order and generate invoice PDF + email
      try {
        const renewalOrder = await db.paymentOrder.findFirst({
          where: {
            userId: subscription.userId,
            plan: subscription.plan,
            status: 'completed',
          },
          orderBy: { createdAt: 'desc' },
        });

        if (renewalOrder) {
          // Generate renewal invoice PDF (blocking)
          const pdfResult = await generateInvoicePdf(renewalOrder.id);
          if (pdfResult.success) {
            console.log(`[Stripe Webhook] ✓ Renewal invoice PDF generated: ${pdfResult.pdfUrl}`);
          }
          // Send renewal invoice email
          const emailResult = await sendInvoiceEmail(subscription.userId, renewalOrder.id);
          if (emailResult?.sent) {
            console.log(`[Stripe Webhook] ✓ Renewal invoice email sent to user ${subscription.userId}`);
          }
        }
      } catch (invoiceErr) {
        console.error('[Stripe Webhook] Renewal invoice generation failed (non-critical):', invoiceErr);
      }

      await db.paymentWebhook.update({
        where: { eventId },
        data: { processed: true, processedAt: new Date() },
      });
    }

    // ═══════════════════════════════════════════════════════════
    // Handle invoice.payment_failed
    // ═══════════════════════════════════════════════════════════
    if (eventType === 'invoice.payment_failed') {
      const invoice = event.data.object;
      const stripeSubscriptionId = invoice.subscription?.toString();

      // Only process if this is tied to a subscription
      if (!stripeSubscriptionId) {
        await db.paymentWebhook.update({
          where: { eventId },
          data: { processed: true, processedAt: new Date() },
        });
        return NextResponse.json({ success: true });
      }

      const subscription = await db.subscription.findFirst({
        where: { stripeSubscriptionId },
      });

      if (!subscription) {
        console.error('[Stripe Webhook] invoice.payment_failed: No matching subscription for stripeSubscriptionId:', stripeSubscriptionId);
        await db.paymentWebhook.update({
          where: { eventId },
          data: { processingError: 'No matching subscription found', processed: true, processedAt: new Date() },
        });
        return NextResponse.json({ success: true });
      }

      // Set subscription status to past_due
      await db.subscription.update({
        where: { id: subscription.id },
        data: { status: 'past_due' },
      });

      // Create notification for the user
      await db.notification.create({
        data: {
          userId: subscription.userId,
          type: 'payment_failed',
          title: 'Payment Failed',
          message: `We were unable to process your ${subscription.plan} plan renewal payment. Please update your payment method to avoid service interruption.`,
          actionUrl: '/dashboard',
        },
      });

      // Send payment failed email notification
      try {
        const user = await db.user.findUnique({ where: { id: subscription.userId }, select: { email: true, name: true } });
        if (user) {
          await sendPaymentNotification({
            userId: subscription.userId,
            type: 'payment_failed',
            email: user.email,
            name: user.name || undefined,
            plan: subscription.plan,
            amount: invoice.total ? invoice.total / 100 : 0,
            currency: (invoice.currency || 'usd').toUpperCase(),
            failureReason: 'Renewal payment failed',
          });
        }
      } catch (emailErr) {
        console.error('[Stripe Webhook] Failed to send invoice.payment_failed email:', emailErr);
      }

      // Log the event
      await logSubscriptionEvent(subscription.userId, 'subscription_past_due', {
        fromStatus: subscription.status,
        toStatus: 'past_due',
      });

      await logPaymentEvent(subscription.userId, 'payment_failed', {
        amount: invoice.total ? invoice.total / 100 : 0,
        currency: invoice.currency || 'usd',
        provider: 'stripe',
        plan: subscription.plan,
        reason: 'Renewal payment failed',
      });

      await db.paymentWebhook.update({
        where: { eventId },
        data: { processed: true, processedAt: new Date() },
      });
    }

    // For unhandled events, just mark as processed
    const handledEvents = [
      'checkout.session.completed',
      'checkout.session.expired',
      'charge.refunded',
      'customer.subscription.created',
      'customer.subscription.updated',
      'customer.subscription.deleted',
      'invoice.paid',
      'invoice.payment_succeeded',
      'invoice.payment_failed',
      'payment_intent.succeeded',
    ];

    // ═══════════════════════════════════════════════════════════
    // Handle payment_intent.succeeded
    // ═══════════════════════════════════════════════════════════
    if (eventType === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id?.toString();

      if (paymentIntentId) {
        // Find order by providerPaymentId and ensure it's marked completed
        const order = await db.paymentOrder.findFirst({
          where: { providerPaymentId: paymentIntentId },
        });

        if (order && order.status === 'pending') {
          // Payment confirmed via payment_intent — activate subscription
          const result = await confirmPaymentAndActivate(
            order.userId,
            order.id,
            paymentIntentId
          );

          if (result.success) {
            // Generate invoice PDF + send email (BLOCKING to ensure delivery)
            try {
              const pdfResult = await generateInvoicePdf(order.id);
              if (pdfResult.success) {
                console.log(`[Stripe Webhook] ✓ PDF invoice generated via payment_intent: ${pdfResult.pdfUrl}`);
              } else {
                console.error('[Stripe Webhook] ✗ PDF generation failed via payment_intent:', pdfResult.error);
              }
            } catch (pdfErr) {
              console.error('[Stripe Webhook] ✗ Invoice PDF error (payment_intent):', pdfErr);
            }

            try {
              const emailResult = await sendInvoiceEmail(order.userId, order.id);
              if (emailResult?.sent) {
                console.log(`[Stripe Webhook] ✓ Invoice email sent via payment_intent to user ${order.userId}`);
              } else {
                console.error('[Stripe Webhook] ✗ Invoice email failed via payment_intent:', emailResult?.error);
              }
            } catch (emailErr) {
              console.error('[Stripe Webhook] ✗ Invoice email error (payment_intent):', emailErr);
            }

            await logPaymentEvent(order.userId, 'payment_completed', {
              amount: order.amount,
              currency: order.currency,
              provider: 'stripe',
              plan: order.plan,
              paymentOrderId: order.id,
            });
          }
        }
      }

      await db.paymentWebhook.update({
        where: { eventId },
        data: { processed: true, processedAt: new Date() },
      });
    }

    // ═══════════════════════════════════════════════════════════
    // Handle customer.subscription.created
    // ═══════════════════════════════════════════════════════════
    if (eventType === 'customer.subscription.created') {
      const stripeSub = event.data.object;
      const stripeSubscriptionId = stripeSub.id?.toString();
      const stripeCustomerId = stripeSub.customer?.toString();

      if (stripeSubscriptionId && stripeCustomerId) {
        // Find user's existing subscription and update with Stripe IDs
        const userId = stripeSub.metadata?.user_id;
        if (userId) {
          const subscription = await db.subscription.findFirst({
            where: { userId, status: { in: ['trialing', 'active', 'past_due'] } },
          });

          if (subscription) {
            await db.subscription.update({
              where: { id: subscription.id },
              data: {
                stripeSubscriptionId,
                stripeCustomerId,
              },
            });
          }
        }
      }

      await logSubscriptionEvent(stripeSub.metadata?.user_id || 'unknown', 'subscription_created', {
        toStatus: stripeSub.status,
      });

      await db.paymentWebhook.update({
        where: { eventId },
        data: { processed: true, processedAt: new Date() },
      });
    }

    // ═══════════════════════════════════════════════════════════
    // Handle invoice.paid
    // ═══════════════════════════════════════════════════════════
    if (eventType === 'invoice.paid') {
      const stripeInvoice = event.data.object;
      const stripeSubscriptionId = stripeInvoice.subscription?.toString();

      if (stripeSubscriptionId) {
        const subscription = await db.subscription.findFirst({
          where: { stripeSubscriptionId },
        });

        if (subscription) {
          // Reset credits and ensure active status
          await resetMonthlyCredits(subscription.userId, subscription.plan as PlanType);

          const updateData: Record<string, unknown> = { status: 'active' };
          if (stripeInvoice.period_start) {
            updateData.currentPeriodStart = new Date(stripeInvoice.period_start * 1000);
          }
          if (stripeInvoice.period_end) {
            updateData.currentPeriodEnd = new Date(stripeInvoice.period_end * 1000);
          }

          await db.subscription.update({
            where: { id: subscription.id },
            data: updateData,
          });

          // Log the invoice paid event
          await logPaymentEvent(subscription.userId, 'payment_completed', {
            amount: stripeInvoice.total ? stripeInvoice.total / 100 : 0,
            currency: stripeInvoice.currency || 'usd',
            provider: 'stripe',
            plan: subscription.plan,
          });
        }
      }

      await db.paymentWebhook.update({
        where: { eventId },
        data: { processed: true, processedAt: new Date() },
      });
    }
    if (!handledEvents.includes(eventType)) {
      await db.paymentWebhook.update({
        where: { eventId },
        data: {
          processed: true,
          processedAt: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Stripe Webhook] Processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
