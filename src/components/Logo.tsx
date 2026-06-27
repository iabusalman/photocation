export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-tr from-brand-600 to-accent-cyan shadow-glow">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none">
          <path
            d="M12 2.5c-3.6 0-6.5 2.8-6.5 6.4 0 4.6 6.5 12.6 6.5 12.6s6.5-8 6.5-12.6c0-3.6-2.9-6.4-6.5-6.4z"
            fill="currentColor"
          />
          <circle cx="12" cy="8.7" r="2.4" fill="#fff" />
        </svg>
      </span>
      <span className="font-display text-lg font-extrabold tracking-tight text-slate-900">
        Photo<span className="text-brand-600">cation</span>
      </span>
    </div>
  );
}
