import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { CreditCard, ShieldCheck, ArrowLeft, CheckCircle2 } from "lucide-react";
import Reveal from "../components/Reveal";
import MoyasarForm from "../components/MoyasarForm";
import PayPalButtons from "../components/PayPalButtons";
import { api, type SubscribeInit } from "../lib/api";
import { useAuth } from "../lib/auth";

const PLAN_NAMES: Record<string, string> = { starter: "مبتدئ", pro: "محترف" };

export default function Checkout() {
  const { user, loading, refresh } = useAuth();
  const [, navigate] = useLocation();
  const [init, setInit] = useState<SubscribeInit | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const plan = params.get("plan") === "pro" ? "pro" : "starter";
  const billing = params.get("billing") === "monthly" ? "monthly" : "annual";

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/login");
      return;
    }
    api
      .subscribe(plan, billing)
      .then((d) => {
        setInit(d);
        sessionStorage.setItem("photocation.pendingSub", d.subscriptionId);
      })
      .catch((e) => setError((e as Error).message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  return (
    <section className="relative pt-32 pb-16 sm:pt-40">
      <div className="container-x">
        <Reveal className="mx-auto max-w-3xl">
          <Link href="/pricing" className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-brand-600">
            <ArrowLeft className="h-4 w-4" /> العودة للأسعار
          </Link>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card h-fit space-y-3 p-6">
              <h2 className="text-xl font-extrabold text-slate-900">ملخّص الاشتراك</h2>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">الباقة</span>
                <span className="font-bold">{PLAN_NAMES[plan]}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">الفوترة</span>
                <span className="font-bold">{billing === "annual" ? "سنوي" : "شهري"}</span>
              </div>
              {init && (
                <div className="flex justify-between pt-2 text-lg">
                  <span className="font-bold">الإجمالي</span>
                  <span className="font-extrabold text-brand-700">
                    {(init.amount / 100).toLocaleString("ar-SA")} ريال
                  </span>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-4 pt-3 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4 text-brand-600" /> بطاقة · Apple Pay · مدى
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-accent-green" /> عبر Moyasar
                </span>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="mb-4 text-xl font-extrabold text-slate-900">إتمام الدفع</h2>
              {paid ? (
                <div className="py-6 text-center">
                  <CheckCircle2 className="mx-auto h-14 w-14 text-accent-green" />
                  <h3 className="mt-3 text-xl font-extrabold">تم تفعيل اشتراكك!</h3>
                  <Link href="/analyze" className="btn-primary mt-5">
                    ابدأ التحليل
                  </Link>
                </div>
              ) : (
                <>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  {!error && !init && <p className="text-slate-500">جارٍ التحضير…</p>}
                  {init && (
                    <>
                      {/* بطاقة / مدى / Apple Pay عبر Moyasar */}
                      <MoyasarForm init={init} />

                      <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
                        <span className="h-px flex-1 bg-slate-200" />
                        أو ادفع بالدولار عبر
                        <span className="h-px flex-1 bg-slate-200" />
                      </div>

                      <PayPalButtons
                        subscriptionId={init.subscriptionId}
                        onSuccess={() => {
                          setPaid(true);
                          sessionStorage.removeItem("photocation.pendingSub");
                          void refresh();
                        }}
                      />
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
