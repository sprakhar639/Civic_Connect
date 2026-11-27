// Decorative illustration of a camera frame with detection boxes. It shows
// what CivicConnect does; it is not a real detection.
export default function HeroIllustration() {
  return (
    <figure className="relative" aria-label="Illustration of AI detections on a camera frame">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-900 shadow-2xl ring-1 ring-slate-900/10">
        <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <defs>
            <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#1e293b" />
              <stop offset="1" stopColor="#334155" />
            </linearGradient>
          </defs>
          <rect width="400" height="300" fill="url(#sky)" />
          <path d="M0 130 L400 120 L400 300 L0 300 Z" fill="#475569" />
          <path d="M150 130 L250 128 L400 300 L0 300 Z" fill="#3f4b5e" />
          <path d="M198 140 L202 140 L206 175 L194 175 Z M190 200 L210 200 L216 250 L184 250 Z" fill="#cbd5e1" opacity=".55" />
          <rect x="20" y="70" width="60" height="62" fill="#1e293b" />
          <rect x="300" y="55" width="80" height="70" fill="#1e293b" />
          <ellipse cx="128" cy="232" rx="42" ry="13" fill="#1f2937" />
          <ellipse cx="128" cy="230" rx="34" ry="9" fill="#111827" />
          <path d="M296 160 q10 -16 24 -6 q14 -10 22 6 q10 2 6 16 l-56 0 q-6 -10 4 -16 Z" fill="#64748b" />
          <circle cx="306" cy="170" r="5" fill="#94a3b8" />
          <circle cx="330" cy="166" r="4" fill="#a3a3a3" />
        </svg>

        <div className="absolute top-[68%] left-[18%] h-[18%] w-[28%] rounded border-2 border-violet-400">
          <span className="absolute -top-6 left-[-2px] rounded bg-violet-500 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-white">
            pothole 0.91
          </span>
        </div>
        <div className="absolute top-[46%] left-[72%] h-[16%] w-[17%] rounded border-2 border-teal-400">
          <span className="absolute -top-6 left-[-2px] rounded bg-teal-500 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-white">
            garbage 0.84
          </span>
        </div>

        <div className="absolute top-3 left-3 flex items-center gap-2 rounded-md bg-black/50 px-2 py-1 font-mono text-[10px] text-white/80">
          <span className="size-1.5 rounded-full bg-amber-400" />
          RECORDED · CAM-BLR-004
        </div>
        <div className="absolute right-3 bottom-3 rounded-md bg-black/50 px-2 py-1 font-mono text-[10px] text-white/70">
          frame 01:42
        </div>
      </div>
      <figcaption className="mt-3 text-center text-xs text-mute">Illustration of detections on a recorded CCTV frame</figcaption>
    </figure>
  );
}
