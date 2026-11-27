import { INCIDENT_STATUSES, ISSUE_TYPES } from "../../../config/domain";

const STATUS_DOTS = { PENDING: "bg-amber-500", VERIFIED: "bg-blue-500", RESOLVED: "bg-emerald-500" };

export default function MapLegend() {
  return (
    <div className="pointer-events-auto rounded-lg border border-line bg-white/95 px-3 py-2.5 text-xs shadow-md backdrop-blur">
      <p className="mb-1.5 font-semibold text-ink">Legend</p>
      <div className="flex flex-col gap-1">
        {Object.entries(ISSUE_TYPES).map(([key, meta]) => (
          <span key={key} className="flex items-center gap-2 text-slate-600">
            <span className="size-2.5 rounded-full" style={{ background: meta.color }} />
            {meta.label}
          </span>
        ))}
        <span className="mt-1 border-t border-line pt-1.5 text-[11px] font-medium text-mute">Status dot</span>
        {Object.entries(STATUS_DOTS).map(([key, className]) => (
          <span key={key} className="flex items-center gap-2 text-slate-600">
            <span className={`size-2 rounded-full ${className}`} />
            {INCIDENT_STATUSES[key].short}
          </span>
        ))}
        <span className="text-[11px] text-mute">Resolved pins are hollow</span>
      </div>
    </div>
  );
}
