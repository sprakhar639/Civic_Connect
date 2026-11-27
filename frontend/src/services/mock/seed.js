// Sample data for demo mode. None of these are real detections: locations are
// well-known Bengaluru localities with random offsets, and every record is
// flagged `isSample: true` so the UI can label it.

const AREAS = [
  { area: "MG Road", street: "Mahatma Gandhi Rd", lat: 12.9756, lng: 77.605 },
  { area: "Koramangala", street: "80 Feet Rd, 5th Block", lat: 12.9352, lng: 77.6245 },
  { area: "Indiranagar", street: "100 Feet Rd", lat: 12.9719, lng: 77.6412 },
  { area: "Whitefield", street: "Whitefield Main Rd", lat: 12.9698, lng: 77.75 },
  { area: "Jayanagar", street: "11th Main Rd, 4th Block", lat: 12.925, lng: 77.5838 },
  { area: "HSR Layout", street: "27th Main Rd, Sector 2", lat: 12.9116, lng: 77.6474 },
  { area: "Hebbal", street: "Bellary Rd, Hebbal Flyover", lat: 13.0358, lng: 77.597 },
  { area: "Marathahalli", street: "Outer Ring Rd, Marathahalli Bridge", lat: 12.9569, lng: 77.7011 },
  { area: "Electronic City", street: "Hosur Rd, Phase 1", lat: 12.8452, lng: 77.6602 },
  { area: "Yeshwanthpur", street: "Tumkur Rd, Yeshwanthpur Circle", lat: 13.0285, lng: 77.54 },
  { area: "Silk Board", street: "Hosur Rd, Silk Board Junction", lat: 12.9172, lng: 77.6229 },
  { area: "Malleshwaram", street: "Sampige Rd, 8th Cross", lat: 13.0035, lng: 77.5709 },
];

const OPERATORS = ["Demo Admin", "Field Operator"];

const DAY = 24 * 60 * 60 * 1000;

// Deterministic PRNG so every fresh demo starts with the same dataset.
function mulberry32(seed) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildCameras(random, now) {
  return AREAS.map((spot, index) => {
    const offline = index === 6 || index === 10;
    return {
      id: `CAM-BLR-${String(index + 1).padStart(3, "0")}`,
      name: `${spot.area} camera`,
      location: {
        address: `${spot.street}, ${spot.area}`,
        area: spot.area,
        lat: spot.lat,
        lng: spot.lng,
      },
      status: offline ? "OFFLINE" : "ONLINE",
      source: "SIMULATED",
      streamUrl: `recordings/cam-blr-${String(index + 1).padStart(3, "0")}.mp4`,
      lastSeenAt: new Date(now - (offline ? (2 + random() * 30) * 60 * 60 * 1000 : random() * 5 * 60 * 1000)).toISOString(),
      createdAt: new Date(now - 45 * DAY).toISOString(),
      isSample: true,
    };
  });
}

function buildHistory(random, detectedAt, finalStatus) {
  const history = [
    { status: "PENDING", at: detectedAt, by: "CivicConnect AI", note: "Detected in camera footage" },
  ];
  if (finalStatus === "PENDING") return history;

  const reviewedAt = new Date(new Date(detectedAt).getTime() + (1 + random() * 20) * 60 * 60 * 1000).toISOString();
  const reviewer = OPERATORS[Math.floor(random() * OPERATORS.length)];

  if (finalStatus === "REJECTED") {
    history.push({ status: "REJECTED", at: reviewedAt, by: reviewer, note: "False positive: shadow on road surface" });
    return history;
  }

  history.push({ status: "VERIFIED", at: reviewedAt, by: reviewer, note: "Confirmed from evidence frame" });
  if (finalStatus === "VERIFIED") return history;

  const resolvedAt = new Date(new Date(reviewedAt).getTime() + (1 + random() * 5) * DAY).toISOString();
  history.push({ status: "RESOLVED", at: resolvedAt, by: reviewer, note: "Field team reported the issue fixed" });
  return history;
}

function pickStatus(random, ageDays) {
  const roll = random();
  if (ageDays < 2) return roll < 0.75 ? "PENDING" : "VERIFIED";
  if (ageDays < 10) {
    if (roll < 0.3) return "PENDING";
    if (roll < 0.65) return "VERIFIED";
    if (roll < 0.88) return "RESOLVED";
    return "REJECTED";
  }
  if (roll < 0.1) return "PENDING";
  if (roll < 0.3) return "VERIFIED";
  if (roll < 0.88) return "RESOLVED";
  return "REJECTED";
}

function buildIncidents(random, cameras, now) {
  const incidents = [];

  for (let i = 0; i < 56; i += 1) {
    const camera = cameras[Math.floor(random() * cameras.length)];
    const ageDays = random() ** 1.6 * 30;
    const detectedAt = new Date(now - ageDays * DAY).toISOString();
    const status = pickStatus(random, ageDays);
    const history = buildHistory(random, detectedAt, status);

    incidents.push({
      id: `INC-${1001 + i}`,
      ref: `INC-${1001 + i}`,
      type: random() < 0.55 ? "POTHOLE" : "GARBAGE",
      status,
      confidence: Math.round((0.62 + random() * 0.36) * 100) / 100,
      location: {
        address: camera.location.address,
        area: camera.location.area,
        lat: Math.round((camera.location.lat + (random() - 0.5) * 0.008) * 1e5) / 1e5,
        lng: Math.round((camera.location.lng + (random() - 0.5) * 0.008) * 1e5) / 1e5,
      },
      camera: { id: camera.id, name: camera.name, source: camera.source },
      detectedAt,
      updatedAt: history.at(-1).at,
      imageUrl: null,
      history,
      isSample: true,
    });
  }

  return incidents.sort((a, b) => b.detectedAt.localeCompare(a.detectedAt));
}

export function buildSeed(now = Date.now()) {
  const random = mulberry32(20261128);
  const cameras = buildCameras(random, now);
  return {
    cameras,
    incidents: buildIncidents(random, cameras, now),
    videos: [],
  };
}

export const DEMO_CREDENTIALS = { email: "admin@civicconnect.dev", password: "admin123" };

export const DEMO_ADMIN = {
  id: "usr_demo_admin",
  name: "Demo Admin",
  email: DEMO_CREDENTIALS.email,
  role: "ADMIN",
};
