import { Link } from "react-router-dom";

import { INCIDENT_STATUSES } from "../../../config/domain";
import { formatRelative } from "../../../shared/utils/format";

const VERBS = { VERIFIED: "verified", REJECTED: "rejected", RESOLVED: "resolved", PENDING: "reopened" };
const DOTS = { VERIFIED: "bg-blue-500", REJECTED: "bg-red-500", RESOLVED: "bg-emerald-500", PENDING: "bg-amber-500" };

export default function ActivityFeed({ activity }) {
  if (!activity.length) return <p className="py-6 text-center text-sm text-mute">No review activity yet.</p>;

  return (
    <ul className="flex flex-col gap-3">
      {activity.map((entry) => (
        <li key={`${entry.incidentId}-${entry.at}`} className="flex gap-3 text-sm">
          <span className={`mt-1.5 size-2 shrink-0 rounded-full ${DOTS[entry.status]}`} aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-slate-700">
              <span className="font-medium text-ink">{entry.by}</span> {VERBS[entry.status] ?? INCIDENT_STATUSES[entry.status]?.label}{" "}
              <Link to={`/admin/incidents?incident=${entry.incidentId}`} className="font-mono text-xs font-medium text-brand hover:underline">
                {entry.incidentRef}
              </Link>
            </p>
            <p className="text-xs text-mute">
              {entry.area} · {formatRelative(entry.at)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
