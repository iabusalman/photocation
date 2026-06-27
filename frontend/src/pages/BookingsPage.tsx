import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, formatPrice, type Booking } from '../api/client';

const STATUS_LABEL: Record<Booking['status'], { text: string; cls: string }> = {
  pending: { text: 'بانتظار الدفع', cls: 'bg-amber-100 text-amber-700' },
  confirmed: { text: 'مؤكّد', cls: 'bg-green-100 text-green-700' },
  cancelled: { text: 'ملغى', cls: 'bg-slate-200 text-slate-600' },
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listBookings()
      .then((r) => setBookings(r.bookings))
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate-500">جارٍ التحميل…</p>;
  if (error) return <p className="text-red-600">حدث خطأ: {error}</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">حجوزاتي</h1>

      {bookings.length === 0 && (
        <div className="card p-10 text-center text-slate-500">
          لا توجد حجوزات بعد.{' '}
          <Link to="/" className="font-bold text-brand-700">
            تصفّح الباقات
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {bookings.map((b) => {
          const status = STATUS_LABEL[b.status];
          return (
            <div key={b.id} className="card flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <h3 className="font-bold">{b.package.title}</h3>
                <p className="text-sm text-slate-500">
                  {new Date(b.scheduledFor).toLocaleString('ar-SA')} · {b.package.city}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-extrabold text-brand-700">
                  {formatPrice(b.amountHalalas, b.currency)}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${status.cls}`}>
                  {status.text}
                </span>
                {b.status === 'pending' && (
                  <Link to={`/checkout/${b.id}`} className="btn-primary px-4 py-2 text-sm">
                    إتمام الدفع
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
