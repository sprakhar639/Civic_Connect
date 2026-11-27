import { ImageOff } from "lucide-react";
import { useState } from "react";

import { ISSUE_TYPES } from "../../config/domain";
import IssueTypeIcon from "./IssueTypeIcon";

// Shows the evidence frame from the AI service. Sample incidents have no real
// frame, so they get a clearly labelled placeholder instead of a stock photo.
export default function EvidenceImage({ incident, className = "", showLabel = true }) {
  const [failed, setFailed] = useState(false);
  const meta = ISSUE_TYPES[incident.type];

  if (incident.imageUrl && !failed) {
    return (
      <img
        src={incident.imageUrl}
        alt={`${meta?.label} evidence for ${incident.ref}`}
        onError={() => setFailed(true)}
        className={`object-cover ${className}`}
        loading="lazy"
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={incident.imageUrl ? "Evidence image failed to load" : "No evidence image available"}
      className={`relative flex flex-col items-center justify-center gap-2 overflow-hidden bg-slate-900 text-white/70 ${className}`}
    >
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div
        className={`relative grid place-items-center rounded-lg border-2 border-dashed ${showLabel ? "size-12" : "size-8"}`}
        style={{ borderColor: meta?.color, color: meta?.color }}
      >
        {incident.imageUrl ? <ImageOff className="size-5" /> : <IssueTypeIcon type={incident.type} className="size-5" />}
      </div>
      {showLabel && (
        <>
          <span className="relative text-[11px] font-medium tracking-wide uppercase">
            {incident.imageUrl ? "Image unavailable" : incident.isSample ? "Sample · no frame" : "No frame captured"}
          </span>
          <span className="absolute top-2 left-2 rounded bg-black/40 px-1.5 py-0.5 font-mono text-[10px]">
            {incident.camera.id}
          </span>
        </>
      )}
    </div>
  );
}
