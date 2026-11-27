// In-browser stand-in for the CivicConnect backend, used when VITE_USE_MOCKS is
// on. Each function mirrors one endpoint (see docs/API_CONTRACT.md) and returns
// the same shape the service layer expects from the real API.
//
// Data lives in localStorage so admin edits survive reloads. Pages never import
// this file; only the feature services do.

import { ApiError, signalUnauthorized } from "../api";
import { isTokenExpired, tokenStorage } from "../tokenStorage";
import { buildSeed, DEMO_ADMIN, DEMO_CREDENTIALS } from "./seed";

const STORAGE_KEY = "civicconnect:mock:v1";
const LATENCY_MS = 250;
const SESSION_HOURS = 8;

let memoryStore = null;

function load() {
  if (memoryStore) return memoryStore;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    memoryStore = raw ? JSON.parse(raw) : buildSeed();
  } catch {
    memoryStore = buildSeed();
  }
  return memoryStore;
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryStore));
  } catch {
    // Storage blocked; changes last until reload.
  }
}

export function resetMockData() {
  memoryStore = buildSeed();
  save();
}

function delay(value, ms = LATENCY_MS) {
  return new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), ms));
}

function fail(message, status, ms = LATENCY_MS) {
  return new Promise((_, reject) => setTimeout(() => reject(new ApiError(message, status)), ms));
}

// Mirrors the backend's JWT middleware for admin-only endpoints.
function requireAdmin() {
  const token = tokenStorage.getToken();
  if (!token || isTokenExpired(token)) {
    signalUnauthorized();
    return false;
  }
  return true;
}

function base64Url(value) {
  return btoa(JSON.stringify(value)).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}

// Unsigned, JWT-shaped token so expiry handling works the same as in production.
function issueMockToken(user) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url({ alg: "none", typ: "JWT" });
  const payload = base64Url({ sub: user.id, role: user.role, iat: now, exp: now + SESSION_HOURS * 3600 });
  return `${header}.${payload}.mock`;
}

function nextId(items, prefix, start) {
  const max = items.reduce((highest, item) => {
    const n = Number(item.id.split("-").at(-1));
    return Number.isFinite(n) ? Math.max(highest, n) : highest;
  }, start);
  return `${prefix}${String(max + 1).padStart(3, "0")}`;
}

// ---------------------------------------------------------------- auth

export const auth = {
  login({ email, password }) {
    const matches =
      email.trim().toLowerCase() === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password;
    if (!matches) return fail("Invalid email or password.", 401, 600);
    return delay({ token: issueMockToken(DEMO_ADMIN), user: DEMO_ADMIN }, 600);
  },
};

// ---------------------------------------------------------------- incidents

export const incidents = {
  list() {
    return delay({ incidents: load().incidents });
  },

  get(id) {
    const incident = load().incidents.find((item) => item.id === id);
    if (!incident) return fail(`Incident ${id} was not found.`, 404);
    return delay({ incident });
  },

  updateStatus(id, { status, note }) {
    if (!requireAdmin()) return fail("Your session has expired. Please sign in again.", 401);

    const incident = load().incidents.find((item) => item.id === id);
    if (!incident) return fail(`Incident ${id} was not found.`, 404);

    const at = new Date().toISOString();
    incident.status = status;
    incident.updatedAt = at;
    incident.history.push({ status, at, by: tokenStorage.getUser()?.name ?? "Admin", note: note || undefined });
    save();
    return delay({ incident });
  },
};

// ---------------------------------------------------------------- cameras

export const cameras = {
  list() {
    return delay({ cameras: load().cameras });
  },

  create(input) {
    if (!requireAdmin()) return fail("Your session has expired. Please sign in again.", 401);

    const store = load();
    const id = input.id?.trim() || nextId(store.cameras, "CAM-BLR-", 0);
    if (store.cameras.some((camera) => camera.id === id)) {
      return fail(`A camera with ID ${id} already exists.`, 409);
    }

    const camera = {
      ...input,
      location: {
        ...input.location,
        address: input.location.address ?? `${input.location.lat.toFixed(5)}, ${input.location.lng.toFixed(5)}`,
      },
      id,
      lastSeenAt: input.status === "ONLINE" ? new Date().toISOString() : null,
      createdAt: new Date().toISOString(),
      isSample: true,
    };
    store.cameras.push(camera);
    save();
    return delay({ camera });
  },

  update(id, changes) {
    if (!requireAdmin()) return fail("Your session has expired. Please sign in again.", 401);

    const camera = load().cameras.find((item) => item.id === id);
    if (!camera) return fail(`Camera ${id} was not found.`, 404);

    if (changes.status === "ONLINE" && camera.status !== "ONLINE") {
      camera.lastSeenAt = new Date().toISOString();
    }
    Object.assign(camera, changes, { id });
    save();
    return delay({ camera });
  },

  remove(id) {
    if (!requireAdmin()) return fail("Your session has expired. Please sign in again.", 401);

    const store = load();
    if (!store.cameras.some((camera) => camera.id === id)) return fail(`Camera ${id} was not found.`, 404);
    store.cameras = store.cameras.filter((camera) => camera.id !== id);
    save();
    return delay({ success: true });
  },
};

