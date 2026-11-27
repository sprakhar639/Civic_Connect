import { FlaskConical } from "lucide-react";

import { ISSUE_TYPES } from "../../../config/domain";
import { TypeBadge } from "../../../shared/components/Badge";
import ConfidenceMeter from "../../../shared/components/ConfidenceMeter";
import IssueTypeIcon from "../../../shared/components/IssueTypeIcon";
import { formatDuration } from "../../../shared/utils/format";

export default function DetectionResults({ job }) {
  const { summary, detections = [] } = job;

  return (
    <div className="flex flex-col gap-5">
      {job.isSample && (
        <p className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-900">
          <FlaskConical className="mt-0.5 size-3.5 shrink-0" />
          <span>
            <strong>Sample results.</strong> Demo mode generated these numbers without running the AI model on your file.
            Connect the backend to get real detections.
          </span>
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          [ISSUE_TYPES.POTHOLE.plural, summary.potholes, "POTHOLE"],
          [ISSUE_TYPES.GARBAGE.plural, summary.garbage, "GARBAGE"],
          ["Frames analysed", summary.framesAnalyzed.toLocaleString("en-IN")],
          ["Video length", formatDuration(summary.durationSeconds)],
        ].map(([label, value, type]) => (
          <div key={label} className="rounded-lg border border-line p-3">
            <p className="flex items-center gap-1.5 text-xs text-mute">
              {type && (
                <span style={{ color: ISSUE_TYPES[type].color }}>
                  <IssueTypeIcon type={type} className="size-3.5" />
                </span>
              )}
              {label}
            </p>
            <p className="mt-1 text-xl font-bold text-ink tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      {detections.length === 0 ? (
        <p className="rounded-lg bg-slate-50 px-3 py-4 text-center text-sm text-mute">No potholes or garbage were detected in this video.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-line">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs text-mute">
              <tr>
                <th className="px-3 py-2 font-medium">Timestamp</th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {detections.map((detection) => (
                <tr key={detection.id}>
                  <td className="px-3 py-2 font-mono text-xs text-ink">{detection.frameTime}</td>
                  <td className="px-3 py-2"><TypeBadge type={detection.type} /></td>
                  <td className="px-3 py-2"><ConfidenceMeter value={detection.confidence} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-mute">
        Detections become incidents pending verification in Incident Management once the backend records them.
      </p>
    </div>
  );
}
