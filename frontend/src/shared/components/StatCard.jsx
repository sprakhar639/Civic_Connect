import Card from "./Card";
import { SkeletonBlock } from "./Loader";

const ACCENTS = {
  blue: "bg-blue-50 text-blue-600",
  orange: "bg-amber-50 text-amber-600",
  green: "bg-emerald-50 text-emerald-600",
  red: "bg-red-50 text-red-600",
  violet: "bg-violet-50 text-violet-600",
  teal: "bg-teal-50 text-teal-600",
  slate: "bg-slate-100 text-slate-600",
};

export default function StatCard({ label, value, icon: Icon, accent = "blue", hint, loading = false }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-mute">{label}</p>
        {Icon && (
          <span className={`grid size-9 place-items-center rounded-lg ${ACCENTS[accent]}`}>
            <Icon className="size-4.5" />
          </span>
        )}
      </div>
      {loading ? (
        <SkeletonBlock className="mt-2 h-8 w-16" />
      ) : (
        <p className="mt-1 text-3xl font-bold tracking-tight text-ink tabular-nums">{value}</p>
      )}
      {hint && <p className="mt-1 text-xs text-mute">{hint}</p>}
    </Card>
  );
}
