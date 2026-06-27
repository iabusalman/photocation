import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Sparkles, LogOut } from "lucide-react";
import Logo from "./Logo";
import { useAuth } from "../lib/auth";

const links = [
  { href: "/", label: "الرئيسية" },
  { href: "/analyze", label: "جرّب التحليل" },
  { href: "/pricing", label: "الأسعار" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [loc] = useLocation();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [loc]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={`transition-all duration-300 ${
          scrolled
            ? "border-b border-slate-200/70 bg-white/85 backdrop-blur-xl"
            : "border-b border-transparent bg-white/0"
        }`}
      >
        <div className="container-x flex h-16 items-center justify-between">
          <Link href="/" className="shrink-0">
            <Logo />
          </Link>

          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
            {links.map((l) => {
              const active = loc === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-brand-50 text-brand-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <>
                <Link href="/analyze" className="rounded-full px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
                  {user.name || user.email}
                  <span className="ms-2 rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700">
                    {user.plan}
                  </span>
                </Link>
                <button onClick={signOut} className="btn-ghost px-3 py-2 text-sm" aria-label="تسجيل الخروج">
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-ghost px-4 py-2 text-sm">
                  تسجيل الدخول
                </Link>
                <Link href="/register" className="btn-primary px-4 py-2 text-sm">
                  <Sparkles className="h-4 w-4" />
                  ابدأ مجاناً
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 md:hidden"
            aria-label="القائمة"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden">
          <div className="container-x space-y-1 border-b border-slate-200 bg-white/95 py-4 backdrop-blur-xl">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                {l.label}
              </Link>
            ))}
            <div className="flex gap-2 px-1 pt-2">
              <Link href="/login" className="btn-ghost flex-1">
                دخول
              </Link>
              <Link href="/register" className="btn-primary flex-1">
                ابدأ مجاناً
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
