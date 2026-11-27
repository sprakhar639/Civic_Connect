# CivicConnect

CivicConnect is a computer-vision-based civic issue monitoring system.

The system uses continuous CCTV feeds to detect civic issues such as potholes and garbage using YOLO, track detected objects, create incidents, and display them through a monitoring dashboard.

## Core Flow

CCTV Feed
→ Frame Sampling
→ YOLO Detection
→ Confidence Filtering
→ Object Tracking
→ Temporal Confirmation
→ Incident Management
→ MongoDB
→ Dashboard

## Repository layout

| Folder | |
|---|---|
| `backend/` | Node.js + Express + MongoDB API |
| `frontend/` | React public portal and admin console. See [frontend/README.md](frontend/README.md) |

The frontend runs in demo mode on sample data until the backend endpoints it
needs are available. [frontend/docs/API_CONTRACT.md](frontend/docs/API_CONTRACT.md)
lists them.
