import { AlertTriangle, Check, RefreshCw } from "lucide-react";

import { VideoStatusBadge } from "../../../shared/components/Badge";
import Button from "../../../shared/components/Button";
import Spinner from "../../../shared/components/Spinner";

const STEPS = [
  { key: "UPLOADING", label: "Upload" },
  { key: "QUEUED", label: "Queued" },
  { key: "PROCESSING", label: "AI analysis" },
  { key: "COMPLETED", label: "Results" },
];
const ORDER = ["UPLOADING", "QUEUED", "PROCESSING", "COMPLETED"];

function ProgressBar({ value, tone = "bg-brand" }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full rounded-full transition-[width] duration-300 ${tone}`} style={{ width: `${value}%` }} />
    </div>
  );
}

export default function ProcessingStatus({ status, uploadProgress, job, pollError, onRetryPoll }) {
  const failed = status === "FAILED";
  const current = failed ? ORDER.indexOf("PROCESSING") : ORDER.indexOf(status);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-ink">Processing status</h3>
        <VideoStatusBadge status={status} />
      </div>

      <ol className="grid grid-cols-4 gap-2">
        {STEPS.map((step, index) => {
          const done = index < current || status === "COMPLETED";
          const active = index === current && status !== "COMPLETED";
          const errored = failed && active;
          return (
            <li key={step.key} className="flex flex-col items-center gap-1.5 text-center">
              <span
                className={`grid size-7 place-items-center rounded-full text-xs font-semibold ${
                  errored
                    ? "bg-red-100 text-red-600"
                    : done
                      ? "bg-emerald-500 text-white"
                      : active
                        ? "bg-brand text-white"
                        : "bg-slate-100 text-slate-400"
                }`}
              >
                {errored ? <AlertTriangle className="size-3.5" /> : done ? <Check className="size-3.5" /> : active ? <Spinner className="size-3" /> : index + 1}
              </span>
              <span className={`text-xs ${active || done ? "font-medium text-ink" : "text-mute"}`}>{step.label}</span>
            </li>
          );
        })}
      </ol>

      {status === "UPLOADING" && (
        <div>
          <div className="mb-1.5 flex justify-between text-xs text-mute">
            <span>Uploading video…</span>
            <span className="tabular-nums">{uploadProgress}%</span>
          </div>
          <ProgressBar value={uploadProgress} />
        </div>
      )}

      {status === "QUEUED" && <p className="text-sm text-mute">Upload complete. Waiting for the AI service to pick up the video…</p>}

      {status === "PROCESSING" && (
        <div>
          <div className="mb-1.5 flex justify-between text-xs text-mute">
            <span>Analysing frames for potholes and garbage…</span>
            <span className="tabular-nums">{job?.progress ?? 0}%</span>
          </div>
          <ProgressBar value={job?.progress ?? 0} />
        </div>
      )}

      {failed && (
        <div role="alert" className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <p className="font-semibold">Processing failed</p>
          <p className="mt-0.5">{job?.error ?? "The AI service could not process this video."}</p>
        </div>
      )}

      {pollError && (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
          <span>Couldn&apos;t check processing status: {pollError.message}</span>
          <Button size="sm" variant="secondary" onClick={onRetryPoll}>
            <RefreshCw className="size-3.5" />
            Retry
          </Button>
        </div>
      )}
    </div>
  );
}
