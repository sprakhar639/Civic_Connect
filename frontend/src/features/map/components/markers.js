import L from "leaflet";

import { ISSUE_TYPES } from "../../../config/domain";

// Inline lucide paths (Construction, Trash2) so markers need no image assets.
const GLYPHS = {
  POTHOLE:
    '<rect x="2" y="6" width="20" height="8" rx="1"/><path d="M17 14v7"/><path d="M7 14v7"/><path d="M17 3v3"/><path d="M7 3v3"/><path d="M10 14 2.3 6.3"/><path d="m14 6 7.7 7.7"/><path d="m8 6 8 8"/>',
  GARBAGE:
    '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
};

const STATUS_RING = {
  PENDING: "#f59e0b",
  VERIFIED: "#3b82f6",
  RESOLVED: "#10b981",
  REJECTED: "#ef4444",
};

const cache = new Map();

export function incidentIcon(type, status, selected = false) {
  const key = `${type}:${status}:${selected}`;
  if (cache.has(key)) return cache.get(key);

  const size = selected ? 40 : 32;
  const color = ISSUE_TYPES[type]?.color ?? "#334155";
  const resolved = status === "RESOLVED";

  const icon = L.divIcon({
    className: "civic-marker",
    iconSize: [size, size + 8],
    iconAnchor: [size / 2, size + 6],
    popupAnchor: [0, -size],
    html: `
      <div style="position:relative;width:${size}px;height:${size + 8}px;filter:drop-shadow(0 3px 4px rgb(15 23 42 / .3))">
        <div style="width:${size}px;height:${size}px;border-radius:50% 50% 50% 4px;transform:rotate(-45deg);background:${resolved ? "#fff" : color};border:${selected ? 3 : 2}px solid ${selected ? "#0f172a" : "#fff"};display:grid;place-items:center">
          <svg style="transform:rotate(45deg)" width="${size * 0.48}" height="${size * 0.48}" viewBox="0 0 24 24" fill="none" stroke="${resolved ? color : "#fff"}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${GLYPHS[type] ?? ""}</svg>
        </div>
        <span style="position:absolute;top:-2px;right:-2px;width:11px;height:11px;border-radius:50%;background:${STATUS_RING[status] ?? "#94a3b8"};border:2px solid #fff"></span>
      </div>`,
  });

  cache.set(key, icon);
  return icon;
}

export const OSM_TILES = {
  url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};
