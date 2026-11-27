// Filtering, sorting and aggregation shared by the public and admin views.

export const DATE_RANGES = {
  ALL: { label: "Any time", days: null },
  "24H": { label: "Last 24 hours", days: 1 },
  "7D": { label: "Last 7 days", days: 7 },
  "30D": { label: "Last 30 days", days: 30 },
};

export const EMPTY_FILTERS = { query: "", type: "ALL", status: "ALL", range: "ALL" };

export function filterIncidents(incidents, { query = "", type = "ALL", status = "ALL", range = "ALL" }) {
  const needle = query.trim().toLowerCase();
  const days = DATE_RANGES[range]?.days;
  const since = days ? Date.now() - days * 24 * 3600 * 1000 : null;

  return incidents.filter((incident) => {
    if (type !== "ALL" && incident.type !== type) return false;
    if (status !== "ALL" && incident.status !== status) return false;
    if (since && new Date(incident.detectedAt).getTime() < since) return false;
    if (!needle) return true;
    return [incident.id, incident.ref, incident.location.address, incident.location.area, incident.camera.id, incident.camera.name]
      .some((field) => field?.toLowerCase().includes(needle));
  });
}

export const SORTS = {
  LATEST: { label: "Latest first", compare: (a, b) => b.detectedAt.localeCompare(a.detectedAt) },
  OLDEST: { label: "Oldest first", compare: (a, b) => a.detectedAt.localeCompare(b.detectedAt) },
  CONFIDENCE: { label: "Highest confidence", compare: (a, b) => b.confidence - a.confidence },
};

export function sortIncidents(incidents, sort = "LATEST") {
  return [...incidents].sort(SORTS[sort].compare);
}

export function countBy(incidents, key) {
  return incidents.reduce((counts, incident) => {
    counts[incident[key]] = (counts[incident[key]] ?? 0) + 1;
    return counts;
  }, {});
}

// Daily detection counts per type for the last `days` days, oldest first.
export function dailyTrend(incidents, days = 14) {
  const buckets = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i -= 1) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    buckets.push({
      key: day.toDateString(),
      label: day.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      POTHOLE: 0,
      GARBAGE: 0,
    });
  }

  const byKey = Object.fromEntries(buckets.map((bucket) => [bucket.key, bucket]));
  for (const incident of incidents) {
    const bucket = byKey[new Date(incident.detectedAt).toDateString()];
    if (bucket) bucket[incident.type] += 1;
  }
  return buckets;
}

// Built from incident history: every status change made by a person.
export function collectActivity(incidents, limit = 7) {
  return incidents
    .flatMap((incident) =>
      incident.history.slice(1).map((entry) => ({ ...entry, incidentId: incident.id, incidentRef: incident.ref, area: incident.location.area })),
    )
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, limit);
}

export function hasCoordinates(incident) {
  return Number.isFinite(incident.location?.lat) && Number.isFinite(incident.location?.lng);
}
