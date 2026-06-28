import { prisma } from '../prisma';
import { badRequest, notFound } from '../lib/http';
import { MoyasarPayment, isPaidStatus } from './moyasar';
import { Billing, PlanId } from './plans';

/**
 * Reconcile a Moyasar payment against a pending subscription. On a verified,
 * amount-matching payment the subscription is activated and the user's plan
 * (and usage window) are updated. Idempotent.
 */
export async function reconcileSubscription(
  payment: MoyasarPayment,
  explicitSubscriptionId?: string,
) {
  const subscriptionId =
    explicitSubscriptionId ??
    (payment.metadata?.subscriptionId as string | undefined);
  if (!subscriptionId) throw badRequest('Payment has no subscription reference');

  const sub = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  });
  if (!sub) throw notFound('Subscription not found');

  const paid = isPaidStatus(payment.status);
  const amountMatches =
    payment.amount === sub.amountHalalas &&
    payment.currency?.toUpperCase() === sub.currency.toUpperCase();

  const activated = paid && amountMatches;
  const billing = sub.billing as Billing;
  const periodEnd = new Date(
    Date.now() + (billing === 'annual' ? 365 : 30) * 24 * 3600 * 1000,
  );

  const updatedSub = await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      moyasarId: payment.id,
      status: activated ? 'active' : 'pending',
      currentPeriodEnd: activated ? periodEnd : sub.currentPeriodEnd,
      rawResponse: JSON.stringify(payment),
    },
  });

  if (activated) {
    await prisma.user.update({
      where: { id: sub.userId },
      data: {
        plan: sub.plan as PlanId,
        usageCount: 0,
        // Reset to null so getQuota() starts a fresh monthly usage window;
        // the billing renewal date lives on the subscription (currentPeriodEnd).
        usageResetAt: null,
      },
    });
  }

  return { subscription: updatedSub, activated, amountMatches };
}

/**
 * Activate a subscription by id (used by gateways other than Moyasar, e.g.
 * PayPal, after the payment is verified server-side). Idempotent.
 */
export async function activateSubscription(
  subscriptionId: string,
  raw: unknown,
) {
  const sub = await prisma.subscription.findUnique({ where: { id: subscriptionId } });
  if (!sub) throw notFound('Subscription not found');

  const billing = sub.billing as Billing;
  const periodEnd = new Date(
    Date.now() + (billing === 'annual' ? 365 : 30) * 24 * 3600 * 1000,
  );

  const updatedSub = await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      status: 'active',
      currentPeriodEnd: periodEnd,
      rawResponse: JSON.stringify(raw),
    },
  });

  await prisma.user.update({
    where: { id: sub.userId },
    data: { plan: sub.plan as PlanId, usageCount: 0, usageResetAt: null },
  });

  return updatedSub;
}
