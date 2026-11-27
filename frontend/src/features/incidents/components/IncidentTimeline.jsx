import { Bot, CheckCircle2, CircleDot, ShieldCheck, XCircle } from "lucide-react";

import { INCIDENT_STATUSES } from "../../../config/domain";
import { formatDateTime } from "../../../shared/utils/format";

const ICONS = {
  PENDING: { icon: Bot, className: "bg-amber-50 text-amber-600" },
  VERIFIED: { icon: ShieldCheck, className: "bg-blue-50 text-blue-600" },
  RESOLVED: { icon: CheckCircle2, className: "bg-emerald-50 text-emerald-600" },
  REJECTED: { icon: XCircle, className: "bg-red-50 text-red-600" },
};

function entryTitle(entry, index) {
  if (index === 0 && entry.status === "PENDING") return "Detected by AI";
  if (entry.status === "PENDING") return "Returned to pending";
  return INCIDENT_STATUSES[entry.status]?.label ?? entry.status;
}

export default function IncidentTimeline({ history = [] }) {
  if (!history.length) return <p className="text-sm text-mute">No history recorded for this incident.</p>;

  return (
    <ol className="relative">
      {history.map((entry, index) => {
        const { icon: Icon, className } = ICONS[entry.status] ?? { icon: CircleDot, className: "bg-slate-100 text-slate-500" };
        const isLast = index === history.length - 1;
        return (
          <li key={`${entry.status}-${entry.at}`} className="relative flex gap-3 pb-5 last:pb-0">
            {!isLast && <span className="absolute top-8 bottom-0 left-[15px] w-px bg-line" aria-hidden="true" />}
            <span className={`relative grid size-8 shrink-0 place-items-center rounded-full ${className}`}>
              <Icon className="size-4" />
            </span>
            <div className="min-w-0 pt-1">
              <p className="text-sm font-medium text-ink">{entryTitle(entry, index)}</p>
              <p className="text-xs text-mute">
                {formatDateTime(entry.at)}
                {entry.by && <> · {entry.by}</>}
              </p>
              {entry.note && <p className="mt-1 text-sm text-slate-600">{entry.note}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
