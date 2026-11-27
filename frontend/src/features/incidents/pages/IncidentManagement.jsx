import { ChevronLeft, ChevronRight, Eye, RefreshCw, SearchX } from "lucide-react";
import { useMemo, useState } from "react";

import { INCIDENT_STATUSES } from "../../../config/domain";
import { useAuth } from "../../../context/AuthContext";
import useAsync from "../../../hooks/useAsync";
import useFilterParams from "../../../hooks/useFilterParams";
import { StatusBadge, TypeBadge } from "../../../shared/components/Badge";
import Button from "../../../shared/components/Button";
import Card from "../../../shared/components/Card";
import ConfidenceMeter from "../../../shared/components/ConfidenceMeter";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import EvidenceImage from "../../../shared/components/EvidenceImage";
import Loader from "../../../shared/components/Loader";
import PageHeader from "../../../shared/components/PageHeader";
import { formatDateTime } from "../../../shared/utils/format";
import { countBy, EMPTY_FILTERS, filterIncidents, SORTS, sortIncidents } from "../../../shared/utils/incidents";
import IncidentDetailModal from "../components/IncidentDetailModal";
import IncidentFilters, { FilterSelect } from "../components/IncidentFilters";
import StatusActionDialog from "../components/StatusActionDialog";
import { getIncidents } from "../incident.service";
import { REVIEWER_ROLES, STATUS_ACTIONS, actionsFor } from "../statusActions";

const PAGE_SIZE = 15;
const DEFAULTS = { ...EMPTY_FILTERS, sort: "LATEST", incident: "" };
const STATUS_TABS = ["ALL", ...Object.keys(INCIDENT_STATUSES)];

