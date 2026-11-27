import { PUBLIC_STATUSES } from "../../config/domain";
import { USE_MOCKS } from "../../config/env";
import { toBackendStatus, toIncident, unwrapItem, unwrapList } from "../../services/adapters";
import api from "../../services/api";
import * as mock from "../../services/mock/mockServer";

// UI incident shape (see services/adapters.js for the backend mapping):
// { id, ref, type: POTHOLE|GARBAGE, status: PENDING|VERIFIED|RESOLVED|REJECTED,
//   confidence: 0..1, location: { address, area, lat, lng },
//   camera: { id, name, source }, detectedAt, updatedAt, imageUrl,
//   history: [{ status, at, by, note }] }

// GET /api/incidents (camera populated)
export async function getIncidents() {
  if (USE_MOCKS) return (await mock.incidents.list()).incidents;
  const { data } = await api.get("/api/incidents");
  return unwrapList(data, "incidents").map(toIncident);
}

// The public portal never shows rejected detections. Filtered client-side
// until the backend offers a public listing (see docs/API_CONTRACT.md).
export async function getPublicIncidents() {
  const incidents = await getIncidents();
  return incidents.filter((incident) => PUBLIC_STATUSES.includes(incident.status));
}

// GET /api/incidents/:id (camera populated)
export async function getIncident(id) {
  if (USE_MOCKS) return (await mock.incidents.get(id)).incident;
  const { data } = await api.get(`/api/incidents/${id}`);
  return toIncident(unwrapItem(data, "incident"));
}

export async function getPublicIncident(id) {
  const incident = await getIncident(id);
  return PUBLIC_STATUSES.includes(incident.status) ? incident : null;
}

// PATCH /api/incidents/:id/status { status: "verified" | "rejected" | "resolved", note }
export async function updateIncidentStatus(id, status, note) {
  if (USE_MOCKS) return (await mock.incidents.updateStatus(id, { status, note })).incident;
  const { data } = await api.patch(`/api/incidents/${id}/status`, { status: toBackendStatus(status), note });
  return toIncident(unwrapItem(data, "incident"));
}
