import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Sparkles,
  Upload,
  ScanSearch,
  MapPinned,
  Globe2,
  Camera,
  Newspaper,
  Plane,
  ShieldCheck,
  Zap,
  Lock,
  Image as ImageIcon,
  ArrowLeft,
  Check,
  Star,
  Quote,
} from "lucide-react";
import Reveal from "../components/Reveal";
import MapResult from "../components/MapResult";

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="font-display text-3xl font-extrabold text-slate-900 sm:text-4xl">{value}</div>
      <div className="mt-1 text-xs text-slate-500 sm:text-sm">{label}</div>
    </div>
  );
}

const steps = [
  { icon: Upload, title: "ارفع الصورة", desc: "اسحب أي صورة فوتوغرافية أو لقطة شاشة. ندعم JPG وPNG وHEIC حتى 25MB.", color: "text-brand-600 bg-brand-50" },
  { icon: ScanSearch, title: "تحليل ذكي", desc: "يفحص نموذجنا المعالم والعمارة والإضاءة والنباتات لاستنتاج الموقع.", color: "text-accent-violet bg-violet-50" },
  { icon: MapPinned, title: "نتيجة دقيقة", desc: "تحصل على الدولة والمدينة والإحداثيات ودرجة الثقة على خريطة تفاعلية.", color: "text-accent-cyan bg-cyan-50" },
];

const features = [
  { icon: Globe2, title: "تغطية عالمية", desc: "يتعرّف على المواقع في أكثر من 190 دولة، من المدن الكبرى إلى المعالم النائية.", color: "text-brand-600 bg-brand-50" },
  { icon: Zap, title: "نتائج فورية", desc: "متوسط زمن التحليل أقل من ثلاث ثوانٍ بفضل بنية تحتية محسّنة للأداء.", color: "text-accent-amber bg-amber-50" },
  { icon: ShieldCheck, title: "درجة ثقة شفّافة", desc: "كل نتيجة مرفقة بمستوى ثقة (عالية / متوسطة / منخفضة) وشرح للأسباب.", color: "text-accent-green bg-green-50" },
  { icon: MapPinned, title: "خرائط تفاعلية", desc: "اعرض الموقع المُكتشف على خريطة Google تفاعلية بإحداثيات دقيقة.", color: "text-accent-cyan bg-cyan-50" },
  { icon: Lock, title: "خصوصية أولاً", desc: "صورك مشفّرة ومخزّنة بأمان، ويمكنك حذف سجلّ بحثك في أي وقت.", color: "text-accent-violet bg-violet-50" },
  { icon: ImageIcon, title: "تحليل المعالم", desc: "نُبرز المعالم البصرية البارزة التي اعتمد عليها النموذج في قراره.", color: "text-accent-pink bg-pink-50" },
];

const audience = [
  { icon: Camera, title: "المصوّرون", desc: "أرشفة مواقع لقطاتكم بدقّة." },
  { icon: Newspaper, title: "الصحفيون", desc: "التحقّق من مصدر الصور." },
  { icon: Plane, title: "المسافرون", desc: "اكتشاف أماكن الصور الملهمة." },
  { icon: ShieldCheck, title: "شركات التحقّق", desc: "كشف التزييف والمحتوى المضلّل." },
];