// ---------------------------------------------------------------- videos

const QUEUE_MS = 2500;

function seededCount(id, salt, max) {
  let hash = salt;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash % (max + 1);
}

function formatFrameTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// Status is derived from elapsed time so polling sees the job progress.
function resolveJob(job) {
  const elapsed = Date.now() - new Date(job.createdAt).getTime();

  if (elapsed < QUEUE_MS) return { ...job, status: "QUEUED", progress: 0 };

  const processingElapsed = elapsed - QUEUE_MS;
  if (processingElapsed < job.processingMs) {
    return { ...job, status: "PROCESSING", progress: Math.floor((processingElapsed / job.processingMs) * 100) };
  }

  // Demo hook: file names containing "corrupt" exercise the failure path.
  if (/corrupt/i.test(job.fileName)) {
    return {
      ...job,
      status: "FAILED",
      progress: 100,
      error: "Could not decode video frames. The file may be corrupted or use an unsupported codec.",
    };
  }

  const potholes = 1 + seededCount(job.id, 7, 5);
  const garbage = seededCount(job.id, 13, 4);
  const duration = job.durationSeconds || 180;
  const detections = [
    ...Array.from({ length: potholes }, (_, i) => ({ type: "POTHOLE", i })),
    ...Array.from({ length: garbage }, (_, i) => ({ type: "GARBAGE", i })),
  ]
    .map(({ type, i }, index) => {
      const seconds = (seededCount(job.id, 31 + index * 17, 1000) / 1000) * duration;
      return {
        id: `${job.id}-D${index + 1}`,
        type,
        confidence: Math.round((0.6 + seededCount(job.id, 53 + i * 11, 38) / 100) * 100) / 100,
        frameTime: formatFrameTime(seconds),
        seconds,
      };
    })
    .sort((a, b) => a.seconds - b.seconds);

  return {
    ...job,
    status: "COMPLETED",
    progress: 100,
    completedAt: new Date(new Date(job.createdAt).getTime() + QUEUE_MS + job.processingMs).toISOString(),
    summary: {
      potholes,
      garbage,
      framesAnalyzed: Math.round(duration * 5),
      durationSeconds: duration,
    },
    detections,
  };
}

export const videos = {
  // Simulates upload progress, then registers a processing job.
  upload({ file, cameraId, durationSeconds }, { onUploadProgress, signal } = {}) {
    if (!requireAdmin()) return fail("Your session has expired. Please sign in again.", 401);

    const store = load();
    const camera = store.cameras.find((item) => item.id === cameraId);
    if (!camera) return fail(`Camera ${cameraId} was not found.`, 404);

    const uploadMs = Math.min(4000, 1200 + file.size / 50_000);
    const started = Date.now();

    return new Promise((resolve, reject) => {
      const timer = setInterval(() => {
        if (signal?.aborted) {
          clearInterval(timer);
          const error = new Error("Upload cancelled.");
          error.name = "CanceledError";
          reject(error);
          return;
        }
        const loaded = Math.min(file.size, Math.round(((Date.now() - started) / uploadMs) * file.size));
        onUploadProgress?.({ loaded, total: file.size });

        if (loaded >= file.size) {
          clearInterval(timer);
          const job = {
            id: `VID-${Date.now().toString(36).toUpperCase()}`,
            fileName: file.name,
            fileSize: file.size,
            camera: { id: camera.id, name: camera.name },
            durationSeconds: durationSeconds ? Math.round(durationSeconds) : null,
            createdAt: new Date().toISOString(),
            processingMs: 8000 + Math.min(10000, file.size / 20_000),
            isSample: true,
          };
          store.videos.push(job);
          save();
          resolve({ video: resolveJob(job) });
        }
      }, 150);
    });
  },

  status(id) {
    const job = load().videos.find((item) => item.id === id);
    if (!job) return fail(`Video ${id} was not found.`, 404);
    return delay({ video: resolveJob(job) }, 120);
  },
};
