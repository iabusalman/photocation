import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Gauge,
  MapPin,
  Building2,
  Crown,
  Sparkles,
  ScanSearch,
  CalendarClock,
  ArrowUpRight,
  LogOut,
  Ban,
} from "lucide-react";
import Reveal from "../components/Reveal";
import { api, type AnalysisResult, type Subscription } from "../lib/api";
import { useAuth } from "../lib/auth";

const PLAN_LABEL: Record<string, string> = {
  free: "مجاني",
  starter: "مبتدئ",
  pro: "محترف",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function Dashboard() {
  const { user, quota, loading, signOut, refresh } = useAuth();
  const [, navigate] = useLocation();
  const [sub, setSub] = useState<Subscription | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [busy, setBusy] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  async function cancelSubscription() {
    if (!confirm("هل تريد إلغاء اشتراكك والعودة للباقة المجانية؟")) return;
    setCancelling(true);
    try {
      await api.cancelSubscription();
      setSub(null);
      await refresh();
    } finally {
      setCancelling(false);
    }
  }

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/login");
      return;
    }
    Promise.all([api.subscription(), api.history()])
      .then(([s, h]) => {
        setSub(s.subscription);
        setHistory(h.analyses);
      })
      .catch(() => {})
      .finally(() => setBusy(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  if (loading || !user) {
    return <div className="py-40 text-center text-slate-400">جارٍ التحميل…</div>;
  }

  const used = quota?.used ?? user.usageCount;
  const limit = quota?.limit ?? 10;
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const isPaid = user.plan !== "free";

  return (
    <section className="relative pt-28 pb-16 sm:pt-32">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-10 left-1/3 h-72 w-96 rounded-full bg-brand-100/60 blur-[120px]" />
      </div>

      <div className="container-x">
        {/* header */}
        <Reveal className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-slate-900">
              أهلاً، {user.name || "بك"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">{user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold ${
                isPaid
                  ? "bg-brand-600 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {isPaid ? <Crown className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
              الباقة: {PLAN_LABEL[user.plan]}
            </span>
            <Link href="/analyze" className="btn-primary px-4 py-2 text-sm">
              <ScanSearch className="h-4 w-4" /> تحليل جديد
            </Link>
            <button
              onClick={signOut}
              className="btn-ghost px-4 py-2 text-sm"
            >
              <LogOut className="h-4 w-4" /> تسجيل الخروج
            </button>
          </div>
        </Reveal>

        {/* stat cards */}
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {/* usage */}
          <Reveal>
            <div className="card p-6">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <Gauge className="h-4 w-4 text-brand-600" /> استهلاك التحليلات
              </div>
              <div className="mt-4 flex items-end justify-between">
                <span className="font-display text-3xl font-extrabold text-slate-900">
                  {used}
                </span>
                <span className="text-sm text-slate-500">من {limit}</span>
              </div>
              <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${
                    pct >= 100 ? "bg-red-500" : "bg-brand-600"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-3 text-xs text-slate-500">
                {quota?.resetAt
                  ? `يتجدّد في ${formatDate(quota.resetAt)}`
                  : "حصّة الباقة المجانية لا تتجدّد"}
              </p>
            </div>
          </Reveal>

          {/* subscription */}
          <Reveal delay={0.06}>
            <div className="card flex h-full flex-col p-6">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <CalendarClock className="h-4 w-4 text-brand-600" /> الاشتراك
              </div>
              {sub && sub.status === "active" ? (
                <div className="mt-4 space-y-1.5">
                  <div className="font-display text-2xl font-extrabold text-slate-900">
                    {PLAN_LABEL[sub.plan]}
                    <span className="ms-2 text-sm font-semibold text-slate-500">
                      ({sub.billing === "annual" ? "سنوي" : "شهري"})
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">
                    يتجدّد في {formatDate(sub.currentPeriodEnd)}
                  </p>
                  <p className="text-sm text-slate-500">
                    {(sub.amountHalalas / 100).toLocaleString("ar-SA")} ريال
                  </p>
                  <button
                    onClick={cancelSubscription}
                    disabled={cancelling}
                    className="btn-ghost mt-3 w-full border-red-200 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Ban className="h-4 w-4" />
                    {cancelling ? "جارٍ الإلغاء…" : "إلغاء الاشتراك"}
                  </button>
                </div>
              ) : (
                <div className="mt-4 flex flex-1 flex-col justify-between">
                  <p className="text-sm text-slate-500">
                    أنت على الباقة المجانية. قم بالترقية لمزيد من التحليلات والمزايا.
                  </p>
                  <Link href="/pricing" className="btn-primary mt-4 w-full py-2.5 text-sm">
                    ترقية الباقة <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          </Reveal>

          {/* totals */}
          <Reveal delay={0.12}>
            <div className="card p-6">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <MapPin className="h-4 w-4 text-brand-600" /> إجمالي التحليلات
              </div>
              <div className="mt-4 font-display text-3xl font-extrabold text-slate-900">
                {history.length}
              </div>
              <p className="mt-3 text-xs text-slate-500">صورة تم تحديد موقعها</p>
            </div>
          </Reveal>
        </div>

        {/* history */}
        <Reveal className="mt-10">
          <h2 className="font-display text-2xl font-extrabold text-slate-900">
            سجلّ التحليلات
          </h2>

          {busy ? (
            <p className="mt-4 text-slate-400">جارٍ التحميل…</p>
          ) : history.length === 0 ? (
            <div className="card mt-4 p-10 text-center text-slate-500">
              لا توجد تحليلات بعد.{" "}
              <Link href="/analyze" className="font-bold text-brand-600">
                ابدأ أول تحليل
              </Link>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {history.map((a) => (
                <div key={a.id} className="card p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                      <MapPin className="h-4 w-4 text-brand-600" />
                      {a.city || "غير محدّد"}
                      {a.country ? `، ${a.country}` : ""}
                    </div>
                    <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-accent-green">
                      ثقة {a.confidence ?? 0}%
                    </span>
                  </div>
                  {a.landmarks.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {a.landmarks.slice(0, 4).map((l) => (
                        <span key={l} className="chip">
                          <Building2 className="h-3 w-3" /> {l}
                        </span>
                      ))}
                    </div>
                  )}
                  {a.reasoning && (
                    <p className="mt-3 line-clamp-2 text-sm text-slate-500">
                      {a.reasoning}
                    </p>
                  )}
                  <p className="mt-3 text-xs text-slate-400">
                    {formatDate(a.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
