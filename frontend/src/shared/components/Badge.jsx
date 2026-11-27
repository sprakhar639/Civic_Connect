import { CAMERA_SOURCES, CAMERA_STATUSES, INCIDENT_STATUSES, ISSUE_TYPES, VIDEO_JOB_STATUSES } from "../../config/domain";
import IssueTypeIcon from "./IssueTypeIcon";

const TONES = {
  orange: "bg-amber-50 text-amber-700 ring-amber-600/20",
  blue: "bg-blue-50 text-blue-700 ring-blue-600/20",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  red: "bg-red-50 text-red-700 ring-red-600/20",
  slate: "bg-slate-100 text-slate-700 ring-slate-500/20",
  violet: "bg-violet-50 text-violet-700 ring-violet-600/20",
  teal: "bg-teal-50 text-teal-700 ring-teal-600/20",
};

const DOTS = {
  orange: "bg-amber-500",
  blue: "bg-blue-500",
  green: "bg-emerald-500",
  red: "bg-red-500",
  slate: "bg-slate-400",
};

export default function Badge({ tone = "slate", dot = false, className = "", children }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap ring-1 ring-inset ${TONES[tone]} ${className}`}
    >
      {dot && <span className={`size-1.5 rounded-full ${DOTS[tone]}`} />}
      {children}
    </span>
  );
}

export function StatusBadge({ status, short = false }) {
  const meta = INCIDENT_STATUSES[status];
  if (!meta) return <Badge>{status}</Badge>;
  return (
    <Badge tone={meta.tone} dot>
      {short ? meta.short : meta.label}
    </Badge>
  );
}

export function TypeBadge({ type }) {
  const meta = ISSUE_TYPES[type];
  return (
    <Badge tone={type === "POTHOLE" ? "violet" : "teal"}>
      <IssueTypeIcon type={type} className="size-3" />
      {meta?.label ?? type}
    </Badge>
  );
}

export function CameraStatusBadge({ status }) {
  const meta = CAMERA_STATUSES[status];
  return (
    <Badge tone={meta?.tone ?? "slate"} dot>
      {meta?.label ?? status}
    </Badge>
  );
}

export function SourceBadge({ source }) {
  const meta = CAMERA_SOURCES[source];
  return (
    <span title={meta?.description}>
      <Badge tone={source === "SIMULATED" ? "orange" : "blue"}>{meta?.label ?? source}</Badge>
    </span>
  );
}

export function VideoStatusBadge({ status }) {
  const meta = VIDEO_JOB_STATUSES[status];
  return (
    <Badge tone={meta?.tone ?? "slate"} dot>
      {meta?.label ?? status}
    </Badge>
  );
}
