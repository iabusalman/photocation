import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { requireAuth } from '../middleware/auth';
import { badRequest, forbidden, notFound } from '../lib/http';

export const bookingsRouter = Router();

const createSchema = z.object({
  packageId: z.string().min(1),
  scheduledFor: z.coerce.date(),
  notes: z.string().max(1000).optional(),
});

// POST /api/bookings — create a pending booking for the current user.
bookingsRouter.post('/', requireAuth, async (req, res, next) => {
  try {
    const { packageId, scheduledFor, notes } = createSchema.parse(req.body);

    if (scheduledFor.getTime() < Date.now()) {
      throw badRequest('scheduledFor must be in the future');
    }

    const pkg = await prisma.package.findUnique({ where: { id: packageId } });
    if (!pkg || !pkg.active) throw notFound('Package not found');

    const booking = await prisma.booking.create({
      data: {
        userId: req.user!.sub,
        packageId: pkg.id,
        scheduledFor,
        notes,
        amountHalalas: pkg.priceHalalas,
        currency: pkg.currency,
      },
      include: { package: true },
    });

    res.status(201).json({ booking });
  } catch (err) {
    next(err);
  }
});

// GET /api/bookings — list the current user's bookings.
bookingsRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user!.sub },
      include: { package: true, payment: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ bookings });
  } catch (err) {
    next(err);
  }
});

// GET /api/bookings/:id — single booking (must belong to the user).
bookingsRouter.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { package: true, payment: true },
    });
    if (!booking) throw notFound('Booking not found');
    if (booking.userId !== req.user!.sub) throw forbidden();
    res.json({ booking });
  } catch (err) {
    next(err);
  }
});
