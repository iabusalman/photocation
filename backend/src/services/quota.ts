import { User } from '@prisma/client';
import { prisma } from '../prisma';
import { PLANS, PlanId } from './plans';

export interface QuotaState {
  plan: PlanId;
  used: number;
  limit: number;
  remaining: number;
  resetAt: Date | null;
}

function planOf(user: User): PlanId {
  return (user.plan as PlanId) in PLANS ? (user.plan as PlanId) : 'free';
}

/**
 * Returns the user's current quota, rolling the usage window over if a
 * resetting plan's window has elapsed (persisted lazily on read).
 */
export async function getQuota(user: User): Promise<QuotaState> {
  const plan = PLANS[planOf(user)];
  let used = user.usageCount;
  let resetAt = user.usageResetAt;

  if (plan.resets && resetAt && resetAt.getTime() <= Date.now()) {
    // Window elapsed — reset the counter and schedule the next window.
    resetAt = new Date(Date.now() + 30 * 24 * 3600 * 1000);
    used = 0;
    await prisma.user.update({
      where: { id: user.id },
      data: { usageCount: 0, usageResetAt: resetAt },
    });
  }

  return {
    plan: plan.id,
    used,
    limit: plan.quota,
    remaining: Math.max(0, plan.quota - used),
    resetAt,
  };
}

/** Atomically increments usage after a successful analysis. */
export async function consumeQuota(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { usageCount: { increment: 1 } },
  });
}
