import { useLocation } from 'react-router-dom';
import SocialLogin from '../auth/SocialLogin';

export default function LoginPage() {
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || '/';

  return (
    <div className="mx-auto max-w-md">
      <div className="card p-8">
        <div className="mb-6 text-center">
          <div className="text-4xl">📸</div>
          <h1 className="mt-3 text-2xl font-extrabold">تسجيل الدخول إلى Photocation</h1>
          <p className="mt-2 text-sm text-slate-500">
            سجّل دخولك للمتابعة وحجز جلسات التصوير
          </p>
        </div>

        <SocialLogin redirectTo={from} />

        <p className="mt-6 text-center text-xs text-slate-400">
          بالمتابعة، أنت توافق على شروط الاستخدام وسياسة الخصوصية.
        </p>
      </div>
    </div>
  );
}
