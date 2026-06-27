import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, formatPrice, type Package } from '../api/client';

export default function HomePage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listPackages()
      .then((r) => setPackages(r.packages))
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-10">
      <section className="rounded-3xl bg-gradient-to-l from-brand-700 to-brand-500 px-6 py-14 text-center text-white sm:px-12">
        <h1 className="text-3xl font-extrabold sm:text-5xl">احجز جلسة تصويرك الاحترافية</h1>
        <p className="mx-auto mt-4 max-w-2xl text-brand-100">
          اكتشف أفضل المصوّرين والمواقع، واحجز جلستك وادفع بأمان عبر مدى وآبل باي والبطاقات.
        </p>
        <a href="#packages" className="btn mt-8 bg-white text-brand-700 hover:bg-brand-50">
          تصفّح الباقات
        </a>
      </section>

      <section id="packages" className="space-y-6">
        <h2 className="text-2xl font-extrabold">الباقات المتاحة</h2>

        {loading && <p className="text-slate-500">جارٍ تحميل الباقات…</p>}
        {error && <p className="text-red-600">حدث خطأ: {error}</p>}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <Link
              key={pkg.id}
              to={`/packages/${pkg.id}`}
              className="card group overflow-hidden transition hover:shadow-md"
            >
              <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                {pkg.coverImage && (
                  <img
                    src={pkg.coverImage}
                    alt={pkg.title}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                    loading="lazy"
                  />
                )}
              </div>
              <div className="space-y-2 p-4">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5">{pkg.city}</span>
                  <span>{pkg.durationMins} دقيقة</span>
                </div>
                <h3 className="font-bold">{pkg.title}</h3>
                <p className="line-clamp-2 text-sm text-slate-500">{pkg.description}</p>
                <p className="pt-1 text-lg font-extrabold text-brand-700">
                  {formatPrice(pkg.priceHalalas, pkg.currency)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
