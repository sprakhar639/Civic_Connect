// Converts between the backend's Mongoose documents (backend/src/models) and the
// shapes the UI works with. Every field mapping lives here, so a model change
// on the backend only needs a change in this file.
//
// Backend responses are wrapped as { success, message, data }.

export function unwrap(body) {
  return body && typeof body === "object" && "data" in body ? body.data : body;
}

// Accepts `data: [...]` or `data: { [key]: [...] }`.
export function unwrapList(body, key) {
  const data = unwrap(body);
  return Array.isArray(data) ? data : data?.[key] ?? [];
}

// Accepts `data: {...}` or `data: { [key]: {...} }`.
export function unwrapItem(body, key) {
  const data = unwrap(body);
  return data?.[key] ?? data;
}

const upper = (value) => (typeof value === "string" ? value.toUpperCase() : value);

// ---------------------------------------------------------------- users

// Backend: { id, username, email, role: "admin" | "operator" }
export function toUser(user) {
  return {
    id: String(user.id ?? user._id),
    name: user.name ?? user.username,
    email: user.email,
    role: upper(user.role),
  };
}

// ---------------------------------------------------------------- cameras

// Backend: { _id, cameraId, name, location: { lat, lng }, streamUrl,
//            status: "online" | "offline", lastSeenAt, createdAt }
export function toCamera(camera) {
  if (!camera || typeof camera !== "object") return null;
  const lat = camera.location?.lat;
  const lng = camera.location?.lng;
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);

  return {
    id: camera.cameraId ?? camera.id ?? String(camera._id),
    dbId: camera._id,
    name: camera.name,
    location: {
      address: camera.location?.address ?? (hasCoords ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : "Location unavailable"),
      area: camera.location?.area,
      lat: hasCoords ? lat : null,
      lng: hasCoords ? lng : null,
    },
    status: upper(camera.status) ?? "OFFLINE",
    // The model has no feed type yet. Until live CCTV access exists, every
    // feed is recorded video, so default to SIMULATED rather than claim "live".
    source: upper(camera.source) ?? "SIMULATED",
    streamUrl: camera.streamUrl,
    lastSeenAt: camera.lastSeenAt ?? null,
    createdAt: camera.createdAt,
  };
}

export function toBackendCamera(input) {
  const body = {
    name: input.name,
    location: { ...input.location },
    streamUrl: input.streamUrl,
    status: input.status?.toLowerCase(),
    source: input.source?.toLowerCase(),
  };
  if (input.id) body.cameraId = input.id;
  return body;
}

// ---------------------------------------------------------------- incidents

const STATUS_FROM_BACKEND = { detected: "PENDING" };
const STATUS_TO_BACKEND = { PENDING: "detected" };

export const toIncidentStatus = (status) => STATUS_FROM_BACKEND[status] ?? upper(status);
export const toBackendStatus = (status) => STATUS_TO_BACKEND[status] ?? status.toLowerCase();

// Short, readable reference for a Mongo ObjectId.
function incidentRef(id) {
  return `INC-${String(id).slice(-6).toUpperCase()}`;
}

// The model has no history yet; rebuild what the document itself proves.
function deriveHistory(status, detectedAt, updatedAt) {
  const history = [{ status: "PENDING", at: detectedAt, by: "CivicConnect AI", note: "Detected in camera footage" }];
  if (status !== "PENDING" && updatedAt) history.push({ status, at: updatedAt });
  return history;
}

// Backend: { _id, camera: ObjectId | populated Camera, type: "pothole" | "garbage",
//            status: "detected" | "verified" | "resolved" | "rejected", confidence,
//            position: { x, y }, firstDetectedAt, lastDetectedAt, evidence: [url], createdAt, updatedAt }
export function toIncident(incident) {
  const id = String(incident._id ?? incident.id);
  const camera = toCamera(incident.camera);
  const status = toIncidentStatus(incident.status);
  const detectedAt = incident.firstDetectedAt ?? incident.detectedAt ?? incident.createdAt;

  return {
    id,
    ref: incident.ref ?? incidentRef(id),
    type: upper(incident.type),
    status,
    confidence: incident.confidence,
    // Incidents are located by their camera; `camera` must be populated.
    location: camera?.location ?? { address: "Location unavailable", lat: null, lng: null },
    camera: camera
      ? { id: camera.id, name: camera.name, source: camera.source }
      : { id: String(incident.camera ?? "—"), name: "Unknown camera" },
    position: incident.position,
    detectedAt,
    lastDetectedAt: incident.lastDetectedAt,
    updatedAt: incident.updatedAt,
    imageUrl: incident.evidence?.[0] ?? incident.imageUrl ?? null,
    evidence: incident.evidence ?? [],
    history: incident.history
      ? incident.history.map((entry) => ({ ...entry, status: toIncidentStatus(entry.status) }))
      : deriveHistory(status, detectedAt, incident.updatedAt),
  };
}

// ---------------------------------------------------------------- videos

export function toVideoJob(job) {
  return {
    ...job,
    id: String(job.id ?? job._id),
    status: upper(job.status),
    detections: job.detections?.map((detection) => ({ ...detection, type: upper(detection.type) })),
  };
}
