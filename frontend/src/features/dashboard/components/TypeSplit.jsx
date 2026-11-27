import { ISSUE_TYPES } from "../../../config/domain";
import IssueTypeIcon from "../../../shared/components/IssueTypeIcon";

// Two categories: a single proportion bar with direct labels reads better than a pie.
export default function TypeSplit({ counts }) {
  const total = Object.keys(ISSUE_TYPES).reduce((sum, key) => sum + (counts[key] ?? 0), 0);

  if (!total) return <p className="py-8 text-center text-sm text-mute">No detections yet.</p>;

  return (
    <div>
      <div className="flex h-3 gap-0.5 overflow-hidden rounded-full" role="img" aria-label="Share of detections by issue type">
        {Object.entries(ISSUE_TYPES).map(([key, meta]) =>
          counts[key] ? (
            <div
              key={key}
              title={`${meta.label}: ${counts[key]}`}
              style={{ width: `${(counts[key] / total) * 100}%`, background: meta.color }}
            />
          ) : null,
        )}
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-4">
        {Object.entries(ISSUE_TYPES).map(([key, meta]) => (
          <div key={key}>
            <dt className="flex items-center gap-2 text-xs font-medium text-mute">
              <span className="grid size-5 place-items-center rounded text-white" style={{ background: meta.color }}>
                <IssueTypeIcon type={key} className="size-3" />
              </span>
              {meta.plural}
            </dt>
            <dd className="mt-1 text-2xl font-bold text-ink tabular-nums">
              {counts[key] ?? 0}
              <span className="ml-1.5 text-sm font-medium text-mute">{Math.round(((counts[key] ?? 0) / total) * 100)}%</span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
