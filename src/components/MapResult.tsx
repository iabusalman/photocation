import { MapPin, Navigation, ShieldCheck } from "lucide-react";

/** Light, Google-Maps-like result panel (visual mock). */
export default function MapResult({
  city = "باريس",
  country = "فرنسا",
  address = "ساحة التروكاديرو، الدائرة 16",
  lat = "48.8616",
  lng = "2.2893",
  confidence = "عالية",
}: {
  city?: string;
  country?: string;
  address?: string;
  lat?: string;
  lng?: string;
  confidence?: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
      {/* map canvas — light theme */}
      <div className="relative h-52 w-full bg-[#eaf0f7]">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 208" preserveAspectRatio="xMidYMid slice">
          <rect width="400" height="208" fill="#e9eef5" />
          {/* parks */}
          <rect x="20" y="120" width="90" height="70" rx="10" fill="#d6ecd6" />
          <rect x="300" y="20" width="80" height="60" rx="10" fill="#d6ecd6" />
          {/* water / river */}
          <path d="M-10 150 C 80 120, 150 185, 230 140 S 360 95, 420 120" stroke="#aacbe8" strokeWidth="22" fill="none" />
          {/* roads */}
          {Array.from({ length: 6 }).map((_, i) => (
            <line key={"h" + i} x1="0" y1={26 + i * 32} x2="400" y2={16 + i * 34} stroke="#ffffff" strokeWidth="6" />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={"v" + i} x1={26 + i * 50} y1="0" x2={46 + i * 50} y2="208" stroke="#ffffff" strokeWidth="6" />
          ))}
          {/* main avenue */}
          <path d="M30 195 L 200 100 L 372 48" stroke="#fcd980" strokeWidth="7" fill="none" strokeLinecap="round" />
          {/* blocks */}
          {[
            [150, 28, 50, 28],
            [230, 60, 44, 24],
            [120, 150, 46, 28],
          ].map(([x, y, w, h], i) => (
            <rect key={i} x={x} y={y} width={w} height={h} rx="4" fill="#dfe6ee" />
          ))}
        </svg>

        {/* pin */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
          <div className="flex flex-col items-center">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-brand-600 shadow-[0_8px_20px_-4px_rgba(37,99,235,0.6)] ring-4 ring-white">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <span className="-mt-0.5 h-3 w-1.5 rounded-b-full bg-brand-600" />
            <span className="mt-1 h-1.5 w-4 rounded-full bg-slate-400/40 blur-[1px]" />
          </div>
        </div>

        <div className="absolute right-3 top-3 rounded-lg border border-slate-200 bg-white/90 px-2 py-1 text-[10px] font-semibold text-slate-500 backdrop-blur">
          Photocation Maps
        </div>
      </div>

      {/* details */}
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-base font-extrabold text-slate-900">
              {city}، {country}
            </div>
            <div className="mt-0.5 text-xs text-slate-500">{address}</div>
          </div>
          <span className="chip border-emerald-200 bg-emerald-50 text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            ثقة {confidence}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">خط العرض</div>
            <div className="font-mono text-sm text-slate-700">{lat}</div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">خط الطول</div>
            <div className="font-mono text-sm text-slate-700">{lng}</div>
          </div>
        </div>

        <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2 text-xs font-bold text-brand-700 transition-colors hover:bg-brand-50">
          <Navigation className="h-3.5 w-3.5" />
          فتح في الخرائط
        </button>
      </div>
    </div>
  );
}
