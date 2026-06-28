import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { env } from '../env';
import { requireAuth } from '../middleware/auth';
import { badRequest, forbidden, notFound } from '../lib/http';
import { checkoutAmount, getPlan, isPaidPlan } from '../services/plans';
import { fetchPayment, MoyasarPayment } from '../services/moyasar';
import { reconcileSubscription } from '../services/subscriptions';

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
