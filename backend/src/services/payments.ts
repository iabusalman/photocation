import { prisma } from '../prisma';
import { badRequest, notFound } from '../lib/http';
import { MoyasarPayment, isPaidStatus } from './moyasar';

// Payment/booking status string unions (SQLite has no enums — see schema).
export type PaymentStatus = 'initiated' | 'paid' | 'failed' | 'refunded';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

/** Map a Moyasar status string onto our PaymentStatus union. */
function mapStatus(moyasarStatus: string): PaymentStatus {
  if (isPaidStatus(moyasarStatus)) return 'paid';
  if (moyasarStatus === 'refunded' || moyasarStatus === 'voided')
    return 'refunded';
  if (moyasarStatus === 'failed') return 'failed';
  return 'initiated';
}

/**
 * Reconcile a Moyasar payment object against our records. Locates the booking
 * via the payment's metadata.bookingId (or an explicit bookingId), then updates
 * the linked Payment and Booking to reflect the authoritative Moyasar status.
 *
 * Guards against amount/currency tampering: a payment whose amount does not
 * match the booking is never marked as paid.
 */
export async function reconcileMoyasarPayment(
  payment: MoyasarPayment,
  explicitBookingId?: string,
) {
  const bookingId =
    explicitBookingId ??
    (payment.metadata?.bookingId as string | undefined) ??
    undefined;

  if (!bookingId) {
    throw badRequest('Unable to determine booking for payment');
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payment: true },
  });
  if (!booking) throw notFound('Booking not found for payment');

  const status = mapStatus(payment.status);

  // Amount/currency integrity check before crediting a booking.
  const amountMatches =
    payment.amount === booking.amountHalalas &&
    payment.currency?.toUpperCase() === booking.currency.toUpperCase();

  const finalPaymentStatus: PaymentStatus =
    status === 'paid' && !amountMatches ? 'failed' : status;

  const updatedPayment = await prisma.payment.upsert({
    where: { bookingId },
    create: {
      bookingId,
      moyasarId: payment.id,
      status: finalPaymentStatus,
      amountHalalas: payment.amount,
      currency: payment.currency,
      source: payment.source?.type ?? null,
      description: payment.description ?? null,
      rawResponse: JSON.stringify(payment),
    },
    update: {
      moyasarId: payment.id,
      status: finalPaymentStatus,
      source: payment.source?.type ?? null,
      rawResponse: JSON.stringify(payment),
    },
  });

  // Move the booking to confirmed only on a verified, matching payment.
  const nextBookingStatus: BookingStatus =
    finalPaymentStatus === 'paid'
      ? 'confirmed'
      : (booking.status as BookingStatus);

  if (nextBookingStatus !== booking.status) {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: nextBookingStatus },
    });
  }

  return {
    booking: { id: bookingId, status: nextBookingStatus },
    payment: updatedPayment,
    amountMatches,
  };
}
