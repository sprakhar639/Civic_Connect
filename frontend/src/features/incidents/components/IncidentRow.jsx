import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

import { StatusBadge, TypeBadge } from "../../../shared/components/Badge";
import ConfidenceMeter from "../../../shared/components/ConfidenceMeter";
import EvidenceImage from "../../../shared/components/EvidenceImage";
import { formatDateTime } from "../../../shared/utils/format";

export default function IncidentRow({ incident }) {
  return (
    <Link
      to={`/issues/${incident.id}`}
      className="group flex items-center gap-4 px-4 py-3 transition hover:bg-slate-50"
    >
      <EvidenceImage incident={incident} showLabel={false} className="hidden h-14 w-20 shrink-0 rounded-md sm:flex" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <TypeBadge type={incident.type} />
          <span className="font-mono text-xs text-mute">{incident.ref}</span>
        </div>
        <p className="mt-1 truncate text-sm font-medium text-ink group-hover:text-brand">{incident.location.address}</p>
        <p className="text-xs text-mute">{formatDateTime(incident.detectedAt)}</p>
      </div>
      <ConfidenceMeter value={incident.confidence} className="hidden md:flex" />
      <div className="w-36 text-right">
        <StatusBadge status={incident.status} />
      </div>
      <ChevronRight className="size-4 shrink-0 text-slate-300 group-hover:text-slate-500" />
    </Link>
  );
}
