import { Prisma, User } from '@prisma/client';
import { prisma } from '../prisma';
import type { VerifiedIdentity } from './google';

/**
 * Finds or creates a user for a verified third-party identity. Matching is on
 * (provider, providerId); email/name/avatar are refreshed on each login.
 */
export async function upsertUserFromIdentity(
  identity: VerifiedIdentity,
): Promise<User> {
  const data: Prisma.UserCreateInput = {
    email: identity.email,
    name: identity.name ?? undefined,
    avatarUrl: identity.avatarUrl ?? undefined,
    provider: identity.provider,
    providerId: identity.providerId,
  };

  return prisma.user.upsert({
    where: {
      provider_providerId: {
        provider: identity.provider,
        providerId: identity.providerId,
      },
    },
    create: data,
    update: {
      email: identity.email,
      ...(identity.name ? { name: identity.name } : {}),
      ...(identity.avatarUrl ? { avatarUrl: identity.avatarUrl } : {}),
    },
  });
}

/** Shape returned to clients — never leaks internal-only fields. */
export function publicUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    provider: user.provider,
    plan: user.plan,
    usageCount: user.usageCount,
    createdAt: user.createdAt,
  };
}
