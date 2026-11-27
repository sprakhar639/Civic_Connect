import { FileVideo, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";

import { formatBytes } from "../../../shared/utils/format";
import { ACCEPTED_EXTENSIONS, MAX_VIDEO_BYTES } from "../video.service";

export default function VideoDropzone({ onFile, disabled }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  function pick(files) {
    if (files?.length) onFile(files[0]);
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-label="Upload a video file"
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (!disabled) pick(e.dataTransfer.files);
      }}
      className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition ${
        disabled
          ? "cursor-not-allowed border-line bg-slate-50 opacity-60"
          : dragging
            ? "cursor-copy border-brand bg-brand-soft"
            : "cursor-pointer border-slate-300 bg-white hover:border-brand hover:bg-slate-50"
      }`}
    >
      <span className={`grid size-12 place-items-center rounded-full ${dragging ? "bg-white text-brand" : "bg-slate-100 text-slate-500"}`}>
        {dragging ? <FileVideo className="size-5" /> : <UploadCloud className="size-5" />}
      </span>
      <p className="mt-4 text-sm font-semibold text-ink">
        {dragging ? "Drop to add the video" : "Drag and drop a recorded CCTV video"}
      </p>
      <p className="mt-1 text-sm text-mute">
        or <span className="font-semibold text-brand">browse files</span>
      </p>
      <p className="mt-3 text-xs text-mute">
        MP4, AVI or MOV · up to {formatBytes(MAX_VIDEO_BYTES)}
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={`${ACCEPTED_EXTENSIONS.join(",")},video/mp4,video/x-msvideo,video/quicktime`}
        className="hidden"
        onChange={(e) => {
          pick(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
