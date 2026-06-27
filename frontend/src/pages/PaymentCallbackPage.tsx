import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';

type Result = 'verifying' | 'paid' | 'failed';

/**
 * Landing page after the Moyasar redirect. Reads the payment id from the query
 * string and asks the backend to verify it (server-side is the source of
 * truth — we never trust the `status` query param alone).
 */
export default function PaymentCallbackPage() {
  const [params] = useSearchParams();
  const [result, setResult] = useState<Result>('verifying');
  const [message, setMessage] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const paymentId = params.get('id');
    const bookingId =
      params.get('metadata[bookingId]') ||
      sessionStorage.getItem('photocation.pendingBooking');

    if (!paymentId || !bookingId) {
      setResult('failed');
      setMessage('بيانات الدفع غير مكتملة.');
      return;
    }

    api
      .verifyPayment(paymentId, bookingId)
      .then((r) => {
        setResult(r.paid ? 'paid' : 'failed');
        if (!r.paid) setMessage(params.get('message') || 'لم يكتمل الدفع.');
        if (r.paid) sessionStorage.removeItem('photocation.pendingBooking');
      })
      .catch((e) => {
        setResult('failed');
        setMessage((e as Error).message);
      });
  }, [params]);

  return (
    <div className="card mx-auto max-w-lg p-10 text-center">
      {result === 'verifying' && (
        <>
          <div className="text-4xl">⏳</div>
          <h1 className="mt-3 text-2xl font-extrabold">جارٍ التحقق من الدفع…</h1>
        </>
      )}
      {result === 'paid' && (
        <>
          <div className="text-5xl">✅</div>
          <h1 className="mt-3 text-2xl font-extrabold">تم الدفع بنجاح!</h1>
          <p className="mt-2 text-slate-500">تم تأكيد حجزك. نتطلّع لرؤيتك 📸</p>
          <Link to="/bookings" className="btn-primary mt-6">عرض حجوزاتي</Link>
        </>
      )}
      {result === 'failed' && (
        <>
          <div className="text-5xl">❌</div>
          <h1 className="mt-3 text-2xl font-extrabold">تعذّر إتمام الدفع</h1>
          {message && <p className="mt-2 text-slate-500">{message}</p>}
          <Link to="/bookings" className="btn-ghost mt-6">العودة إلى حجوزاتي</Link>
        </>
      )}
    </div>
  );
}
