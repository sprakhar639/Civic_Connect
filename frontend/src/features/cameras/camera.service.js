import { USE_MOCKS } from "../../config/env";
import { toBackendCamera, toCamera, unwrapItem, unwrapList } from "../../services/adapters";
import api from "../../services/api";
import * as mock from "../../services/mock/mockServer";

// UI camera shape (see services/adapters.js for the backend mapping):
// { id (cameraId), name, location: { address, area, lat, lng }, streamUrl,
//   status: ONLINE|OFFLINE, source: SIMULATED|CCTV, lastSeenAt, createdAt }
// `:id` in the routes below is the cameraId.

// GET /api/cameras
export async function getCameras() {
  if (USE_MOCKS) return (await mock.cameras.list()).cameras;
  const { data } = await api.get("/api/cameras");
  return unwrapList(data, "cameras").map(toCamera);
}

// POST /api/cameras
export async function createCamera(input) {
  if (USE_MOCKS) return (await mock.cameras.create(input)).camera;
  const { data } = await api.post("/api/cameras", toBackendCamera(input));
  return toCamera(unwrapItem(data, "camera"));
}

// PATCH /api/cameras/:id
export async function updateCamera(id, changes) {
  if (USE_MOCKS) return (await mock.cameras.update(id, changes)).camera;
  const { data } = await api.patch(`/api/cameras/${id}`, toBackendCamera(changes));
  return toCamera(unwrapItem(data, "camera"));
}

// DELETE /api/cameras/:id
export async function deleteCamera(id) {
  if (USE_MOCKS) return mock.cameras.remove(id);
  await api.delete(`/api/cameras/${id}`);
}
