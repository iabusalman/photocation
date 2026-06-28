import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { requireAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import { badRequest, notFound } from '../lib/http';
import { isAdminEmail } from '../env';

export const adminRouter = Router();

// All admin routes require auth + admin.
adminRouter.use(requireAuth, requireAdmin);

// GET /api/admin/stats — high-level totals for the dashboard.
adminRouter.get('/stats', async (_req, res, next) => {
  try {
    const [users, analyses, activeSubs, plans, revenueAgg] = await Promise.all([
      prisma.user.count(),
      prisma.analysis.count(),
      prisma.subscription.count({ where: { status: 'active' } }),
      prisma.user.groupBy({ by: ['plan'], _count: { _all: true } }),
      prisma.subscription.aggregate({
        where: { status: 'active' },
        _sum: { amountHalalas: true },
      }),
    ]);

    const byPlan: Record<string, number> = { free: 0, starter: 0, pro: 0 };
    for (const p of plans) byPlan[p.plan] = p._count._all;

    res.json({
      stats: {
        users,
        analyses,
        activeSubscriptions: activeSubs,
        byPlan,
        revenueHalalas: revenueAgg._sum.amountHalalas ?? 0,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/users — list users with counts.
adminRouter.get('/users', async (req, res, next) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const users = await prisma.user.findMany({
      where: q
        ? {
            OR: [
              { email: { contains: q } },
              { name: { contains: q } },
            ],
          }
        : undefined,
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: { _count: { select: { analyses: true, subscriptions: true } } },
    });
    res.json({
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        provider: u.provider,
        plan: u.plan,
        usageCount: u.usageCount,
        usageResetAt: u.usageResetAt,
        analyses: u._count.analyses,
        subscriptions: u._count.subscriptions,
        isAdmin: isAdminEmail(u.email),
        createdAt: u.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
});

const updateUserSchema = z.object({
  plan: z.enum(['free', 'starter', 'pro']).optional(),
  resetUsage: z.boolean().optional(),
});

// PATCH /api/admin/users/:id — change plan and/or reset usage.
adminRouter.patch('/users/:id', async (req, res, next) => {
  try {
    const { plan, resetUsage } = updateUserSchema.parse(req.body);
    if (plan === undefined && !resetUsage) throw badRequest('Nothing to update');

    const exists = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!exists) throw notFound('User not found');

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        ...(plan ? { plan } : {}),
        ...(resetUsage ? { usageCount: 0, usageResetAt: null } : {}),
      },
    });
    res.json({ user: { id: user.id, plan: user.plan, usageCount: user.usageCount } });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/users/:id — delete a user and all their data.
adminRouter.delete('/users/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    if (id === req.user!.sub) throw badRequest('You cannot delete your own account');

    const exists = await prisma.user.findUnique({ where: { id } });
    if (!exists) throw notFound('User not found');

    // Remove dependent rows first (no cascade configured on the schema).
    await prisma.$transaction([
      prisma.analysis.deleteMany({ where: { userId: id } }),
      prisma.subscription.deleteMany({ where: { userId: id } }),
      prisma.user.delete({ where: { id } }),
    ]);
    res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/analyses — recent analyses across all users.
adminRouter.get('/analyses', async (_req, res, next) => {
  try {
    const rows = await prisma.analysis.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { user: { select: { email: true, name: true } } },
    });
    res.json({
      analyses: rows.map((a) => ({
        id: a.id,
        userEmail: a.user.email,
        country: a.country,
        city: a.city,
        confidence: a.confidence,
        landmarks: a.landmarks ? (JSON.parse(a.landmarks) as string[]) : [],
        createdAt: a.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
});
