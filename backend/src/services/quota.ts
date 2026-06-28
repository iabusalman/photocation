import { User } from '@prisma/client';
import { prisma } from '../prisma';
import { getPlan } from './plans';

export interface QuotaState {
  plan: string;
  used: number;
  limit: number;
  remaining: number;
  resetAt: Date | null;
}

/**
 * Returns the user's current quota, rolling the usage window over if the
 * window has elapsed (persisted lazily on read).
 */
export async function getQuota(user: User): Promise<QuotaState> {
  const plan = await getPlan(user.plan);
  let used = user.usageCount;
  let resetAt = user.usageResetAt;

  // Start a fresh window when none is set (new user) or the current one elapsed.
  const elapsed = !resetAt || resetAt.getTime() <= Date.now();
  if (elapsed) {
    resetAt = new Date(Date.now() + plan.windowDays * 24 * 3600 * 1000);
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
