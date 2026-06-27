import { Link } from "wouter";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <section className="flex min-h-screen items-center justify-center px-5 pt-20 text-center">
      <div>
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
          <Compass className="h-8 w-8" />
        </span>
        <h1 className="mt-6 font-display text-6xl font-extrabold text-slate-900">404</h1>
        <p className="mt-3 text-slate-500">الصفحة التي تبحث عنها غير موجودة.</p>
        <Link href="/" className="btn-primary mt-8 px-6 py-3">
          العودة للرئيسية
        </Link>
      </div>
    </section>
  );
}
