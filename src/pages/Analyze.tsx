import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, ScanSearch, Sparkles, RotateCcw, ImageIcon, Building2, Lightbulb } from "lucide-react";
import Reveal from "../components/Reveal";
import MapResult from "../components/MapResult";

type Phase = "idle" | "analyzing" | "done";

const landmarks = ["برج إيفل", "نهر السين", "العمارة الهوسمانية", "أعمدة الإنارة الكلاسيكية"];

export default function Analyze() {
  const [phase, setPhase] = useState<Phase>("idle");

  const run = () => {
    setPhase("analyzing");
    setTimeout(() => setPhase("done"), 2200);
  };

  return (
    <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-16 right-1/4 h-72 w-96 rounded-full bg-cyan-100/70 blur-[120px]" />
        <div className="absolute -top-10 left-1/4 h-72 w-80 rounded-full bg-brand-100/70 blur-[120px]" />
      </div>

      <div className="container-x">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="chip mx-auto">
            <Sparkles className="h-3.5 w-3.5 text-brand-600" /> عرض تجريبي تفاعلي
          </span>
          <h1 className="mt-5 font-display text-4xl font-extrabold text-slate-900 sm:text-5xl">
            حلّل صورة الآن
          </h1>
          <p className="mt-4 text-slate-600">
            هذه معاينة لتجربة التحليل. اضغط الزر لمحاكاة كشف الموقع على صورة نموذجية.
          </p>
        </Reveal>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-2">
          {/* uploader */}
          <Reveal>
            <div className="card p-5">
              <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-slate-200">
                <div className="relative flex h-72 flex-col items-center justify-center bg-gradient-to-tr from-[#9ec3f0] via-[#cfe0f6] to-[#eaf2fb] text-center">
                  <svg viewBox="0 0 320 160" className="absolute inset-0 h-full w-full">
                    <path d="M0 160 L40 150 L120 152 L160 120 L200 150 L320 154 L320 160 Z" fill="#7fa8d8" opacity="0.5" />
                    <g stroke="#3a557d" strokeWidth="2.5" fill="none" opacity="0.85">
                      <path d="M160 40 L150 140 M160 40 L170 140 M144 108 L176 108 M138 140 L182 140 M157 72 L163 72 M160 40 L160 28" />
                    </g>
                    <circle cx="265" cy="44" r="15" fill="#fff3c4" opacity="0.9" />
                  </svg>

                  {phase === "analyzing" && (
                    <motion.div
                      initial={{ y: "-100%" }}
                      animate={{ y: "100%" }}
                      transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-white/60 to-transparent"
                    />
                  )}

                  <span className="relative chip bg-white/90">
                    <ImageIcon className="h-3.5 w-3.5" /> sample-paris.jpg
                  </span>
                </div>
              </div>

              <div className="mt-4">
                {phase === "idle" && (
                  <button onClick={run} className="btn-primary w-full py-3.5 text-base">
                    <ScanSearch className="h-5 w-5" />
                    حلّل الموقع الآن
                  </button>
                )}
                {phase === "analyzing" && (
                  <div className="flex items-center justify-center gap-3 rounded-full border border-slate-200 bg-slate-50 py-3.5 text-sm font-bold text-slate-600">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600" />
                    جارٍ تحليل المعالم والإضاءة والعمارة…
                  </div>
                )}
                {phase === "done" && (
                  <button onClick={() => setPhase("idle")} className="btn-ghost w-full py-3.5 text-base">
                    <RotateCcw className="h-4 w-4" />
                    تحليل صورة أخرى
                  </button>
                )}
              </div>

              <p className="mt-3 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
                <UploadCloud className="h-3.5 w-3.5" />
                في النسخة الكاملة: اسحب وأفلت صورك حتى 25MB
              </p>
            </div>
          </Reveal>

          {/* result */}
          <Reveal delay={0.08}>
            <div className="card min-h-[22rem] p-5">
              <AnimatePresence mode="wait">
                {phase !== "done" ? (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex h-full min-h-[20rem] flex-col items-center justify-center text-center"
                  >
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-50 text-slate-300 ring-1 ring-slate-200">
                      <ScanSearch className="h-7 w-7" />
                    </span>
                    <p className="mt-4 max-w-xs text-sm text-slate-400">
                      ستظهر نتيجة الموقع هنا — الدولة والمدينة والإحداثيات والمعالم.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <MapResult />

                    <div className="mt-4 space-y-3">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-700">
                          <Building2 className="h-4 w-4 text-brand-600" /> المعالم المُكتشفة
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {landmarks.map((l) => (
                            <span key={l} className="chip">{l}</span>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-1.5 flex items-center gap-2 text-xs font-bold text-slate-700">
                          <Lightbulb className="h-4 w-4 text-accent-amber" /> منطق التحليل
                        </div>
                        <p className="text-sm leading-relaxed text-slate-600">
                          تشير البنية الحديدية الشبكية والطراز المعماري الهوسماني المحيط
                          ولون السماء إلى موقع وسط باريس قرب ساحة التروكاديرو.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
