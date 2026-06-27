import { Router } from 'express';
import { prisma } from '../prisma';
import { notFound } from '../lib/http';

export const packagesRouter = Router();

// GET /api/packages — list active photography packages.
packagesRouter.get('/', async (req, res, next) => {
  try {
    const city = typeof req.query.city === 'string' ? req.query.city : undefined;
    const packages = await prisma.package.findMany({
      where: { active: true, ...(city ? { city } : {}) },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ packages });
  } catch (err) {
    next(err);
  }
});

// GET /api/packages/:id — single package.
packagesRouter.get('/:id', async (req, res, next) => {
  try {
    const pkg = await prisma.package.findUnique({ where: { id: req.params.id } });
    if (!pkg || !pkg.active) throw notFound('Package not found');
    res.json({ package: pkg });
  } catch (err) {
    next(err);
  }
});
