import type { ReactNode } from "react";

export default function Field({
  label,
  type = "text",
  placeholder,
  icon,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  icon?: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-slate-700">{label}</span>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}
        <input type={type} placeholder={placeholder} className={`field ${icon ? "pr-10" : ""}`} />
      </div>
    </label>
  );
}
