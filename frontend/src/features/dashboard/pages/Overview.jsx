import { CheckCircle2, ClipboardCheck, Hourglass, ListChecks } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../../context/AuthContext";
import useAsync from "../../../hooks/useAsync";
import { StatusBadge, TypeBadge } from "../../../shared/components/Badge";
import Card, { CardHeader } from "../../../shared/components/Card";
import ConfidenceMeter from "../../../shared/components/ConfidenceMeter";
import ErrorState from "../../../shared/components/ErrorState";
import Loader from "../../../shared/components/Loader";
import PageHeader from "../../../shared/components/PageHeader";
import StatCard from "../../../shared/components/StatCard";
import { formatRelative } from "../../../shared/utils/format";
import { collectActivity, countBy, dailyTrend, sortIncidents } from "../../../shared/utils/incidents";
import { getCameras } from "../../cameras/camera.service";
import { getIncidents } from "../../incidents/incident.service";
import ActivityFeed from "../components/ActivityFeed";
import CameraSummary from "../components/CameraSummary";
import StatusBreakdown from "../components/StatusBreakdown";
import TrendChart from "../components/TrendChart";
import TypeSplit from "../components/TypeSplit";

function Section({ state, children }) {
  if (state.loading) return <Loader className="py-12" />;
  if (state.error) return <ErrorState error={state.error} onRetry={state.reload} className="py-10" />;
  return children(state.data);
}

export default function Overview() {
  const { user } = useAuth();
  const incidentsState = useAsync(getIncidents);
  const camerasState = useAsync(getCameras);
  const incidents = incidentsState.data;

  const derived = useMemo(() => {
    if (!incidents) return null;
    return {
      byStatus: countBy(incidents, "status"),
      byType: countBy(incidents, "type"),
      trend: dailyTrend(incidents, 14),
      recent: sortIncidents(incidents).slice(0, 6),
      activity: collectActivity(incidents),
    };
  }, [incidents]);

  const loading = incidentsState.loading;

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0] ?? "admin"}`}
        description="Detection volume, review backlog and camera health at a glance."
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Total incidents" value={incidents?.length} icon={ListChecks} accent="blue" loading={loading} hint="All detections, including rejected" />
        <Link to="/admin/incidents?status=PENDING" className="rounded-xl transition hover:ring-2 hover:ring-amber-200">
          <StatCard label="Pending verification" value={derived?.byStatus.PENDING ?? 0} icon={Hourglass} accent="orange" loading={loading} hint="Awaiting operator review" />
        </Link>
        <StatCard label="Verified" value={derived?.byStatus.VERIFIED ?? 0} icon={ClipboardCheck} accent="blue" loading={loading} hint="Confirmed, not yet fixed" />
        <StatCard label="Resolved" value={derived?.byStatus.RESOLVED ?? 0} icon={CheckCircle2} accent="green" loading={loading} hint={`${derived?.byStatus.REJECTED ?? 0} rejected as false positives`} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Detections over the last 14 days" description="New incidents per day, by issue type" />
          <div className="p-5">
            <Section state={incidentsState}>{() => <TrendChart data={derived.trend} />}</Section>
          </div>
        </Card>

        <Card>
          <CardHeader title="Detection mix" description="Potholes vs garbage, and where each detection stands" />
          <div className="p-5">
            <Section state={incidentsState}>
              {() => (
                <>
                  <TypeSplit counts={derived.byType} />
                  <h3 className="mt-6 mb-3 border-t border-line pt-5 text-xs font-semibold text-slate-500">By status</h3>
                  <StatusBreakdown counts={derived.byStatus} />
                </>
              )}
            </Section>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="overflow-hidden xl:col-span-2">
          <CardHeader
            title="Recent incidents"
            action={<Link to="/admin/incidents" className="text-xs font-semibold text-brand hover:text-brand-2">View all →</Link>}
          />
          <Section state={incidentsState}>
            {() => (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead className="bg-slate-50 text-left text-xs font-medium text-mute">
                    <tr>
                      <th className="px-5 py-2.5 font-medium">Incident</th>
                      <th className="px-3 py-2.5 font-medium">Location</th>
                      <th className="px-3 py-2.5 font-medium">Confidence</th>
                      <th className="px-3 py-2.5 font-medium">Detected</th>
                      <th className="px-5 py-2.5 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {derived.recent.map((incident) => (
                      <tr key={incident.id} className="hover:bg-slate-50">
                        <td className="px-5 py-3">
                          <Link to={`/admin/incidents?incident=${incident.id}`} className="block">
                            <span className="font-mono text-xs font-medium text-brand">{incident.ref}</span>
                            <span className="mt-1 block"><TypeBadge type={incident.type} /></span>
                          </Link>
                        </td>
                        <td className="max-w-48 truncate px-3 py-3 text-slate-700">{incident.location.area}</td>
                        <td className="px-3 py-3"><ConfidenceMeter value={incident.confidence} /></td>
                        <td className="px-3 py-3 whitespace-nowrap text-mute">{formatRelative(incident.detectedAt)}</td>
                        <td className="px-5 py-3"><StatusBadge status={incident.status} short /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Camera status" />
            <div className="p-5">
              <Section state={camerasState}>{(cameras) => <CameraSummary cameras={cameras} />}</Section>
            </div>
          </Card>

          <Card>
            <CardHeader title="Recent review activity" description="Status changes made by operators" />
            <div className="p-5">
              <Section state={incidentsState}>{() => <ActivityFeed activity={derived.activity} />}</Section>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
