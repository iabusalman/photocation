import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import {
  UploadCloud,
  ScanSearch,
  Sparkles,
  RotateCcw,
  ImageIcon,
  Building2,
  Lightbulb,
  MapPin,
  Gauge,
} from "lucide-react";
import Reveal from "../components/Reveal";
import { api, type AnalysisResult } from "../lib/api";
import { useAuth } from "../lib/auth";

type Phase = "idle" | "analyzing" | "done" | "error";

export default function Analyze() {
  const { user, refresh } = useAuth();
  const [, navigate] = useLocation();
  const fileInput = useRef<HTMLInputElement>(null);

  const [phase, setPhase] = useState<Phase>("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dataRef = useRef<{ base64: string; mediaType: string } | null>(null);

  function onPick(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("الرجاء اختيار ملف صورة.");
      return;
    }
    setError(null);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      dataRef.current = {
        base64: dataUrl.split(",")[1] ?? "",
        mediaType: file.type,
      };
      setPhase("idle");
      setResult(null);
    };
    reader.readAsDataURL(file);
  }

  async function run() {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!dataRef.current) {
      fileInput.current?.click();
      return;
    }
    setPhase("analyzing");
    setError(null);
    try {
      const { analysis } = await api.analyze(
        dataRef.current.base64,
        dataRef.current.mediaType,
      );
      setResult(analysis);
      setPhase("done");
      void refresh();
    } catch (e: any) {
      setError(e?.message || "تعذّر التحليل.");
      setPhase("error");
    }
  }

  function reset() {
    setPhase("idle");
    setResult(null);
    setPreview(null);
    setFileName("");
    dataRef.current = null;
  }

  return (
    <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-16 right-1/4 h-72 w-96 rounded-full bg-cyan-100/70 blur-[120px]" />
        <div className="absolute -top-10 left-1/4 h-72 w-80 rounded-full bg-brand-100/70 blur-[120px]" />
      </div>

      <div className="container-x">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="chip mx-auto">
            <Sparkles className="h-3.5 w-3.5 text-brand-600" /> تحليل بالذكاء الاصطناعي
          </span>
          <h1 className="mt-5 font-display text-4xl font-extrabold text-slate-900 sm:text-5xl">
            حلّل صورة الآن
          </h1>
          <p className="mt-4 text-slate-600">
            ارفع صورة وسيحدّد الذكاء الاصطناعي موقعها الجغرافي الأرجح.
            {!user && (
              <>
                {" "}
                <Link href="/login" className="font-bold text-brand-600">
                  سجّل الدخول
                </Link>{" "}
                للبدء.
              </>
            )}
          </p>
        </Reveal>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-2">
          {/* uploader */}
          <Reveal>
            <div className="card p-5">
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && onPick(e.target.files[0])}
              />
              <div
                onClick={() => phase !== "analyzing" && fileInput.current?.click()}
                className="relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-slate-200"
              >
                <div className="relative flex h-72 items-center justify-center bg-gradient-to-tr from-[#9ec3f0] via-[#cfe0f6] to-[#eaf2fb] text-center">
                  {preview ? (
                    <img src={preview} alt="preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-slate-600">
                      <UploadCloud className="h-10 w-10" />
                      <span className="mt-2 text-sm font-semibold">
                        اضغط لاختيار صورة
                      </span>
                    </div>
                  )}

                  {phase === "analyzing" && (
                    <motion.div
                      initial={{ y: "-100%" }}
                      animate={{ y: "100%" }}
                      transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-white/60 to-transparent"
                    />
                  )}

                  {fileName && (
                    <span className="absolute bottom-3 right-3 chip bg-white/90">
                      <ImageIcon className="h-3.5 w-3.5" /> {fileName}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4">
                {phase === "analyzing" ? (
                  <div className="flex items-center justify-center gap-3 rounded-full border border-slate-200 bg-slate-50 py-3.5 text-sm font-bold text-slate-600">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600" />
                    جارٍ تحليل المعالم والإضاءة والعمارة…
                  </div>
                ) : phase === "done" ? (
                  <button onClick={reset} className="btn-ghost w-full py-3.5 text-base">
                    <RotateCcw className="h-4 w-4" />
                    تحليل صورة أخرى
                  </button>
                ) : (
                  <button onClick={run} className="btn-primary w-full py-3.5 text-base">
                    <ScanSearch className="h-5 w-5" />
                    {user ? "حلّل الموقع الآن" : "سجّل الدخول للتحليل"}
                  </button>
                )}
              </div>

              {error && <p className="mt-3 text-center text-sm text-red-600">{error}</p>}
              <p className="mt-3 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
                <UploadCloud className="h-3.5 w-3.5" />
                JPG · PNG · WEBP — تُعالَج صورتك بأمان
              </p>
            </div>
          </Reveal>

          {/* result */}
          <Reveal delay={0.08}>
            <div className="card min-h-[22rem] p-5">
              <AnimatePresence mode="wait">
                {phase !== "done" || !result ? (
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
                    className="space-y-3"
                  >
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-slate-800">
                          <MapPin className="h-5 w-5 text-brand-600" />
                          {result.city || "غير محدّد"}
                          {result.country ? `، ${result.country}` : ""}
                        </div>
                        <span className="flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-accent-green">
                          <Gauge className="h-3.5 w-3.5" /> ثقة {result.confidence ?? 0}%
                        </span>
                      </div>
                      {result.lat != null && result.lng != null && (
                        <div className="mt-3 grid grid-cols-2 gap-3 text-center">
                          <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
                            <div className="text-xs text-slate-500">خط العرض</div>
                            <div className="font-bold">{result.lat.toFixed(4)}</div>
                          </div>
                          <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
                            <div className="text-xs text-slate-500">خط الطول</div>
                            <div className="font-bold">{result.lng.toFixed(4)}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {result.landmarks.length > 0 && (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-700">
                          <Building2 className="h-4 w-4 text-brand-600" /> المعالم المُكتشفة
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {result.landmarks.map((l) => (
                            <span key={l} className="chip">{l}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.reasoning && (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-1.5 flex items-center gap-2 text-xs font-bold text-slate-700">
                          <Lightbulb className="h-4 w-4 text-accent-amber" /> منطق التحليل
                        </div>
                        <p className="text-sm leading-relaxed text-slate-600">
                          {result.reasoning}
                        </p>
                      </div>
                    )}
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
