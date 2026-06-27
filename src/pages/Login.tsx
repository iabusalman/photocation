import { Link } from "wouter";
import { Mail, Lock, ArrowLeft } from "lucide-react";
import AuthShell from "../components/AuthShell";
import SocialAuth from "../components/SocialAuth";
import Field from "../components/Field";

export default function Login() {
  return (
    <AuthShell
      title="مرحباً بعودتك"
      subtitle="سجّل الدخول لمتابعة تحليل صورك."
      footer={
        <>
          ليس لديك حساب؟{" "}
          <Link href="/register" className="font-bold text-brand-600 hover:text-brand-700">
            أنشئ حساباً
          </Link>
        </>
      }
    >
      <SocialAuth mode="login" />

      <div className="my-6 flex items-center gap-4 text-xs text-slate-500">
        <span className="h-px flex-1 bg-white/10" />
        أو بالبريد الإلكتروني
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <Field label="البريد الإلكتروني" type="email" placeholder="you@example.com" icon={<Mail className="h-4 w-4" />} />
        <div>
          <Field label="كلمة المرور" type="password" placeholder="••••••••" icon={<Lock className="h-4 w-4" />} />
          <div className="mt-2 text-left">
            <Link href="/" className="text-xs font-semibold text-slate-500 hover:text-brand-600">
              نسيت كلمة المرور؟
            </Link>
          </div>
        </div>
        <button className="btn-primary w-full py-3.5 text-base">
          تسجيل الدخول
          <ArrowLeft className="h-4 w-4" />
        </button>
      </form>
    </AuthShell>
  );
}
