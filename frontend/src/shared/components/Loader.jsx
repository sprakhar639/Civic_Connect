import Spinner from "./Spinner";

export default function Loader({ label = "Loading…", className = "py-20" }) {
  return (
    <div className={`flex items-center justify-center gap-3 text-sm text-mute ${className}`} role="status">
      <Spinner className="size-5 text-brand" />
      {label}
    </div>
  );
}

export function SkeletonBlock({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200/70 ${className}`} />;
}
