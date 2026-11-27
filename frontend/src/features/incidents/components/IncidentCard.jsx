import { Clock, MapPin, Video } from "lucide-react";
import { Link } from "react-router-dom";

import { StatusBadge, TypeBadge } from "../../../shared/components/Badge";
import ConfidenceMeter from "../../../shared/components/ConfidenceMeter";
import EvidenceImage from "../../../shared/components/EvidenceImage";
import { formatDateTime, formatRelative } from "../../../shared/utils/format";

export default function IncidentCard({ incident }) {
  return (
    <Link
      to={`/issues/${incident.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-line bg-white transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/60"
    >
      <div className="relative">
        <EvidenceImage incident={incident} className="aspect-[16/10] w-full" />
        <div className="absolute top-2 right-2">
          <StatusBadge status={incident.status} short />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <TypeBadge type={incident.type} />
          <span className="font-mono text-xs text-mute">{incident.ref}</span>
        </div>
        <div>
          <p className="flex items-start gap-1.5 text-sm font-semibold text-ink group-hover:text-brand">
            <MapPin className="mt-0.5 size-3.5 shrink-0 text-slate-400" />
            <span className="line-clamp-2">{incident.location.address}</span>
          </p>
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-mute" title={formatDateTime(incident.detectedAt)}>
            <Clock className="size-3.5 text-slate-400" />
            Detected {formatRelative(incident.detectedAt)}
          </p>
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-line pt-3">
          <span className="flex items-center gap-1.5 text-xs text-mute">
            <Video className="size-3.5 text-slate-400" />
            {incident.camera.id}
          </span>
          <ConfidenceMeter value={incident.confidence} />
        </div>
      </div>
    </Link>
  );
}
