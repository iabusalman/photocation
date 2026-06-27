import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { env } from '../env';
import { requireAuth } from '../middleware/auth';
import { badRequest, forbidden, notFound } from '../lib/http';
import {
  createPayment,
  fetchPayment,
  MoyasarPayment,
} from '../services/moyasar';
import { reconcileMoyasarPayment } from '../services/payments';

export const paymentsRouter = Router();

async function loadOwnedBooking(bookingId: string, userId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payment: true, package: true },
  });
  if (!booking) throw notFound('Booking not found');
  if (booking.userId !== userId) throw forbidden();
  return booking;
}

const initSchema = z.object({ bookingId: z.string().min(1) });

/**
 * POST /api/payments/init
 * Prepare a payment for a booking. Returns everything the frontend Moyasar.js
 * form needs (publishable key, amount, currency, callback url, metadata).
 */
paymentsRouter.post('/init', requireAuth, async (req, res, next) => {
  try {
    const { bookingId } = initSchema.parse(req.body);
    const booking = await loadOwnedBooking(bookingId, req.user!.sub);

    if (booking.payment?.status === 'paid') {
      throw badRequest('Booking is already paid');
    }

    // Ensure a Payment row exists in the "initiated" state.
    await prisma.payment.upsert({
      where: { bookingId },
      create: {
        bookingId,
        status: 'initiated',
        amountHalalas: booking.amountHalalas,
        currency: booking.currency,
        description: `Photocation — ${booking.package.title}`,
      },
      update: { status: 'initiated' },
    });

    res.json({
      publishableKey: env.MOYASAR_PUBLISHABLE_KEY ?? null,
      amount: booking.amountHalalas,
      currency: booking.currency,
      description: `Photocation — ${booking.package.title}`,
      callbackUrl: env.PAYMENT_CALLBACK_URL,
      metadata: { bookingId },
    });
  } catch (err) {
    next(err);
  }
});

const chargeSchema = z.object({
  bookingId: z.string().min(1),
  // A tokenized Moyasar source, e.g. { type: 'creditcard', token: 'token_...' }.
  source: z.record(z.unknown()),
});

/**
 * POST /api/payments/charge
 * Server-side charge using a tokenized source. The booking amount/currency are
 * taken from our records (never trusted from the client).
 */
paymentsRouter.post('/charge', requireAuth, async (req, res, next) => {
  try {
    const { bookingId, source } = chargeSchema.parse(req.body);
    const booking = await loadOwnedBooking(bookingId, req.user!.sub);

    if (booking.payment?.status === 'paid') {
      throw badRequest('Booking is already paid');
    }

    const payment = await createPayment({
      amount: booking.amountHalalas,
      currency: booking.currency,
      description: `Photocation — ${booking.package.title}`,
      callbackUrl: env.PAYMENT_CALLBACK_URL,
      source,
      metadata: { bookingId },
    });

    const result = await reconcileMoyasarPayment(payment, bookingId);
    res.json({ payment: result.payment, booking: result.booking, moyasar: payment });
  } catch (err) {
    next(err);
  }
});

const verifySchema = z.object({
  id: z.string().min(1), // Moyasar payment id
  bookingId: z.string().min(1),
});

/**
 * GET /api/payments/verify?id=&bookingId=
 * Authoritative post-redirect verification. Fetches the payment from Moyasar
 * and reconciles our records. Safe to call repeatedly (idempotent).
 */
paymentsRouter.get('/verify', requireAuth, async (req, res, next) => {
  try {
    const { id, bookingId } = verifySchema.parse(req.query);
    await loadOwnedBooking(bookingId, req.user!.sub);

    const payment = await fetchPayment(id);
    const result = await reconcileMoyasarPayment(payment, bookingId);

    res.json({
      status: result.payment.status,
      paid: result.payment.status === 'paid',
      booking: result.booking,
      payment: result.payment,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/payments/webhook
 * Public endpoint invoked by Moyasar. Authenticity is verified via the shared
 * secret token configured on the webhook (sent in the body as `secret_token`).
 */
paymentsRouter.post('/webhook', async (req, res, next) => {
  try {
    const expected = env.MOYASAR_WEBHOOK_SECRET;
    const provided =
      (req.body?.secret_token as string | undefined) ??
      (req.headers['x-moyasar-token'] as string | undefined);

    if (!expected || provided !== expected) {
      throw forbidden('Invalid webhook signature');
    }

    const payment = (req.body?.data ?? req.body) as MoyasarPayment;
    if (!payment?.id) throw badRequest('Webhook missing payment data');

    await reconcileMoyasarPayment(payment);

    // Always 200 a verified webhook so Moyasar stops retrying.
    res.json({ received: true });
  } catch (err) {
    next(err);
  }
});