export default function IncidentManagement() {
  const { user } = useAuth();
  const canReview = REVIEWER_ROLES.includes(user?.role);
  const { data: incidents, loading, error, reload, setData } = useAsync(getIncidents);
  const [filters, setFilters] = useFilterParams(DEFAULTS);
  const [page, setPage] = useState(0);
  const [pendingAction, setPendingAction] = useState(null);

  const statusCounts = useMemo(
    () => countBy(incidents ? filterIncidents(incidents, { ...filters, status: "ALL" }) : [], "status"),
    [incidents, filters],
  );

  const results = useMemo(
    () => (incidents ? sortIncidents(filterIncidents(incidents, filters), filters.sort) : []),
    [incidents, filters],
  );

  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const rows = results.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
  const viewing = incidents?.find((incident) => incident.id === filters.incident);

  function changeFilters(next) {
    setFilters(next);
    setPage(0);
  }

  function handleUpdated(updated) {
    setData((list) => list.map((incident) => (incident.id === updated.id ? updated : incident)));
  }

  return (
    <>
      <PageHeader
        title="Incident management"
        description="Review AI detections, confirm real issues, reject false positives and close out fixed ones."
        actions={
          <Button variant="secondary" onClick={reload} disabled={loading}>
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      {!canReview && user && (
        <p className="mb-4 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">
          Your role ({user.role}) can view incidents but not change their status.
        </p>
      )}

      <div className="mb-4 flex gap-1 overflow-x-auto border-b border-line" role="tablist" aria-label="Status">
        {STATUS_TABS.map((key) => {
          const active = filters.status === key;
          const count = key === "ALL" ? Object.values(statusCounts).reduce((a, b) => a + b, 0) : statusCounts[key] ?? 0;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => changeFilters({ status: key })}
              className={`-mb-px flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition ${
                active ? "border-brand text-brand" : "border-transparent text-mute hover:text-ink"
              }`}
            >
              {key === "ALL" ? "All" : INCIDENT_STATUSES[key].short}
              <span className={`rounded-full px-1.5 text-xs tabular-nums ${active ? "bg-brand-soft" : "bg-slate-100"}`}>
                {incidents ? count : "–"}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mb-4">
        <IncidentFilters filters={filters} onChange={changeFilters} showStatus={false}>
          <FilterSelect
            label="Sort"
            value={filters.sort}
            onChange={(sort) => setFilters({ sort })}
            options={Object.entries(SORTS).map(([key, meta]) => [key, meta.label])}
          />
        </IncidentFilters>
      </div>

      <Card className="overflow-hidden">
        {error ? (
          <ErrorState error={error} onRetry={reload} />
        ) : loading && !incidents ? (
          <Loader label="Loading incidents…" />
        ) : results.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No incidents match"
            description="Adjust the search or filters to see more incidents."
            action={
              <Button variant="secondary" onClick={() => changeFilters(EMPTY_FILTERS)}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead className="border-b border-line bg-slate-50 text-left text-xs text-mute">
                  <tr>
                    <th className="px-4 py-3 font-medium">Evidence</th>
                    <th className="px-3 py-3 font-medium">Incident</th>
                    <th className="px-3 py-3 font-medium">Location</th>
                    <th className="px-3 py-3 font-medium">Camera</th>
                    <th className="px-3 py-3 font-medium">Detected</th>
                    <th className="px-3 py-3 font-medium">Confidence</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {rows.map((incident) => (
                    <tr key={incident.id} className="align-middle hover:bg-slate-50/70">
                      <td className="px-4 py-2.5">
                        <button
                          type="button"
                          onClick={() => setFilters({ incident: incident.id })}
                          aria-label={`View evidence for ${incident.ref}`}
                          className="block overflow-hidden rounded-md ring-brand/40 transition hover:ring-2"
                        >
                          <EvidenceImage incident={incident} showLabel={false} className="h-11 w-16" />
                        </button>
                      </td>
                      <td className="px-3 py-2.5">
                        <p className="font-mono text-xs font-medium text-ink">{incident.ref}</p>
                        <div className="mt-1">
                          <TypeBadge type={incident.type} />
                        </div>
                      </td>
                      <td className="max-w-44 px-3 py-2.5">
                        <p className="truncate text-ink" title={incident.location.address}>{incident.location.address}</p>
                      </td>
                      <td className="px-3 py-2.5">
                        <p className="font-mono text-xs text-ink">{incident.camera.id}</p>
                        <p className="max-w-32 truncate text-xs text-mute">{incident.camera.name}</p>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-slate-600">{formatDateTime(incident.detectedAt)}</td>
                      <td className="px-3 py-2.5">
                        <ConfidenceMeter value={incident.confidence} />
                      </td>
                      <td className="px-3 py-2.5">
                        <StatusBadge status={incident.status} short />
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex justify-end gap-1.5">
                          {canReview &&
                            actionsFor(incident.status).map((key) => (
                              <Button
                                key={key}
                                size="sm"
                                variant={key === "REJECT" ? "dangerOutline" : "secondary"}
                                onClick={() => setPendingAction({ incident, key })}
                              >
                                {STATUS_ACTIONS[key].label}
                              </Button>
                            ))}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setFilters({ incident: incident.id })}
                            aria-label={`View ${incident.ref}`}
                            title="View details"
                          >
                            <Eye className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3 text-sm text-mute">
              <p>
                {currentPage * PAGE_SIZE + 1}–{Math.min(results.length, (currentPage + 1) * PAGE_SIZE)} of {results.length}
              </p>
              <div className="flex gap-1.5">
                <Button size="sm" variant="secondary" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)} aria-label="Previous page">
                  <ChevronLeft className="size-4" />
                </Button>
                <Button size="sm" variant="secondary" disabled={currentPage >= pageCount - 1} onClick={() => setPage(currentPage + 1)} aria-label="Next page">
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {viewing && !pendingAction && (
        <IncidentDetailModal
          incident={viewing}
          canReview={canReview}
          onAction={(incident, key) => setPendingAction({ incident, key })}
          onClose={() => setFilters({ incident: "" })}
        />
      )}

      {pendingAction && (
        <StatusActionDialog
          key={`${pendingAction.incident.id}-${pendingAction.key}`}
          incident={pendingAction.incident}
          actionKey={pendingAction.key}
          onClose={() => setPendingAction(null)}
          onUpdated={handleUpdated}
        />
      )}
    </>
  );
}
