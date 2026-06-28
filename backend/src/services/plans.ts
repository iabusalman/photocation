// Subscription plans — stored in the database (the `Plan` table) so prices and
// quotas can be edited from the admin dashboard and take effect everywhere.
// Prices are in halalas (1 SAR = 100 halalas). The annual price is the per-month
// price when billed annually; the yearly charge is annualHalalas * 12.

import { Plan as PlanRow } from '@prisma/client';
import { prisma } from '../prisma';

export type PlanId = 'free' | 'starter' | 'pro';
export type Billing = 'monthly' | 'annual';

export type Plan = Pick<
  PlanRow,
  'id' | 'name' | 'quota' | 'windowDays' | 'monthlyHalalas' | 'annualHalalas' | 'sortOrder'
>;

// Defaults used to seed the table on first boot and as a safety fallback.
export const DEFAULT_PLANS: Record<PlanId, Plan> = {
  free: { id: 'free', name: 'مجاني', quota: 1, windowDays: 1, monthlyHalalas: 0, annualHalalas: 0, sortOrder: 0 },
  starter: { id: 'starter', name: 'مبتدئ', quota: 100, windowDays: 30, monthlyHalalas: 1900, annualHalalas: 900, sortOrder: 1 },
  pro: { id: 'pro', name: 'محترف', quota: 1000, windowDays: 30, monthlyHalalas: 6900, annualHalalas: 2900, sortOrder: 2 },
};

/** Ensure the three plans exist in the database (idempotent). */
export async function ensurePlansSeeded(): Promise<void> {
  for (const p of Object.values(DEFAULT_PLANS)) {
    await prisma.plan.upsert({ where: { id: p.id }, create: p, update: {} });
  }
}

/** All plans, ordered for display. Seeds defaults if the table is empty. */
export async function getAllPlans(): Promise<Plan[]> {
  const rows = await prisma.plan.findMany({ orderBy: { sortOrder: 'asc' } });
  if (rows.length === 0) {
    await ensurePlansSeeded();
    return Object.values(DEFAULT_PLANS);
  }
  return rows;
}

/** A single plan by id, falling back to defaults if missing. */
export async function getPlan(id: string): Promise<Plan> {
  const row = await prisma.plan.findUnique({ where: { id } });
  return row ?? DEFAULT_PLANS[(id as PlanId) in DEFAULT_PLANS ? (id as PlanId) : 'free'];
}

/** Amount charged at checkout (halalas): monthly = 1 month, annual = 12 months. */
export function checkoutAmount(plan: Plan, billing: Billing): number {
  return billing === 'annual' ? plan.annualHalalas * 12 : plan.monthlyHalalas;
}

export function isPaidPlan(planId: string): planId is 'starter' | 'pro' {
  return planId === 'starter' || planId === 'pro';
}
