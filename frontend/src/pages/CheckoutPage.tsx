import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, formatPrice, type Booking, type PaymentInit } from '../api/client';
import MoyasarForm from '../components/MoyasarForm';

export default function CheckoutPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [paymentInit, setPaymentInit] = useState<PaymentInit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) return;
    (async () => {
      try {
        const [{ booking }, init] = await Promise.all([
          api.getBooking(bookingId),
          api.initPayment(bookingId),
        ]);
        setBooking(booking);
        setPaymentInit(init);
        // Remember which booking is being paid so the post-redirect callback
        // page can verify it server-side.
        sessionStorage.setItem('photocation.pendingBooking', booking.id);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [bookingId]);

  if (loading) return <p className="text-slate-500">جارٍ التحضير للدفع…</p>;
  if (error) return <p className="text-red-600">حدث خطأ: {error}</p>;
  if (!booking || !paymentInit) return <p>تعذّر تحميل الحجز.</p>;

  if (booking.payment?.status === 'paid') {
    return (
      <div className="card mx-auto max-w-lg p-8 text-center">
        <div className="text-4xl">✅</div>
        <h1 className="mt-3 text-2xl font-extrabold">تم دفع هذا الحجز</h1>
        <Link to="/bookings" className="btn-primary mt-6">عرض حجوزاتي</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="card h-fit space-y-3 p-6">
        <h2 className="text-xl font-extrabold">ملخّص الحجز</h2>
        <div className="flex justify-between border-b border-slate-100 pb-2">
          <span className="text-slate-500">الباقة</span>
          <span className="font-semibold">{booking.package.title}</span>
        </div>
        <div className="flex justify-between border-b border-slate-100 pb-2">
          <span className="text-slate-500">الموعد</span>
          <span className="font-semibold">
            {new Date(booking.scheduledFor).toLocaleString('ar-SA')}
          </span>
        </div>
        <div className="flex justify-between pt-2 text-lg">
          <span className="font-bold">الإجمالي</span>
          <span className="font-extrabold text-brand-700">
            {formatPrice(booking.amountHalalas, booking.currency)}
          </span>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="mb-4 text-xl font-extrabold">إتمام الدفع</h2>
        <MoyasarForm init={paymentInit} />
      </div>
    </div>
  );
}
