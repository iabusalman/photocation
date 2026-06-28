import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { env } from '../env';
import { requireAuth } from '../middleware/auth';
import { badRequest, forbidden, notFound } from '../lib/http';
import { checkoutAmount, getPlan, isPaidPlan } from '../services/plans';
import { fetchPayment, MoyasarPayment } from '../services/moyasar';
import { reconcileSubscription, activateSubscription } from '../services/subscriptions';
import { createOrder, captureOrder, halalasToUsd } from '../services/paypal';

export const paymentsRouter = Router();

// GET /api/payments/subscription — the user's current subscription (active
// preferred, else the most recent), for the dashboard.
paymentsRouter.get('/subscription', requireAuth, async (req, res, next) => {
  try {
    const active = await prisma.subscription.findFirst({
      where: { userId: req.user!.sub, status: 'active' },
      orderBy: { createdAt: 'desc' },
    });
    const sub =
      active ??
      (await prisma.subscription.findFirst({
        where: { userId: req.user!.sub },
        orderBy: { createdAt: 'desc' },
      }));

    if (!sub) return res.json({ subscription: null });
    res.json({
      subscription: {
        id: sub.id,
        plan: sub.plan,
        billing: sub.billing,
        status: sub.status,
        amountHalalas: sub.amountHalalas,
        currency: sub.currency,
        currentPeriodEnd: sub.currentPeriodEnd,
        createdAt: sub.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/payments/cancel — cancel the user's subscription and revert to free.
paymentsRouter.post('/cancel', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user!.sub;
    await prisma.subscription.updateMany({
      where: { userId, status: 'active' },
      data: { status: 'cancelled' },
    });
    await prisma.user.update({
      where: { id: userId },
      data: { plan: 'free', usageCount: 0, usageResetAt: null },
    });
    res.json({ cancelled: true, plan: 'free' });
  } catch (err) {
    next(err);
  }
});

const subscribeSchema = z.object({
  plan: z.enum(['starter', 'pro']),
  billing: z.enum(['monthly', 'annual']),
});

/**
 * POST /api/payments/subscribe
 * Create a pending subscription and return what the frontend Moyasar form needs
 * (amount, publishable key, callback url, metadata).
 */
paymentsRouter.post('/subscribe', requireAuth, async (req, res, next) => {
  try {
    const { plan, billing } = subscribeSchema.parse(req.body);
    if (!isPaidPlan(plan)) throw badRequest('Plan is not purchasable');

    const planConfig = await getPlan(plan);
    const amount = checkoutAmount(planConfig, billing);
    if (amount <= 0) throw badRequest('Plan is not purchasable');
    const sub = await prisma.subscription.create({
      data: {
        userId: req.user!.sub,
        plan,
        billing,
        status: 'pending',
        amountHalalas: amount,
      },
    });

    res.json({
      subscriptionId: sub.id,
      publishableKey: env.MOYASAR_PUBLISHABLE_KEY ?? null,
      amount,
      currency: 'SAR',
      description: `Photocation — اشتراك ${plan} (${billing})`,
      callbackUrl: env.PAYMENT_CALLBACK_URL,
      metadata: { subscriptionId: sub.id },
    });
  } catch (err) {
    next(err);
  }
});

const verifySchema = z.object({
  id: z.string().min(1), // Moyasar payment id
  subscriptionId: z.string().min(1),
});

/**
 * GET /api/payments/verify?id=&subscriptionId=
 * Authoritative post-redirect verification. Fetches the payment from Moyasar
 * and activates the subscription. Idempotent.
 */
paymentsRouter.get('/verify', requireAuth, async (req, res, next) => {
  try {
    const { id, subscriptionId } = verifySchema.parse(req.query);
    const sub = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });
    if (!sub) throw notFound('Subscription not found');
    if (sub.userId !== req.user!.sub) throw forbidden();

    const payment = await fetchPayment(id);
    const result = await reconcileSubscription(payment, subscriptionId);

    res.json({
      activated: result.activated,
      status: result.subscription.status,
      plan: result.subscription.plan,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/payments/webhook
 * Public endpoint invoked by Moyasar. Authenticity is verified via the shared
 * secret token configured on the webhook.
 */
paymentsRouter.post('/webhook', async (req, res, next) => {
  try {
    const expected = env.MOYASAR_WEBHOOK_SECRET;
    const provided =
      (req.body?.secret_token as string | undefined) ??
      (req.headers['x-moyasar-token'] as string | undefined);
    if (!expected || provided !== expected) {
      throw forbidden('Invalid webhook signature');
    }

    const payment = (req.body?.data ?? req.body) as MoyasarPayment;
    if (!payment?.id) throw badRequest('Webhook missing payment data');

    await reconcileSubscription(payment);
    res.json({ received: true });
  } catch (err) {
    next(err);
  }
});

// ── PayPal ─────────────────────────────────────────────────
async function loadOwnedPendingSub(subscriptionId: string, userId: string) {
  const sub = await prisma.subscription.findUnique({ where: { id: subscriptionId } });
  if (!sub) throw notFound('Subscription not found');
  if (sub.userId !== userId) throw forbidden();
  return sub;
}

const paypalCreateSchema = z.object({ subscriptionId: z.string().min(1) });

/**
 * POST /api/payments/paypal/create-order
 * Create a PayPal order for a pending subscription. Amount is converted from
 * SAR to USD (PayPal has no SAR). Returns the PayPal order id.
 */
paymentsRouter.post('/paypal/create-order', requireAuth, async (req, res, next) => {
  try {
    const { subscriptionId } = paypalCreateSchema.parse(req.body);
    const sub = await loadOwnedPendingSub(subscriptionId, req.user!.sub);
    if (sub.status === 'active') throw badRequest('Subscription already active');

    const usd = halalasToUsd(sub.amountHalalas);
    const order = await createOrder(
      usd,
      `Photocation — اشتراك ${sub.plan} (${sub.billing})`,
      subscriptionId,
    );
    res.json({ orderId: order.id, amountUsd: usd });
  } catch (err) {
    next(err);
  }
});

const paypalCaptureSchema = z.object({
  orderId: z.string().min(1),
  subscriptionId: z.string().min(1),
});

/**
 * POST /api/payments/paypal/capture
 * Capture an approved PayPal order, verify it server-side (status, custom_id,
 * amount), then activate the subscription.
 */
paymentsRouter.post('/paypal/capture', requireAuth, async (req, res, next) => {
  try {
    const { orderId, subscriptionId } = paypalCaptureSchema.parse(req.body);
    const sub = await loadOwnedPendingSub(subscriptionId, req.user!.sub);

    const order = await captureOrder(orderId);
    const unit = order.purchase_units?.[0];
    const capture = unit?.payments?.captures?.[0];

    const expectedUsd = halalasToUsd(sub.amountHalalas);
    const ok =
      order.status === 'COMPLETED' &&
      unit?.custom_id === subscriptionId &&
      capture?.status === 'COMPLETED' &&
      capture?.amount?.currency_code === 'USD' &&
      capture?.amount?.value === expectedUsd;

    if (!ok) throw badRequest('PayPal payment could not be verified', order);

    const updated = await activateSubscription(subscriptionId, order);
    res.json({ activated: true, status: updated.status, plan: updated.plan });
  } catch (err) {
    next(err);
  }
});
