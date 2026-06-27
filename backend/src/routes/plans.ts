import { Router } from 'express';
import { PLANS } from '../services/plans';

export const plansRouter = Router();

// GET /api/plans — the public plan catalogue (mirrors the Pricing page).
plansRouter.get('/', (_req, res) => {
  res.json({ plans: Object.values(PLANS) });
});
