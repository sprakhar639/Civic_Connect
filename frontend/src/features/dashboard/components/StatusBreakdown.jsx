import { INCIDENT_STATUSES } from "../../../config/domain";

const BARS = { PENDING: "bg-amber-500", VERIFIED: "bg-blue-500", RESOLVED: "bg-emerald-500", REJECTED: "bg-red-500" };

export default function StatusBreakdown({ counts }) {
  const max = Math.max(1, ...Object.values(counts));
  return (
    <ul className="flex flex-col gap-2.5">
      {Object.entries(INCIDENT_STATUSES).map(([key, meta]) => (
        <li key={key} className="grid grid-cols-[110px_1fr_28px] items-center gap-3 text-xs">
          <span className="text-slate-600">{meta.short}</span>
          <span className="h-2 overflow-hidden rounded-full bg-slate-100">
            <span className={`block h-full rounded-full ${BARS[key]}`} style={{ width: `${((counts[key] ?? 0) / max) * 100}%` }} />
          </span>
          <span className="text-right font-semibold text-ink tabular-nums">{counts[key] ?? 0}</span>
        </li>
      ))}
    </ul>
  );
}
