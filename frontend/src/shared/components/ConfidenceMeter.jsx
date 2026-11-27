import { formatConfidence } from "../utils/format";

function tone(value) {
  if (value >= 0.85) return "bg-emerald-500";
  if (value >= 0.7) return "bg-blue-500";
  return "bg-amber-500";
}

export default function ConfidenceMeter({ value, className = "" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`} title={`Model confidence ${formatConfidence(value)}`}>
      <div className="h-1.5 w-14 overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full rounded-full ${tone(value)}`} style={{ width: `${value * 100}%` }} />
      </div>
      <span className="text-xs font-semibold text-slate-700 tabular-nums">{formatConfidence(value)}</span>
    </div>
  );
}
