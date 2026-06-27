import type { ReactNode } from "react";
import { Link } from "wouter";
import { ShieldCheck, Zap, Globe2 } from "lucide-react";
import Logo from "./Logo";

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <section className="grid min-h-screen bg-white lg:grid-cols-2">
      {/* left visual */}
      <div className="relative hidden overflow-hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-700 to-accent-violet" />
        <div className="absolute -left-24 top-10 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-accent-cyan/30 blur-3xl" />
        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
          <Link href="/">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 ring-1 ring-white/30">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none">
                  <path d="M12 2.5c-3.6 0-6.5 2.8-6.5 6.4 0 4.6 6.5 12.6 6.5 12.6s6.5-8 6.5-12.6c0-3.6-2.9-6.4-6.5-6.4z" fill="currentColor" />
                  <circle cx="12" cy="8.7" r="2.4" fill="#2563eb" />
                </svg>
              </span>
              <span className="font-display text-lg font-extrabold tracking-tight">Photocation</span>
            </div>
          </Link>
          <div>
            <h2 className="font-display text-3xl font-extrabold leading-tight">
              حدّد موقع أي صورة <br /> بدقّة على مستوى المعالم.
            </h2>
            <p className="mt-4 max-w-sm text-white/80">
              انضم لآلاف المصوّرين والصحفيين والباحثين الذين يثقون بـ Photocation.
            </p>
            <div className="mt-8 space-y-4">
              {[
                { icon: Zap, t: "تحليل فوري في أقل من 3 ثوانٍ" },
                { icon: Globe2, t: "تغطية تتجاوز 190 دولة" },
                { icon: ShieldCheck, t: "خصوصية وأمان للبيانات أولاً" },
              ].map((it) => (
                <div key={it.t} className="flex items-center gap-3 text-sm text-white/90">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 ring-1 ring-white/25">
                    <it.icon className="h-4 w-4" />
                  </span>
                  {it.t}
                </div>
              ))}
            </div>
          </div>
          <div className="text-xs text-white/60">© {new Date().getFullYear()} Photocation</div>
        </div>
      </div>

      {/* right form */}
      <div className="flex items-center justify-center px-5 py-16 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link href="/">
              <Logo />
            </Link>
          </div>
          <h1 className="font-display text-3xl font-extrabold text-slate-900">{title}</h1>
          <p className="mt-2 text-slate-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-6 text-center text-sm text-slate-500">{footer}</div>
        </div>
      </div>
    </section>
  );
}
