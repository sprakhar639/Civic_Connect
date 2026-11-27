// Single place that reads Vite env vars. See .env.example.

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

// Mocks stay on until VITE_USE_MOCKS is explicitly "false".
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== "false";

const [lat, lng, zoom] = (import.meta.env.VITE_MAP_CENTER ?? "12.9716,77.5946,12")
  .split(",")
  .map(Number);

export const MAP_DEFAULTS = { center: [lat, lng], zoom };
