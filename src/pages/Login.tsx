import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Mail, Lock, ArrowLeft } from "lucide-react";
import AuthShell from "../components/AuthShell";
import SocialAuth from "../components/SocialAuth";
import Field from "../components/Field";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";

export default function Login() {
  const { signInWithToken } = useAuth();
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { token, user } = await api.login(email, password);
      signInWithToken(token, user);
      navigate("/analyze");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

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

      <form className="space-y-4" onSubmit={handleSubmit}>
        <Field
          label="البريد الإلكتروني"
          type="email"
          placeholder="you@example.com"
          icon={<Mail className="h-4 w-4" />}
          value={email}
          onChange={setEmail}
          required
          autoComplete="email"
        />
        <div>
          <Field
            label="كلمة المرور"
            type="password"
            placeholder="••••••••"
            icon={<Lock className="h-4 w-4" />}
            value={password}
            onChange={setPassword}
            required
            autoComplete="current-password"
          />
          <div className="mt-2 text-left">
            <Link href="/" className="text-xs font-semibold text-slate-500 hover:text-brand-600">
              نسيت كلمة المرور؟
            </Link>
          </div>
        </div>

        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

        <button type="submit" disabled={busy} className="btn-primary w-full py-3.5 text-base disabled:opacity-60">
          {busy ? "جارٍ الدخول…" : "تسجيل الدخول"}
          <ArrowLeft className="h-4 w-4" />
        </button>
      </form>
    </AuthShell>
  );
}
