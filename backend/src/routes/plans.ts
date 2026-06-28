import { Router } from 'express';
import { getAllPlans } from '../services/plans';

export const plansRouter = Router();

// GET /api/plans — the public plan catalogue (prices/quotas from the DB).
plansRouter.get('/', async (_req, res, next) => {
  try {
    const plans = await getAllPlans();
    res.json({
      plans: plans.map((p) => ({
        id: p.id,
        name: p.name,
        quota: p.quota,
        windowDays: p.windowDays,
        monthlyHalalas: p.monthlyHalalas,
        annualHalalas: p.annualHalalas,
      })),
    });
  } catch (err) {
    next(err);
  }
});
