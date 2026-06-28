import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Check, Sparkles, Zap, Building2, CreditCard, ShieldCheck } from "lucide-react";
import Reveal from "../components/Reveal";
import { useAuth } from "../lib/auth";
import { api } from "../lib/api";

const plans = [
  {
    id: "free",
    name: "مجاني",
    icon: Sparkles,
    monthly: 0,
    annual: 0,
    blurb: "للتجربة والاستخدام العَرَضي",
    limit: "صورة واحدة / يوم",
    cta: "ابدأ الآن",
    highlight: false,
    features: ["10 عمليات تحليل إجمالاً", "نتيجة الموقع الأساسية", "خريطة تفاعلية", "دعم عبر المجتمع"],
  },
  {
    id: "starter",
    name: "مبتدئ",
    icon: Zap,
    monthly: 19,
    annual: 9,
    blurb: "للمصوّرين والهواة الجادّين",
    limit: "100 صورة / شهر",
    cta: "اشترك الآن",
    highlight: true,
    features: [
      "100 عملية تحليل شهرياً",
      "تحليل المعالم والتفاصيل",
      "درجة ثقة وشرح المنطق",
      "سجلّ بحث كامل",
      "طلبات إضافية: 0.25 ريال/طلب",
      "دعم بالأولوية",
    ],
  },
  {
    id: "pro",
    name: "محترف",
    icon: Building2,
    monthly: 69,
    annual: 29,
    blurb: "للصحفيين وفرق التحقّق",
    limit: "1,000 صورة / شهر",
    cta: "اشترك الآن",
    highlight: false,
    features: [
      "1,000 عملية تحليل شهرياً",
      "كل مزايا الباقة المبتدئة",
      "تصدير CSV لسجلّ البحث",
      "وصول مبكّر لواجهة API",
      "طلبات إضافية: 0.15 ريال/طلب",
      "دعم مخصّص",
    ],
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(true);
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Live plan config (prices in SAR + quota) fetched from the backend,
  // editable from /admin so changes show up here immediately.
  type Live = { monthly: number; annual: number; quota: number; windowDays: number };
  const [prices, setPrices] = useState<Record<string, Live>>({});
  useEffect(() => {
    api
      .plans()
      .then((r) => {
        const map: Record<string, Live> = {};
        for (const pl of r.plans) {
          map[pl.id] = {
            monthly: pl.monthlyHalalas / 100,
            annual: pl.annualHalalas / 100,
            quota: pl.quota,
            windowDays: pl.windowDays ?? 30,
          };
        }
        setPrices(map);
      })
      .catch(() => {});
  }, []);

  // Human limit text from a live quota, e.g. "100 صورة / شهر" or "صورة / يوم".
  function limitText(quota: number, windowDays: number): string {
    const period = windowDays <= 1 ? "يوم" : "شهر";
    if (quota === 1) return `صورة واحدة / ${period}`;
    return `${quota.toLocaleString("ar-SA")} صورة / ${period}`;
  }

  // Free plan → register; paid plans → checkout (or login first).
  function choosePlan(planId: string) {
    if (planId === "free") {
      navigate(user ? "/analyze" : "/register");
      return;
    }
    const billing = annual ? "annual" : "monthly";
    const target = `/checkout?plan=${planId}&billing=${billing}`;
    navigate(user ? target : "/login");
  }

  return (
    <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-20 left-1/2 h-80 w-[40rem] -translate-x-1/2 rounded-full bg-brand-100/70 blur-[120px]" />
      </div>

      <div className="container-x">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="chip mx-auto">الأسعار</span>
          <h1 className="mt-5 font-display text-4xl font-extrabold text-slate-900 sm:text-5xl">
            أسعار واضحة، بلا مفاجآت
          </h1>
          <p className="mt-4 text-slate-600">
            ادفع بالريال السعودي عبر بطاقة ائتمانية أو Apple Pay أو مدى. ألغِ في أي وقت.
          </p>

          <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-sm">
            <button
              onClick={() => setAnnual(false)}
              className={`rounded-full px-5 py-2 text-sm font-bold transition-all ${
                !annual ? "bg-brand-600 text-white shadow-glow" : "text-slate-500"
              }`}
            >
              شهري
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold transition-all ${
                annual ? "bg-brand-600 text-white shadow-glow" : "text-slate-500"
              }`}
            >
              سنوي
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] ${
                  annual ? "bg-white/20 text-white" : "bg-green-100 text-accent-green"
                }`}
              >
                وفّر حتى 58%
              </span>
            </button>
          </div>
        </Reveal>

        <div className="mx-auto mt-14 grid max-w-6xl items-stretch gap-6 lg:grid-cols-3">
          {plans.map((p, i) => {
            const live = prices[p.id];
            const monthlyPrice = live?.monthly ?? p.monthly;
            const annualPrice = live?.annual ?? p.annual;
            const price = annual ? annualPrice : monthlyPrice;
            const liveLimit = live ? limitText(live.quota, live.windowDays) : p.limit;
            const features = live
              ? [
                  `${live.quota.toLocaleString("ar-SA")} عملية تحليل ${
                    live.windowDays <= 1 ? "يومياً" : "شهرياً"
                  }`,
                  ...p.features.slice(1),
                ]
              : p.features;
            return (
              <Reveal key={p.id} delay={i * 0.08} className="h-full">
                <div
                  className={`relative flex h-full flex-col rounded-3xl border p-7 transition-all ${
                    p.highlight
                      ? "border-brand-300 bg-white shadow-lift ring-2 ring-brand-100 lg:-mt-4 lg:mb-4"
                      : "border-slate-200 bg-white shadow-soft hover:shadow-lift"
                  }`}
                >
                  {p.highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-3 py-1 text-xs font-bold text-white shadow-glow">
                      الأكثر شيوعاً
                    </span>
                  )}

                  <div className="flex items-center gap-3">
                    <span
                      className={`grid h-10 w-10 place-items-center rounded-xl ${
                        p.highlight ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-600"
                      }`}
                    >
                      <p.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="font-extrabold text-slate-900">{p.name}</div>
                      <div className="text-xs text-slate-500">{liveLimit}</div>
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-slate-600">{p.blurb}</p>

                  <div className="mt-5 flex items-end gap-1.5">
                    <span className="font-display text-5xl font-extrabold text-slate-900">{price}</span>
                    <span className="mb-1.5 text-sm text-slate-500">ريال{price > 0 ? " / شهر" : ""}</span>
                  </div>
                  {annual && annualPrice > 0 && (
                    <div className="mt-1 text-xs font-semibold text-accent-green">
                      يُحاسب {(annualPrice * 12).toLocaleString("ar-SA")} ريال سنوياً
                    </div>
                  )}

                  <button
                    onClick={() => choosePlan(p.id)}
                    className={`mt-6 ${p.highlight ? "btn-primary" : "btn-ghost"} w-full py-3`}
                  >
                    {p.cta}
                  </button>

                  <ul className="mt-7 space-y-3">
                    {features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700">
                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-green-100 text-accent-green">
                          <Check className="h-3 w-3" />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal>
          <div className="mx-auto mt-8 flex max-w-6xl flex-col items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-slate-50 px-7 py-6 sm:flex-row">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-brand-600 shadow-sm ring-1 ring-slate-200">
                <Building2 className="h-5 w-5" />
              </span>
              <div>
                <div className="font-extrabold text-slate-900">باقة المؤسسات</div>
                <div className="text-sm text-slate-600">حدود مخصّصة، واجهة API، واتفاقية مستوى خدمة.</div>
              </div>
            </div>
            <Link href="/" className="btn-ghost px-6">
              تواصل معنا
            </Link>
          </div>
        </Reveal>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
          <span className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-brand-600" /> بطاقة · Apple Pay · مدى
          </span>
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-accent-green" /> مدفوعات آمنة عبر Moyasar
          </span>
        </div>
      </div>
    </section>
  );
}
