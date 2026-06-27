function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5">
      <path fill="#FFC107" d="M43.6 20.5h-1.9V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.3 5.3C41.4 36 44 30.6 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-slate-900">
      <path d="M16.36 12.78c.02 2.45 2.15 3.26 2.17 3.27-.02.06-.34 1.17-1.12 2.31-.67.99-1.37 1.97-2.47 1.99-1.08.02-1.43-.64-2.66-.64-1.24 0-1.62.62-2.64.66-1.06.04-1.87-1.07-2.55-2.05-1.39-2.02-2.45-5.71-1.02-8.2.71-1.24 1.98-2.02 3.36-2.04 1.04-.02 2.02.7 2.66.7.63 0 1.83-.86 3.08-.74.52.02 1.99.21 2.93 1.59-.08.05-1.75 1.02-1.73 3.04M14.39 5.6c.56-.68.94-1.62.84-2.56-.81.03-1.79.54-2.37 1.22-.52.6-.97 1.56-.85 2.48.9.07 1.82-.46 2.38-1.14" />
    </svg>
  );
}

export default function SocialAuth({ mode = "login" }: { mode?: "login" | "register" }) {
  const verb = mode === "login" ? "تسجيل الدخول" : "المتابعة";
  return (
    <div className="grid gap-3">
      <button className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50">
        <GoogleIcon />
        {verb} باستخدام Google
      </button>
      <button className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-900 bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-slate-800">
        <span className="[&>svg]:fill-white">
          <AppleIcon />
        </span>
        {verb} باستخدام Apple
      </button>
    </div>
  );
}
