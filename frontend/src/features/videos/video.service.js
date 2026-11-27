import { USE_MOCKS } from "../../config/env";
import api from "../../services/api";
import { toVideoJob, unwrapItem } from "../../services/adapters";
import * as mock from "../../services/mock/mockServer";
import { formatBytes } from "../../shared/utils/format";

export const ACCEPTED_VIDEO_TYPES = {
  "video/mp4": ".mp4",
  "video/x-msvideo": ".avi",
  "video/avi": ".avi",
  "video/quicktime": ".mov",
};
export const ACCEPTED_EXTENSIONS = [".mp4", ".avi", ".mov"];
export const MAX_VIDEO_BYTES = 500 * 1024 * 1024;

export function validateVideo(file) {
  const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
  if (!ACCEPTED_EXTENSIONS.includes(extension)) {
    return `“${file.name}” isn't a supported format. Upload ${ACCEPTED_EXTENSIONS.join(", ").toUpperCase()} files.`;
  }
  if (file.size > MAX_VIDEO_BYTES) {
    return `That file is ${formatBytes(file.size)}. The limit is ${formatBytes(MAX_VIDEO_BYTES)}.`;
  }
  if (file.size === 0) return "That file is empty.";
  return null;
}

// Video job shape:
// { id, fileName, fileSize, camera: { id, name }, status: QUEUED|PROCESSING|COMPLETED|FAILED,
//   progress: 0..100, createdAt, completedAt?, error?,
//   summary?: { potholes, garbage, framesAnalyzed, durationSeconds },
//   detections?: [{ id, type, confidence, frameTime }] }

// POST /api/videos/upload (multipart: video, cameraId) -> { video }
export async function uploadVideo({ file, cameraId, durationSeconds }, { onUploadProgress, signal } = {}) {
  if (USE_MOCKS) {
    const { video } = await mock.videos.upload({ file, cameraId, durationSeconds }, { onUploadProgress, signal });
    return video;
  }

  const form = new FormData();
  form.append("video", file);
  form.append("cameraId", cameraId);

  const { data } = await api.post("/api/videos/upload", form, {
    onUploadProgress,
    signal,
    timeout: 0,
  });
  return toVideoJob(unwrapItem(data, "video"));
}

// GET /api/videos/:id/status -> { video }
export async function getVideoStatus(id) {
  if (USE_MOCKS) return (await mock.videos.status(id)).video;
  const { data } = await api.get(`/api/videos/${id}/status`);
  return toVideoJob(unwrapItem(data, "video"));
}
