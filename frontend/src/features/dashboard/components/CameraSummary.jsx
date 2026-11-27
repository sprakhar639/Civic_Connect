import { Link } from "react-router-dom";

import { CameraStatusBadge } from "../../../shared/components/Badge";
import { formatRelative } from "../../../shared/utils/format";
import { countBy } from "../../../shared/utils/incidents";

export default function CameraSummary({ cameras }) {
  const byStatus = countBy(cameras, "status");
  const bySource = countBy(cameras, "source");
  const offline = cameras.filter((camera) => camera.status === "OFFLINE");

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          ["Online", byStatus.ONLINE ?? 0, "text-emerald-600"],
          ["Offline", byStatus.OFFLINE ?? 0, "text-red-600"],
          ["Simulated", bySource.SIMULATED ?? 0, "text-amber-600"],
        ].map(([label, value, color]) => (
          <div key={label} className="rounded-lg bg-slate-50 py-3">
            <p className={`text-xl font-bold tabular-nums ${color}`}>{value}</p>
            <p className="text-xs text-mute">{label}</p>
          </div>
        ))}
      </div>

      {bySource.SIMULATED > 0 && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {bySource.SIMULATED} of {cameras.length} cameras are simulated feeds running on recorded video.
        </p>
      )}

      <div>
        <p className="mb-2 text-xs font-semibold text-slate-500">Needs attention</p>
        {offline.length === 0 ? (
          <p className="text-sm text-mute">All cameras are online.</p>
        ) : (
          <ul className="divide-y divide-line">
            {offline.slice(0, 4).map((camera) => (
              <li key={camera.id} className="flex items-center justify-between gap-2 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{camera.name}</p>
                  <p className="text-xs text-mute">Last seen {formatRelative(camera.lastSeenAt)}</p>
                </div>
                <CameraStatusBadge status={camera.status} />
              </li>
            ))}
          </ul>
        )}
        <Link to="/admin/cameras" className="mt-2 inline-block text-xs font-semibold text-brand hover:text-brand-2">
          Manage cameras →
        </Link>
      </div>
    </div>
  );
}
