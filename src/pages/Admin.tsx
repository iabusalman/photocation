import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  Users,
  ScanSearch,
  CreditCard,
  Wallet,
  Trash2,
  RotateCcw,
  Search,
  ShieldCheck,
} from "lucide-react";
import Reveal from "../components/Reveal";
import {
  api,
  type AdminStats,
  type AdminUser,
  type AdminAnalysis,
} from "../lib/api";
import { useAuth } from "../lib/auth";

const PLAN_LABEL: Record<string, string> = {
  free: "مجاني",
  starter: "مبتدئ",
  pro: "محترف",
};

function sar(halalas: number): string {
  return `${(halalas / 100).toLocaleString("ar-SA")} ر.س`;
}
function fmt(iso: string): string {
  return new Date(iso).toLocaleDateString("ar-SA");
}

export default function Admin() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [analyses, setAnalyses] = useState<AdminAnalysis[]>([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load(search = "") {
    try {
      const [s, u, a] = await Promise.all([
        api.adminStats(),
        api.adminUsers(search),
        api.adminAnalyses(),
      ]);
      setStats(s.stats);
      setUsers(u.users);
      setAnalyses(a.analyses);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/login");
      return;
    }
    if (!user.isAdmin) {
      setBusy(false);
      return;
    }
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  async function changePlan(id: string, plan: "free" | "starter" | "pro") {
    await api.adminUpdateUser(id, { plan });
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, plan } : u)));
  }
  async function resetUsage(id: string) {
    await api.adminUpdateUser(id, { resetUsage: true });
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, usageCount: 0 } : u)));
  }
  async function removeUser(id: string, email: string) {
    if (!confirm(`حذف المستخدم ${email} وكل بياناته؟`)) return;
    await api.adminDeleteUser(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  if (loading || busy) {
    return <div className="py-40 text-center text-slate-400">جارٍ التحميل…</div>;
  }
  if (user && !user.isAdmin) {
    return (
      <div className="py-40 text-center">
        <ShieldCheck className="mx-auto h-12 w-12 text-slate-300" />
        <p className="mt-4 text-slate-500">هذه الصفحة مخصّصة للمشرفين فقط.</p>
      </div>
    );
  }

  const statCards = stats
    ? [
        { icon: Users, label: "المستخدمون", value: stats.users.toLocaleString("ar-SA") },
        { icon: ScanSearch, label: "التحليلات", value: stats.analyses.toLocaleString("ar-SA") },
        { icon: CreditCard, label: "اشتراكات نشطة", value: stats.activeSubscriptions.toLocaleString("ar-SA") },
        { icon: Wallet, label: "الإيرادات", value: sar(stats.revenueHalalas) },
      ]
    : [];

  return (
    <section className="relative pt-28 pb-16 sm:pt-32">
      <div className="container-x">
        <Reveal className="flex items-center gap-2">
          <ShieldCheck className="h-7 w-7 text-brand-600" />
          <h1 className="font-display text-3xl font-extrabold text-slate-900">لوحة الإدارة</h1>
        </Reveal>

        {error && <p className="mt-4 text-red-600">{error}</p>}

        {/* stats */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((c, i) => (
            <Reveal key={c.label} delay={i * 0.05}>
              <div className="card p-6">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                  <c.icon className="h-4 w-4 text-brand-600" /> {c.label}
                </div>
                <div className="mt-3 font-display text-3xl font-extrabold text-slate-900">
                  {c.value}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {stats && (
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            {Object.entries(stats.byPlan).map(([plan, n]) => (
              <span key={plan} className="chip">
                {PLAN_LABEL[plan] ?? plan}: {n}
              </span>
            ))}
          </div>
        )}

        {/* users */}
        <Reveal className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-extrabold text-slate-900">المستخدمون</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setBusy(true);
                void load(q).finally(() => setBusy(false));
              }}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2"
            >
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="بحث بالبريد أو الاسم"
                className="w-48 text-sm outline-none"
              />
            </form>
          </div>

          <div className="card mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-right text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500">
                  <th className="p-3 font-semibold">المستخدم</th>
                  <th className="p-3 font-semibold">الباقة</th>
                  <th className="p-3 font-semibold">الاستهلاك</th>
                  <th className="p-3 font-semibold">التحليلات</th>
                  <th className="p-3 font-semibold">التسجيل</th>
                  <th className="p-3 font-semibold">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100 last:border-0">
                    <td className="p-3">
                      <div className="font-semibold text-slate-800">
                        {u.name || "—"}
                        {u.isAdmin && (
                          <span className="ms-2 rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700">
                            مشرف
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </td>
                    <td className="p-3">
                      <select
                        value={u.plan}
                        onChange={(e) =>
                          changePlan(u.id, e.target.value as "free" | "starter" | "pro")
                        }
                        className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm"
                      >
                        <option value="free">مجاني</option>
                        <option value="starter">مبتدئ</option>
                        <option value="pro">محترف</option>
                      </select>
                    </td>
                    <td className="p-3 text-slate-600">{u.usageCount}</td>
                    <td className="p-3 text-slate-600">{u.analyses}</td>
                    <td className="p-3 text-slate-500">{fmt(u.createdAt)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => resetUsage(u.id)}
                          title="تصفير الاستهلاك"
                          className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => removeUser(u.id, u.email)}
                          title="حذف"
                          disabled={u.isAdmin}
                          className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-red-600 hover:bg-red-50 disabled:opacity-40"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>

        {/* recent analyses */}
        <Reveal className="mt-10">
          <h2 className="font-display text-2xl font-extrabold text-slate-900">أحدث التحليلات</h2>
          <div className="card mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-right text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500">
                  <th className="p-3 font-semibold">المستخدم</th>
                  <th className="p-3 font-semibold">الموقع</th>
                  <th className="p-3 font-semibold">الثقة</th>
                  <th className="p-3 font-semibold">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {analyses.map((a) => (
                  <tr key={a.id} className="border-b border-slate-100 last:border-0">
                    <td className="p-3 text-slate-500">{a.userEmail}</td>
                    <td className="p-3 font-semibold text-slate-800">
                      {[a.city, a.country].filter(Boolean).join("، ") || "—"}
                    </td>
                    <td className="p-3 text-slate-600">{a.confidence ?? 0}%</td>
                    <td className="p-3 text-slate-500">{fmt(a.createdAt)}</td>
                  </tr>
                ))}
                {analyses.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-slate-400">
                      لا توجد تحليلات بعد.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
