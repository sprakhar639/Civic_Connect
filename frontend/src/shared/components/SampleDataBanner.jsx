import { FlaskConical } from "lucide-react";

import { USE_MOCKS } from "../../config/env";

// Shown on every page while the app runs on the mock data layer, so sample
// records are never mistaken for real detections.
export default function SampleDataBanner({ tone = "light" }) {
  if (!USE_MOCKS) return null;

  const styles =
    tone === "dark"
      ? "border-amber-400/20 bg-amber-400/10 text-amber-200"
      : "border-amber-200 bg-amber-50 text-amber-900";

  return (
    <div className={`border-b px-4 py-2 text-center text-xs ${styles}`} role="note">
      <FlaskConical className="mr-1.5 inline size-3.5 -translate-y-px" />
      <strong className="font-semibold">Demo mode:</strong> all incidents, cameras and locations shown are sample data,
      not real detections.
    </div>
  );
}
