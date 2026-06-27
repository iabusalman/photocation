// Subscription plans — mirrors the frontend Pricing page. Prices in halalas
// (1 SAR = 100 halalas). Quotas are analyses per billing window; "free" is a
// lifetime cap (no reset).

export type PlanId = 'free' | 'starter' | 'pro';
export type Billing = 'monthly' | 'annual';

export interface Plan {
  id: PlanId;
  name: string;
  quota: number; // analyses per window
  resets: boolean; // free plan does not reset
  price: Record<Billing, number>; // halalas per month
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'مجاني',
    quota: 10,
    resets: false,
    price: { monthly: 0, annual: 0 },
  },
  starter: {
    id: 'starter',
    name: 'مبتدئ',
    quota: 100,
    resets: true,
    price: { monthly: 1900, annual: 900 }, // 19 / 9 SAR per month
  },
  pro: {
    id: 'pro',
    name: 'محترف',
    quota: 1000,
    resets: true,
    price: { monthly: 6900, annual: 2900 }, // 69 / 29 SAR per month
  },
};

/** Amount charged at checkout (halalas): monthly = 1 month, annual = 12 months. */
export function checkoutAmount(planId: PlanId, billing: Billing): number {
  const monthly = PLANS[planId].price[billing];
  return billing === 'annual' ? monthly * 12 : monthly;
}

export function isPaidPlan(planId: string): planId is 'starter' | 'pro' {
  return planId === 'starter' || planId === 'pro';
}
