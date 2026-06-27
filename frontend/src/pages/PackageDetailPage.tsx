import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, formatPrice, type Package } from '../api/client';
import { useAuth } from '../auth/AuthContext';

export default function PackageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [pkg, setPkg] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [scheduledFor, setScheduledFor] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .getPackage(id)
      .then((r) => setPkg(r.package))
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    if (!pkg) return;
    if (!user) {
      navigate('/login', { state: { from: `/packages/${pkg.id}` } });
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const { booking } = await api.createBooking({
        packageId: pkg.id,
        scheduledFor: new Date(scheduledFor).toISOString(),
        notes: notes || undefined,
      });
      navigate(`/checkout/${booking.id}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="text-slate-500">جارٍ التحميل…</p>;
  if (error && !pkg) return <p className="text-red-600">حدث خطأ: {error}</p>;
  if (!pkg) return <p>الباقة غير موجودة.</p>;

  // Minimum bookable datetime: now + 1 hour, formatted for datetime-local.
  const min = new Date(Date.now() + 3600_000).toISOString().slice(0, 16);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="card overflow-hidden">
        <div className="aspect-[4/3] bg-slate-100">
          {pkg.coverImage && (
            <img src={pkg.coverImage} alt={pkg.title} className="h-full w-full object-cover" />
          )}
        </div>
        <div className="space-y-3 p-6">
          <h1 className="text-2xl font-extrabold">{pkg.title}</h1>
          <div className="flex gap-2 text-sm text-slate-500">
            <span className="rounded-full bg-slate-100 px-3 py-1">📍 {pkg.city}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">⏱ {pkg.durationMins} دقيقة</span>
          </div>
          <p className="text-slate-600">{pkg.description}</p>
          <p className="text-sm text-slate-500">الموقع: {pkg.location}</p>
          <p className="text-2xl font-extrabold text-brand-700">
            {formatPrice(pkg.priceHalalas, pkg.currency)}
          </p>
        </div>
      </div>

      <form onSubmit={handleBook} className="card h-fit space-y-4 p-6">
        <h2 className="text-xl font-extrabold">احجز موعدك</h2>

        <label className="block text-sm">
          <span className="mb-1 block font-semibold">موعد الجلسة</span>
          <input
            type="datetime-local"
            required
            min={min}
            value={scheduledFor}
            onChange={(e) => setScheduledFor(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-semibold">ملاحظات (اختياري)</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-slate-300 px-3 py-2"
            placeholder="أي تفاصيل تودّ إخبار المصوّر بها"
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'جارٍ الحجز…' : user ? 'متابعة إلى الدفع' : 'سجّل الدخول للحجز'}
        </button>
      </form>
    </div>
  );
}
