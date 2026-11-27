# CivicConnect frontend

Public portal and admin console for CivicConnect, an AI-assisted system that
detects potholes and garbage in CCTV footage.

Built with React 19, Vite, Tailwind CSS v4, React Router, Axios, React Leaflet
(OpenStreetMap tiles), Recharts and Lucide icons.

## Run it

```bash
npm install
cp .env.example .env.local   # optional: defaults run in demo mode
npm run dev                  # http://localhost:5173
```

The app runs in **demo mode** until the backend exists: all data comes from a
mock layer and every page shows a "Demo mode: sample data" banner.

Admin login in demo mode: `admin@civicconnect.dev` / `admin123`.

| Script | |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build to `dist/` |
| `npm run lint` | ESLint |

## Environment

| Variable | Default | |
|---|---|---|
| `VITE_API_URL` | `http://localhost:5000` | Backend origin (paths include `/api`) |
| `VITE_USE_MOCKS` | `true` | Set to `false` to call the backend |
| `VITE_MAP_CENTER` | `12.9716,77.5946,12` | Initial map view `lat,lng,zoom` |

## Routes

| Public | |
|---|---|
| `/` | Home: what CivicConnect does, stats, recent detections, how it works |
| `/map` | Explore map: markers by type and status, filters, location search; `?incident=ID` deep link |
| `/issues` | All issues: grid/list, search, type/status/date filters, sorting (filters live in the URL) |
| `/issues/:id` | Issue details: evidence, facts, history, mini-map |

| Admin (login required) | |
|---|---|
| `/admin/login` | Sign in (no public registration) |
| `/admin/dashboard` | Overview: KPIs, 14-day trend, detection mix, recent incidents, camera health, review activity |
| `/admin/incidents` | Review queue: verify, reject (with reason), mark resolved; `?incident=ID` opens details |
| `/admin/cameras` | Add, edit and delete cameras; simulated feeds are labelled separately from live CCTV |
| `/admin/video-upload` | Upload recorded footage, follow processing status, view detection summary |

## Structure

```
src/
  config/        env.js (env vars), domain.js (enum labels and colours)
  context/       AuthContext (JWT session, expiry), ToastContext
  hooks/         useAsync, useFilterParams (URL-backed filters)
  layouts/       PublicLayout, PublicFooter, AdminLayout
  routes/        AppRoutes (lazy-loaded pages), ProtectedRoute
  services/      api.js (Axios client + interceptors), tokenStorage.js,
                 adapters.js (backend Mongoose documents <-> UI shapes)
    mock/        seed.js + mockServer.js: the demo backend
  shared/        reusable components (Button, FormField, Modal, ConfirmDialog,
                 Badge, EvidenceImage, StatCard, …) and utils
  features/
    auth/        login page + auth.service
    home/        landing page
    incidents/   incident.service, public list/details, admin management
    map/         Leaflet map, markers, location picker
    dashboard/   admin overview widgets
    cameras/     camera.service, management page
    videos/      video.service, upload + processing tracking
```

Pages only call feature services. Each service decides between the real API
and the mock (`USE_MOCKS`), and real responses go through `adapters.js`, so
moving to the backend needs no UI changes. See
[docs/API_CONTRACT.md](docs/API_CONTRACT.md) for which backend endpoints exist,
which are missing, and the exact shapes the UI expects.

## Honesty rules the UI follows

- Recorded footage is never presented as live CCTV: cameras carry a
  "Simulated feed" badge, and the upload page is labelled as a simulation.
- Video results appear only when the backend reports `COMPLETED`; mock results
  are labelled "Sample results".
- Sample incidents have no evidence frame and show a labelled placeholder,
  never a stock photo.
- Rejected detections are hidden from the public portal.
