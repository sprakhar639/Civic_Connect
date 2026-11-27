import { ArrowRight, BrainCircuit, CheckCircle2, Construction, Map as MapIcon, ShieldCheck, Trash2, TriangleAlert, Video } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";

import useAsync from "../../../hooks/useAsync";
import { ButtonLink } from "../../../shared/components/Button";
import Card from "../../../shared/components/Card";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import { SkeletonBlock } from "../../../shared/components/Loader";
import StatCard from "../../../shared/components/StatCard";
import { countBy, sortIncidents } from "../../../shared/utils/incidents";
import IncidentCard from "../../incidents/components/IncidentCard";
import { getPublicIncidents } from "../../incidents/incident.service";
import HeroIllustration from "../components/HeroIllustration";

const STEPS = [
  {
    icon: Video,
    title: "Footage is collected",
    body: "Recorded CCTV video is uploaded for a camera location. Live camera feeds can be added once access is granted.",
  },
  {
    icon: BrainCircuit,
    title: "AI scans every frame",
    body: "A YOLO-based model detects potholes and garbage, and object tracking stops the same issue being counted twice.",
  },
  {
    icon: ShieldCheck,
    title: "Operators verify",
    body: "Each detection, with its evidence frame and confidence score, is reviewed by a city operator who verifies or rejects it.",
  },
  {
    icon: CheckCircle2,
    title: "Tracked to resolution",
    body: "Issues appear on the public map with their review status and stay listed until fixed. Rejected false positives are removed.",
  },
];

export default function Home() {
  const { data: incidents, loading, error, reload } = useAsync(getPublicIncidents);

  const stats = useMemo(() => {
    if (!incidents) return null;
    const byType = countBy(incidents, "type");
    const byStatus = countBy(incidents, "status");
    return {
      total: incidents.length,
      potholes: byType.POTHOLE ?? 0,
      garbage: byType.GARBAGE ?? 0,
      resolved: byStatus.RESOLVED ?? 0,
    };
  }, [incidents]);

  const recent = useMemo(() => (incidents ? sortIncidents(incidents).slice(0, 4) : []), [incidents]);

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div
          className="absolute inset-0 -z-10 opacity-60"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0)",
            backgroundSize: "24px 24px",
            maskImage: "linear-gradient(to bottom, black, transparent 85%)",
          }}
        />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:py-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              <BrainCircuit className="size-3.5" />
              AI-powered civic monitoring
            </p>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
              Spot potholes and garbage <span className="text-brand">before residents report them.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
              CivicConnect analyses CCTV footage to detect road damage and garbage build-up, has every detection verified
              by an operator, and tracks it on a public map until it&apos;s fixed.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink to="/issues" size="lg">
                Explore issues
                <ArrowRight className="size-4" />
              </ButtonLink>
              <ButtonLink to="/map" size="lg" variant="secondary">
                <MapIcon className="size-4" />
                View map
              </ButtonLink>
            </div>
            <p className="mt-6 flex items-center gap-2 text-xs text-mute">
              <TriangleAlert className="size-3.5 text-amber-500" />
              Currently processing recorded CCTV footage only, not live camera feeds.
            </p>
          </div>
          <HeroIllustration />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">Statistics</h2>
        {error ? (
          <Card>
            <ErrorState error={error} onRetry={reload} />
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Total detected incidents" value={stats?.total} icon={BrainCircuit} accent="blue" loading={loading} />
            <StatCard label="Potholes detected" value={stats?.potholes} icon={Construction} accent="violet" loading={loading} />
            <StatCard label="Garbage detected" value={stats?.garbage} icon={Trash2} accent="teal" loading={loading} />
            <StatCard label="Resolved incidents" value={stats?.resolved} icon={CheckCircle2} accent="green" loading={loading} />
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6" aria-labelledby="recent-heading">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 id="recent-heading" className="text-xl font-bold tracking-tight text-ink">Recently detected</h2>
            <p className="mt-1 text-sm text-mute">The latest issues picked up from camera footage.</p>
          </div>
          <Link to="/issues" className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:text-brand-2">
            View all
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <SkeletonBlock key={i} className="h-72 rounded-xl" />
            ))}
          </div>
        ) : error ? null : recent.length === 0 ? (
          <Card>
            <EmptyState title="No incidents yet" description="Detected issues will appear here once footage has been analysed." />
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recent.map((incident) => (
              <IncidentCard key={incident.id} incident={incident} />
            ))}
          </div>
        )}
      </section>

      <section id="how-it-works" className="scroll-mt-20 border-t border-line bg-slate-50" aria-labelledby="how-heading">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-wide text-brand uppercase">How CivicConnect works</p>
            <h2 id="how-heading" className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              From camera footage to a fixed street
            </h2>
            <p className="mt-3 text-slate-600">
              AI finds candidate issues quickly; people decide what&apos;s real. Every issue on the public map shows whether
              an operator has verified it yet.
            </p>
          </div>

          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ icon: Icon, title, body }, index) => (
              <li key={title}>
                <Card className="h-full p-5">
                  <div className="flex items-center justify-between">
                    <span className="grid size-10 place-items-center rounded-lg bg-brand-soft text-brand">
                      <Icon className="size-5" />
                    </span>
                    <span className="font-mono text-xs text-slate-400">0{index + 1}</span>
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-ink">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-mute">{body}</p>
                </Card>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
