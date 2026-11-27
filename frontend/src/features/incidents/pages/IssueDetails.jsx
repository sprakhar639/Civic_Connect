import { ArrowLeft, ChevronRight, Map as MapIcon, SearchX } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import useAsync from "../../../hooks/useAsync";
import { ButtonLink } from "../../../shared/components/Button";
import Card, { CardHeader } from "../../../shared/components/Card";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import EvidenceImage from "../../../shared/components/EvidenceImage";
import { SkeletonBlock } from "../../../shared/components/Loader";
import { ISSUE_TYPES } from "../../../config/domain";
import { hasCoordinates } from "../../../shared/utils/incidents";
import IncidentMiniMap from "../../map/components/IncidentMiniMap";
import IncidentFacts from "../components/IncidentFacts";
import IncidentTimeline from "../components/IncidentTimeline";
import { getPublicIncident } from "../incident.service";

function NotListed() {
  return (
    <Card>
      <EmptyState
        icon={SearchX}
        title="Incident not found"
        description="This incident doesn't exist or isn't publicly listed."
        action={<ButtonLink to="/issues" variant="secondary">Browse all issues</ButtonLink>}
      />
    </Card>
  );
}

export default function IssueDetails() {
  const { id } = useParams();
  const { data: incident, loading, error, reload } = useAsync(() => getPublicIncident(id), [id]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-sm text-mute">
        <Link to="/issues" className="inline-flex items-center gap-1 hover:text-ink">
          <ArrowLeft className="size-4" />
          All issues
        </Link>
        <ChevronRight className="size-3.5 text-slate-300" />
        <span className="font-mono text-ink">{incident?.ref ?? id}</span>
      </nav>

      {loading ? (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <SkeletonBlock className="aspect-video rounded-xl" />
          <SkeletonBlock className="h-96 rounded-xl" />
        </div>
      ) : error?.status === 404 || (!error && !incident) ? (
        <NotListed />
      ) : error ? (
        <Card>
          <ErrorState error={error} onRetry={reload} />
        </Card>
      ) : (
        <>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-wide text-brand uppercase">
                {ISSUE_TYPES[incident.type].label} detection
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink">{incident.location.address}</h1>
            </div>
            {hasCoordinates(incident) && (
              <ButtonLink to={`/map?incident=${incident.id}`} variant="secondary">
                <MapIcon className="size-4" />
                View on map
              </ButtonLink>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="flex flex-col gap-6">
              <Card className="overflow-hidden">
                <EvidenceImage incident={incident} className="aspect-video w-full" />
                <p className="border-t border-line px-4 py-2.5 text-xs text-mute">
                  Evidence frame captured by {incident.camera.name} ({incident.camera.id}).
                </p>
              </Card>

              <Card>
                <CardHeader title="Incident history" description="Detection and review events, oldest first." />
                <div className="p-5">
                  <IncidentTimeline history={incident.history} />
                </div>
              </Card>
            </div>

            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader title="Details" />
                <div className="px-5">
                  <IncidentFacts incident={incident} />
                </div>
              </Card>

              {hasCoordinates(incident) && (
              <Card className="overflow-hidden">
                <IncidentMiniMap incident={incident} />
                <Link
                  to={`/map?incident=${incident.id}`}
                  className="flex items-center justify-between border-t border-line px-4 py-3 text-sm font-medium text-brand hover:bg-slate-50"
                >
                  Open in Explore Map
                  <ChevronRight className="size-4" />
                </Link>
              </Card>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
