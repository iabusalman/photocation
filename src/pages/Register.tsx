import { Link } from "wouter";
import { Mail, Lock, User, Sparkles } from "lucide-react";
import AuthShell from "../components/AuthShell";
import SocialAuth from "../components/SocialAuth";
import Field from "../components/Field";

export default function Register() {
  return (
    <AuthShell
      title="أنشئ حسابك المجاني"
      subtitle="ابدأ بتحليل صورك خلال دقيقة — دون بطاقة ائتمانية."
      footer={
        <>
          لديك حساب بالفعل؟{" "}
          <Link href="/login" className="font-bold text-brand-600 hover:text-brand-700">
            سجّل الدخول
          </Link>
        </>
      }
    >
      <SocialAuth mode="register" />

      <div className="my-6 flex items-center gap-4 text-xs text-slate-500">
        <span className="h-px flex-1 bg-white/10" />
        أو بالبريد الإلكتروني
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <Field label="الاسم الكامل" placeholder="محمد الغامدي" icon={<User className="h-4 w-4" />} />
        <Field label="البريد الإلكتروني" type="email" placeholder="you@example.com" icon={<Mail className="h-4 w-4" />} />
        <Field label="كلمة المرور" type="password" placeholder="8 أحرف على الأقل" icon={<Lock className="h-4 w-4" />} />
        <button className="btn-primary w-full py-3.5 text-base">
          <Sparkles className="h-4 w-4" />
          أنشئ الحساب
        </button>
        <p className="text-center text-xs leading-relaxed text-slate-500">
          بإنشائك الحساب فأنت توافق على{" "}
          <Link href="/" className="font-semibold text-slate-600 underline hover:text-brand-600">
            شروط الاستخدام
          </Link>{" "}
          و
          <Link href="/" className="font-semibold text-slate-600 underline hover:text-brand-600">
            سياسة الخصوصية
          </Link>
          .
        </p>
      </form>
    </AuthShell>
  );
}
