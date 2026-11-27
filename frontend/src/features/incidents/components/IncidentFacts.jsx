import { CalendarClock, Gauge, Hash, MapPin, Video } from "lucide-react";

import { SourceBadge, StatusBadge, TypeBadge } from "../../../shared/components/Badge";
import ConfidenceMeter from "../../../shared/components/ConfidenceMeter";
import { formatDateTime, formatRelative } from "../../../shared/utils/format";
import { hasCoordinates } from "../../../shared/utils/incidents";

function Fact({ icon: Icon, label, children }) {
  return (
    <div className="flex gap-3 py-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-slate-400" />
      <div className="min-w-0 flex-1">
        <dt className="text-xs font-medium text-mute">{label}</dt>
        <dd className="mt-0.5 text-sm text-ink">{children}</dd>
      </div>
    </div>
  );
}

export default function IncidentFacts({ incident }) {
  return (
    <dl className="divide-y divide-line">
      <Fact icon={Hash} label="Incident">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono font-medium">{incident.ref}</span>
          <TypeBadge type={incident.type} />
          <StatusBadge status={incident.status} />
        </div>
      </Fact>
      <Fact icon={MapPin} label="Location">
        {incident.location.address}
        {hasCoordinates(incident) && (
          <span className="mt-0.5 block font-mono text-xs text-mute">
            {incident.location.lat.toFixed(5)}, {incident.location.lng.toFixed(5)}
          </span>
        )}
      </Fact>
      <Fact icon={Video} label="Camera">
        <span className="flex flex-wrap items-center gap-2">
          {incident.camera.name}
          <span className="font-mono text-xs text-mute">{incident.camera.id}</span>
          {incident.camera.source && <SourceBadge source={incident.camera.source} />}
        </span>
      </Fact>
      <Fact icon={CalendarClock} label="Detected">
        {formatDateTime(incident.detectedAt)}
        <span className="text-mute"> · {formatRelative(incident.detectedAt)}</span>
      </Fact>
      <Fact icon={Gauge} label="Model confidence">
        <ConfidenceMeter value={incident.confidence} />
      </Fact>
    </dl>
  );
}