export default function Home() {
  return (
    <>
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40">
        {/* soft pastel washes */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 right-1/4 h-96 w-96 rounded-full bg-brand-200/50 blur-[120px]" />
          <div className="absolute top-10 left-0 h-80 w-80 rounded-full bg-cyan-200/40 blur-[120px]" />
          <div className="absolute -top-10 left-1/3 h-72 w-72 rounded-full bg-violet-200/40 blur-[120px]" />
        </div>

        <div className="container-x grid items-center gap-14 lg:grid-cols-2">
          <div>
            <Reveal>
              <span className="chip">
                <Sparkles className="h-3.5 w-3.5 text-brand-600" />
                مدعوم بالذكاء الاصطناعي · دقّة على مستوى المعالم
              </span>
            </Reveal>

            <Reveal delay={0.05}>
              <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.15] tracking-tight text-slate-900 sm:text-6xl">
                حدّد موقع <span className="gradient-text">أي صورة</span> في ثوانٍ.
              </h1>
            </Reveal>

            <Reveal delay={0.12}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
                ارفع صورة، وسيكشف الذكاء الاصطناعي الدولة والمدينة والإحداثيات الجغرافية
                والمعالم البارزة — مع خريطة تفاعلية ودرجة ثقة لكل نتيجة.
              </p>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/analyze" className="btn-primary px-6 py-3.5 text-base">
                  <Upload className="h-5 w-5" />
                  جرّب التحليل مجاناً
                </Link>
                <Link href="/pricing" className="btn-ghost px-6 py-3.5 text-base">
                  استكشف الباقات
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="mt-8 flex items-center gap-5 text-sm text-slate-500">
                <div className="flex -space-x-2 space-x-reverse">
                  {["#2563eb", "#06b6d4", "#7c3aed", "#16a34a"].map((c) => (
                    <span key={c} className="h-8 w-8 rounded-full border-2 border-white shadow-sm" style={{ background: c }} />
                  ))}
                </div>
                <span>
                  انضم إلى <b className="text-slate-900">12,400+</b> مستخدم يثقون بنا
                </span>
              </div>
            </Reveal>
          </div>

          {/* hero visual */}
          <Reveal delay={0.1} y={36}>
            <div className="relative">
              <div className="absolute -inset-4 -z-10 rounded-[32px] bg-gradient-to-tr from-brand-200/40 to-cyan-200/40 blur-2xl" />
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                className="rounded-3xl border border-slate-200 bg-white p-3 shadow-lift"
              >
                {/* uploaded image */}
                <div className="relative mb-3 overflow-hidden rounded-2xl">
                  <div className="relative flex h-44 items-end justify-between bg-gradient-to-tr from-[#9ec3f0] via-[#cfe0f6] to-[#eaf2fb] p-4">
                    <svg viewBox="0 0 320 120" className="absolute inset-0 h-full w-full">
                      <path d="M0 120 L40 116 L60 108 L120 110 L160 92 L200 108 L320 114 L320 120 Z" fill="#7fa8d8" opacity="0.5" />
                      <g stroke="#3a557d" strokeWidth="2.5" fill="none" opacity="0.85">
                        <path d="M150 26 L142 104 M150 26 L158 104 M138 80 L162 80 M134 104 L166 104 M147 54 L153 54 M150 26 L150 16" />
                      </g>
                      <circle cx="270" cy="32" r="13" fill="#fff3c4" opacity="0.9" />
                    </svg>
                    <span className="relative chip bg-white/90">
                      <Camera className="h-3.5 w-3.5" /> الصورة المرفوعة
                    </span>
                    <span className="relative chip bg-white/90">JPG · 4.2MB</span>
                  </div>
                </div>

                {/* analyzing bar */}
                <div className="mb-3 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-100 text-brand-600">
                    <ScanSearch className="h-4 w-4" />
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>اكتمل التحليل</span>
                      <span className="font-bold text-accent-green">100%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full w-full rounded-full bg-gradient-to-l from-brand-600 to-accent-cyan" />
                    </div>
                  </div>
                </div>

                <MapResult />
              </motion.div>

              {/* floating badge */}
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-lift sm:block"
              >
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-green-50 text-accent-green">
                    <Zap className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-xs text-slate-500">زمن التحليل</div>
                    <div className="text-sm font-extrabold text-slate-900">2.4 ثانية</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </Reveal>
        </div>

        {/* stats */}
        <div className="container-x mt-20">
          <Reveal>
            <div className="grid grid-cols-2 gap-6 rounded-3xl border border-slate-200 bg-white px-6 py-8 shadow-soft md:grid-cols-4">
              <Stat value="190+" label="دولة مدعومة" />
              <Stat value="2.4s" label="متوسط زمن التحليل" />
              <Stat value="94%" label="دقّة على المستوى الأول" />
              <Stat value="1.2M+" label="صورة تم تحليلها" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="bg-slate-50 py-20">
        <div className="container-x">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="chip mx-auto">كيف تعمل</span>
            <h2 className="mt-5 font-display text-3xl font-extrabold text-slate-900 sm:text-4xl">
              ثلاث خطوات بسيطة
            </h2>
            <p className="mt-4 text-slate-600">
              من رفع الصورة إلى الحصول على الموقع الكامل — كل ذلك في أقل من خمس ثوانٍ.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.08}>
                <div className="card group relative h-full p-7 transition-all hover:-translate-y-1 hover:shadow-lift">
                  <div className="absolute left-6 top-6 font-display text-5xl font-extrabold text-slate-100">
                    0{i + 1}
                  </div>
                  <span className={`grid h-12 w-12 place-items-center rounded-2xl ${s.color}`}>
                    <s.icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-lg font-extrabold text-slate-900">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="py-20">
        <div className="container-x">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="chip mx-auto">المزايا</span>
            <h2 className="mt-5 font-display text-3xl font-extrabold text-slate-900 sm:text-4xl">
              كل ما تحتاجه لتحديد المواقع بثقة
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 0.06}>
                <div className="card group h-full p-6 transition-all hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift">
                  <span className={`grid h-11 w-11 place-items-center rounded-xl ${f.color}`}>
                    <f.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-base font-extrabold text-slate-900">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ AUDIENCE ============ */}
      <section className="bg-slate-50 py-20">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <span className="chip">لمن هذا المنتج</span>
            <h2 className="mt-5 font-display text-3xl font-extrabold text-slate-900 sm:text-4xl">
              صُمّم لمن تهمّهم التفاصيل
            </h2>
            <p className="mt-4 max-w-md text-slate-600">
              سواء كنت تبحث عن الدقّة الإبداعية أو التحقّق الصحفي، Photocation يمنحك
              إجابة موثوقة مدعومة بالأدلّة البصرية.
            </p>
            <div className="mt-7 space-y-3">
              {[
                "نتائج قابلة للتفسير مع شرح المنطق",
                "تصدير الإحداثيات وسجلّ البحث",
                "واجهة API للمؤسسات والمطوّرين",
              ].map((t) => (
                <div key={t} className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-green-100 text-accent-green">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  {t}
                </div>
              ))}
            </div>
          </Reveal>

          <div className="grid grid-cols-2 gap-4">
            {audience.map((a, i) => (
              <Reveal key={a.title} delay={i * 0.07}>
                <div className="card h-full p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-tr from-brand-600 to-accent-cyan text-white shadow-glow">
                    <a.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-extrabold text-slate-900">{a.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{a.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIAL ============ */}
      <section className="py-20">
        <div className="container-x">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-soft sm:p-12">
              <Quote className="absolute -left-2 -top-2 h-24 w-24 text-slate-100" />
              <div className="mb-4 flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-accent-amber text-accent-amber" />
                ))}
              </div>
              <p className="max-w-3xl font-display text-xl font-bold leading-relaxed text-slate-900 sm:text-2xl">
                «استخدمنا Photocation للتحقّق من مصدر عشرات الصور خلال تغطية ميدانية —
                دقّة مذهلة وسرعة لا تُصدّق. أصبح أداة أساسية في غرفة الأخبار.»
              </p>
              <div className="mt-6 flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-tr from-brand-600 to-accent-cyan font-bold text-white">
                  ل
                </span>
                <div>
                  <div className="font-bold text-slate-900">ليان الحربي</div>
                  <div className="text-sm text-slate-500">محرّرة تحقّق رقمي</div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="pb-20">
        <div className="container-x">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-accent-violet p-10 text-center shadow-lift sm:p-16">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -right-10 -top-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -bottom-10 left-1/4 h-72 w-72 rounded-full bg-accent-cyan/30 blur-3xl" />
              </div>
              <h2 className="relative mx-auto max-w-2xl font-display text-3xl font-extrabold text-white sm:text-5xl">
                ابدأ بتحديد المواقع اليوم
              </h2>
              <p className="relative mx-auto mt-4 max-w-xl text-white/85">
                جرّب التحليل مجاناً دون بطاقة ائتمانية. رقِّ خطّتك متى أردت.
              </p>
              <div className="relative mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-bold text-brand-700 shadow-lg transition-all hover:-translate-y-0.5"
                >
                  <Sparkles className="h-5 w-5" />
                  أنشئ حساباً مجانياً
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 px-7 py-3.5 text-base font-bold text-white backdrop-blur transition-all hover:bg-white/20"
                >
                  مقارنة الباقات
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
