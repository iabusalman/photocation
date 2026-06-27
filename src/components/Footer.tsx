import { Link } from "wouter";
import { Github, Twitter, Mail } from "lucide-react";
import Logo from "./Logo";

const cols = [
  {
    title: "المنتج",
    items: [
      { label: "تحليل صورة", href: "/analyze" },
      { label: "الأسعار", href: "/pricing" },
      { label: "واجهة API", href: "/pricing" },
      { label: "لوحة التحكم", href: "/login" },
    ],
  },
  {
    title: "الشركة",
    items: [
      { label: "من نحن", href: "/" },
      { label: "المدونة", href: "/" },
      { label: "تواصل معنا", href: "/" },
      { label: "الوظائف", href: "/" },
    ],
  },
  {
    title: "قانوني",
    items: [
      { label: "سياسة الخصوصية", href: "/" },
      { label: "شروط الاستخدام", href: "/" },
      { label: "حماية البيانات", href: "/" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-slate-200 bg-slate-50">
      <div className="container-x grid grid-cols-2 gap-10 py-14 md:grid-cols-5">
        <div className="col-span-2">
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
            منصّة ذكاء اصطناعي تحدّد الموقع الجغرافي لأي صورة بدقّة عالية في ثوانٍ —
            للمصوّرين والصحفيين والباحثين وشركات التحقّق.
          </p>
          <div className="mt-5 flex gap-2">
            {[Twitter, Github, Mail].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:text-brand-600"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="text-sm font-bold text-slate-900">{c.title}</h4>
            <ul className="mt-4 space-y-3">
              {c.items.map((it) => (
                <li key={it.label}>
                  <Link
                    href={it.href}
                    className="text-sm text-slate-500 transition-colors hover:text-brand-600"
                  >
                    {it.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-200">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs text-slate-500 sm:flex-row">
          <span>© {new Date().getFullYear()} Photocation. جميع الحقوق محفوظة.</span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-accent-green" />
            جميع الأنظمة تعمل بكفاءة
          </span>
        </div>
      </div>
    </footer>
  );
}
