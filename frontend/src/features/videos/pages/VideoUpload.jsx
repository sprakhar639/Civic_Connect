import { Film, FlaskConical, RotateCcw, Upload, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { useToast } from "../../../context/ToastContext";
import useAsync from "../../../hooks/useAsync";
import { VideoStatusBadge } from "../../../shared/components/Badge";
import Button from "../../../shared/components/Button";
import Card, { CardHeader } from "../../../shared/components/Card";
import { Select } from "../../../shared/components/FormField";
import ErrorState from "../../../shared/components/ErrorState";
import PageHeader from "../../../shared/components/PageHeader";
import { formatBytes, formatDuration, formatRelative } from "../../../shared/utils/format";
import { getCameras } from "../../cameras/camera.service";
import JobTracker from "../components/JobTracker";
import ProcessingStatus from "../components/ProcessingStatus";
import VideoDropzone from "../components/VideoDropzone";
import { uploadVideo, validateVideo } from "../video.service";

export default function VideoUpload() {
  const toast = useToast();
  const camerasState = useAsync(getCameras);
  const cameras = useMemo(
    () => [...(camerasState.data ?? [])].sort((a, b) => a.id.localeCompare(b.id)),
    [camerasState.data],
  );

  const [cameraId, setCameraId] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [duration, setDuration] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [activeJobId, setActiveJobId] = useState(null);
  const [jobs, setJobs] = useState([]); // uploads made during this visit
  const abortRef = useRef(null);
  const previewUrlRef = useRef("");

  function setPreview(nextFile) {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = nextFile ? URL.createObjectURL(nextFile) : "";
    setPreviewUrl(previewUrlRef.current);
  }

  useEffect(() => () => previewUrlRef.current && URL.revokeObjectURL(previewUrlRef.current), []);

  const selectedCamera = cameras.find((camera) => camera.id === cameraId);
  const activeJob = jobs.find((job) => job.id === activeJobId);

  function chooseFile(next) {
    const error = validateVideo(next);
    setFileError(error ?? "");
    setUploadError("");
    if (error) return;
    setFile(next);
    setPreview(next);
    setDuration(null);
  }

  function clearFile() {
    setFile(null);
    setPreview(null);
    setDuration(null);
    setFileError("");
    setUploadError("");
  }

  async function handleUpload() {
    if (!cameraId) {
      setCameraError("Choose which camera this footage came from.");
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    setUploadError("");
    abortRef.current = new AbortController();

    try {
      const job = await uploadVideo(
        { file, cameraId, durationSeconds: duration },
        {
          signal: abortRef.current.signal,
          onUploadProgress: ({ loaded, total }) => total && setUploadProgress(Math.round((loaded / total) * 100)),
        },
      );
      setJobs((prev) => [job, ...prev]);
      setActiveJobId(job.id);
      toast(`${file.name} uploaded. Processing has started.`);
      clearFile();
    } catch (error) {
      setUploadError(error.name === "CanceledError" ? "Upload cancelled." : error.message);
    } finally {
      setUploading(false);
      abortRef.current = null;
    }
  }

  const handleJobUpdate = useCallback((updated) => {
    setJobs((prev) => prev.map((job) => (job.id === updated.id ? updated : job)));
  }, []);

  return (
    <>
      <PageHeader
        title="Video upload"
        description="Upload recorded CCTV footage for a camera location and run it through the AI detection pipeline."
      />

      <div className="mb-6 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <FlaskConical className="mt-0.5 size-5 shrink-0 text-amber-600" />
        <div>
          <p className="font-semibold">Recorded-video simulation</p>
          <p className="mt-0.5 text-amber-800">
            CivicConnect doesn&apos;t have access to live city CCTV yet. Uploaded videos are processed as if they came from the
            selected camera, and any detections are labelled with that camera. This is not a live feed.
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_1fr]">
        <Card>
          <CardHeader title="1. Choose a camera and video" />
          <div className="flex flex-col gap-5 p-5">
            {camerasState.error ? (
              <ErrorState error={camerasState.error} onRetry={camerasState.reload} className="py-6" />
            ) : (
              <Select
                id="camera"
                label="Camera location"
                value={cameraId}
                disabled={camerasState.loading || uploading}
                onChange={(e) => {
                  setCameraId(e.target.value);
                  setCameraError("");
                }}
                error={cameraError}
                hint={
                  selectedCamera
                    ? `${selectedCamera.location.address} · ${selectedCamera.source === "SIMULATED" ? "simulated feed" : "live CCTV camera"}`
                    : cameras.length === 0 && !camerasState.loading
                      ? undefined
                      : "Detections will be tagged with this camera's location."
                }
                options={[
                  { value: "", label: camerasState.loading ? "Loading cameras…" : "Select a camera" },
                  ...cameras.map((camera) => ({ value: camera.id, label: `${camera.id} · ${camera.name}` })),
                ]}
              />
            )}
            {!camerasState.loading && !camerasState.error && cameras.length === 0 && (
              <p className="text-sm text-mute">
                No cameras yet. <Link to="/admin/cameras" className="font-semibold text-brand">Add a camera</Link> first.
              </p>
            )}

            {file ? (
              <div className="overflow-hidden rounded-xl border border-line">
                <video
                  src={previewUrl}
                  controls
                  className="aspect-video w-full bg-black"
                  onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                  onError={() => setDuration(null)}
                />
                <div className="flex items-center gap-3 px-4 py-3">
                  <Film className="size-4 shrink-0 text-slate-400" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{file.name}</p>
                    <p className="text-xs text-mute">
                      {formatBytes(file.size)}
                      {duration ? ` · ${formatDuration(duration)}` : ""}
                    </p>
                  </div>
                  {!uploading && (
                    <Button size="sm" variant="ghost" onClick={clearFile} aria-label="Remove video">
                      <X className="size-4" />
                    </Button>
                  )}
                </div>
                <p className="border-t border-line bg-slate-50 px-4 py-2 text-xs text-mute">
                  AVI files may not preview in the browser; they can still be uploaded.
                </p>
              </div>
            ) : (
              <VideoDropzone onFile={chooseFile} disabled={uploading} />
            )}

            {fileError && (
              <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{fileError}</p>
            )}

            {uploading && <ProcessingStatus status="UPLOADING" uploadProgress={uploadProgress} />}

            {uploadError && (
              <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                Upload failed: {uploadError}
              </p>
            )}

            <div className="flex flex-wrap justify-end gap-2">
              {uploading && (
                <Button variant="secondary" onClick={() => abortRef.current?.abort()}>
                  Cancel upload
                </Button>
              )}
              <Button onClick={handleUpload} disabled={!file || uploading} loading={uploading}>
                {uploadError ? <RotateCcw className="size-4" /> : !uploading && <Upload className="size-4" />}
                {uploading ? "Uploading…" : uploadError ? "Retry upload" : "Upload and process"}
              </Button>
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader
              title="2. Processing and results"
              description={activeJob ? `${activeJob.fileName} · ${activeJob.camera.id}` : undefined}
            />
            <div className="p-5">
              {activeJob ? (
                <JobTracker key={activeJob.id} initialJob={activeJob} onUpdate={handleJobUpdate} />
              ) : (
                <p className="py-10 text-center text-sm text-mute">
                  Upload a video to see its processing status and detection summary here.
                </p>
              )}
            </div>
          </Card>

          {jobs.length > 0 && (
            <Card>
              <CardHeader title="Uploads this session" />
              <ul className="divide-y divide-line">
                {jobs.map((job) => (
                  <li key={job.id}>
                    <button
                      type="button"
                      onClick={() => setActiveJobId(job.id)}
                      className={`flex w-full items-center gap-3 px-5 py-3 text-left transition hover:bg-slate-50 ${
                        job.id === activeJobId ? "bg-brand-soft/50" : ""
                      }`}
                    >
                      <Film className="size-4 shrink-0 text-slate-400" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink">{job.fileName}</span>
                        <span className="text-xs text-mute">
                          {job.camera.id} · {formatRelative(job.createdAt)}
                        </span>
                      </span>
                      <VideoStatusBadge status={job.status} />
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
