# CivicConnect frontend ↔ backend API contract

Written against the backend in
[sprakhar639/Civic_Connect](https://github.com/sprakhar639/Civic_Connect) (`backend/`)
as of the frontend's first commit. The frontend runs on an in-browser mock layer (`src/services/mock/`)
until these endpoints exist.

All backend ↔ UI field mapping lives in **`src/services/adapters.js`**. If a
model changes, update that file. Pages and services stay the same.

## Switching from mocks to the backend

In `frontend/.env.local`:
```
VITE_API_URL=http://localhost:5000
VITE_USE_MOCKS=false
```

## Status of each endpoint

| Endpoint | Backend today | Notes |
|---|---|---|
| `GET /api/health` | ✅ exists | |
| `POST /api/auth/register` | ✅ exists | Not used: the UI has no public registration, by design |
| `POST /api/auth/login` | ⚠️ controller + service exist, **route not registered** | Add `router.post("/login", login)` in `auth.routes.js` |
| `GET /api/incidents` | ❌ missing | Model exists |
| `GET /api/incidents/:id` | ❌ missing | |
| `PATCH /api/incidents/:id/status` | ❌ missing | |
| `GET/POST /api/cameras`, `PATCH/DELETE /api/cameras/:id` | ❌ missing | Model exists |
| `POST /api/videos/upload`, `GET /api/videos/:id/status` | ❌ missing | No model yet |

## Conventions (matching the existing backend)

- Responses: `{ "success": true, "message": "…", "data": … }`. The frontend
  reads `data`. For lists, `data` may be the array itself or `{ incidents: [...] }`;
  both are accepted.
- Errors: `{ "success": false, "message": "…" }` with a real status code;
  `message` is shown to the user. Existing `errorMiddleware` already does this.
- Auth: `Authorization: Bearer <JWT>` (`protect` middleware). The frontend reads
  the token's `exp` and logs out when it passes, and on any `401`.
- Enums are lowercase strings, exactly as in the Mongoose models.

## Auth

**`POST /api/auth/login`**: already implemented in `auth.controller.js`, response:
```json
{ "success": true, "message": "Login successful",
  "data": { "token": "<JWT>", "user": { "id": "…", "username": "prakhar", "email": "…", "role": "admin" } } }
```
The UI shows `username` as the display name. Roles `admin` and `operator` can
both review incidents.

## Incidents (model: `incident.model.js`)

**`GET /api/incidents`** (public, used by the public portal and the admin)
and **`GET /api/incidents/:id`** (`:id` = `_id`). **Please `populate("camera")`**:
incidents get their map location and camera name from the camera. Without it,
incidents still render but can't appear on the map.

```jsonc
{
  "_id": "66a1…cdef",                 // shown in the UI as INC-ABCDEF (last 6 chars)
  "camera": { /* populated Camera */ },
  "type": "pothole",                  // pothole | garbage
  "status": "detected",               // detected (shown as "Pending verification") | verified | resolved | rejected
  "confidence": 0.91,
  "position": { "x": 412, "y": 288 }, // position in the frame; not used for the map
  "firstDetectedAt": "…",             // shown as "Detected"
  "lastDetectedAt": "…",
  "evidence": ["https://…/frame.jpg"],// evidence[0] is shown as the evidence image
  "createdAt": "…", "updatedAt": "…"
}
```

**`PATCH /api/incidents/:id/status`** (`protect`, `authorizeRoles("admin", "operator")`)
```json
// request (the UI requires a note when rejecting)
{ "status": "verified", "note": "Confirmed from evidence frame" }
// response
{ "success": true, "data": { "incident": { /* populated incident */ } } }
```
Transitions the UI offers: `detected → verified | rejected`,
`verified → resolved | rejected`. The backend should enforce them.

## Cameras (model: `camera.model.js`; `protect`, admin)

| Method | Path | Body | `data` |
|---|---|---|---|
| GET | `/api/cameras` | | `[Camera]` or `{ cameras }` |
| POST | `/api/cameras` | Camera fields (`cameraId` optional → generate) | `Camera` or `{ camera }` |
| PATCH | `/api/cameras/:cameraId` | partial Camera fields | `Camera` or `{ camera }` |
| DELETE | `/api/cameras/:cameraId` | | anything |

`:cameraId` is the human ID (`CAM-BLR-001`), not `_id`. The body the UI sends:
```json
{ "cameraId": "CAM-BLR-013", "name": "…", "location": { "lat": 12.97, "lng": 77.6, "address": "…" },
  "streamUrl": "recordings/x.mp4", "status": "online", "source": "simulated" }
```
Deleting a camera must keep its incidents (the UI says so).

## Videos (no model yet; `protect`, admin/operator)

**`POST /api/videos/upload`**: `multipart/form-data`, fields `video`
(MP4/AVI/MOV, ≤ 500 MB) and `cameraId`. Respond as soon as the file is stored:
`data: { video: VideoJob }` with status `queued`.

**`GET /api/videos/:id/status`**: polled every 2 s until `completed` or `failed`:
```jsonc
{
  "_id": "…", "fileName": "…", "fileSize": 104857600,
  "camera": { "id": "CAM-BLR-002", "name": "…" },
  "status": "processing",            // queued | processing | completed | failed
  "progress": 42,                     // 0..100
  "createdAt": "…", "completedAt": "…",
  "error": "…",                       // when failed
  "summary": { "potholes": 3, "garbage": 1, "framesAnalyzed": 900, "durationSeconds": 180 },  // when completed
  "detections": [{ "id": "…", "type": "pothole", "confidence": 0.91, "frameTime": "01:42" }]   // when completed
}
```
The UI only shows results once the status is `completed`.

## Model gaps: fields the UI would use

| Model | Field | Why | Fallback today |
|---|---|---|---|
| Camera | `source: "simulated" \| "cctv"` | Show recorded-video feeds distinctly from live CCTV | Every camera is shown as **simulated**, which is true until CCTV access exists |
| Camera | `location.address`, `location.area` | Readable location in lists, search and incident pages | Coordinates are shown instead |
| Incident | `history: [{ status, at, by, note }]` | Incident timeline and "recent review activity" | Built from `firstDetectedAt` + `updatedAt` (detected → current status) |
| Incident | stored `note` on status change | Rejection reasons | Sent in the PATCH body but not saved |

## Recommended endpoints beyond the proposed list

| Need | Why | Current workaround |
|---|---|---|
| Public listing without `rejected` (e.g. `GET /api/incidents?public=true`) | Public visitors shouldn't receive false positives | Filtered in the browser |
| Filtering/pagination on `GET /api/incidents` (`type`, `status`, `from`, `q`, `page`) | Scale beyond a few thousand incidents | Filtered in the browser |
| `GET /api/stats` | Home and Overview compute counts from the full list | Derived in the browser |
| `GET /api/videos` | Upload history beyond the current page visit | Kept in page state |
| `GET /api/auth/me` | Refresh role/name without re-login | User saved with the token at login |

## Mock-mode notes

- Demo login: `admin@civicconnect.dev` / `admin123`.
- Sample data is saved in `localStorage` (`civicconnect:mock:v1`); clear it to
  reset. A "Demo mode" banner is shown on every page while mocks are on.
- Video processing is simulated and its results are labelled as sample results.
  A file name containing `corrupt` shows the failure path.
