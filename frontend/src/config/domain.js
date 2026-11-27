// Labels and colour tones for every enum the backend returns.

export const ISSUE_TYPES = {
  POTHOLE: { label: "Pothole", plural: "Potholes", color: "#7c3aed" },
  GARBAGE: { label: "Garbage", plural: "Garbage", color: "#0d9488" },
};

export const INCIDENT_STATUSES = {
  PENDING: { label: "Pending verification", short: "Pending", tone: "orange" },
  VERIFIED: { label: "Verified", short: "Verified", tone: "blue" },
  RESOLVED: { label: "Resolved", short: "Resolved", tone: "green" },
  REJECTED: { label: "Rejected", short: "Rejected", tone: "red" },
};

// Rejected detections are false positives; the public portal hides them.
export const PUBLIC_STATUSES = ["PENDING", "VERIFIED", "RESOLVED"];

export const CAMERA_STATUSES = {
  ONLINE: { label: "Online", tone: "green" },
  OFFLINE: { label: "Offline", tone: "red" },
};

// CivicConnect has no live CCTV access yet: feeds are recorded videos.
export const CAMERA_SOURCES = {
  SIMULATED: { label: "Simulated feed", description: "Recorded video replayed as a CCTV feed" },
  CCTV: { label: "Live CCTV", description: "Direct connection to a CCTV camera" },
};

export const VIDEO_JOB_STATUSES = {
  UPLOADING: { label: "Uploading", tone: "blue" },
  QUEUED: { label: "Queued for processing", tone: "slate" },
  PROCESSING: { label: "Processing", tone: "blue" },
  COMPLETED: { label: "Processing complete", tone: "green" },
  FAILED: { label: "Processing failed", tone: "red" },
};
