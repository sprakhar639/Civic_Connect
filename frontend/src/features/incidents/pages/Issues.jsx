import { LayoutGrid, List, SearchX } from "lucide-react";
import { useMemo, useState } from "react";

import { PUBLIC_STATUSES } from "../../../config/domain";
import useAsync from "../../../hooks/useAsync";
import useFilterParams from "../../../hooks/useFilterParams";
import Button from "../../../shared/components/Button";
import Card from "../../../shared/components/Card";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import { SkeletonBlock } from "../../../shared/components/Loader";
import PageHeader from "../../../shared/components/PageHeader";
import { EMPTY_FILTERS, filterIncidents, SORTS, sortIncidents } from "../../../shared/utils/incidents";
import IncidentCard from "../components/IncidentCard";
import IncidentFilters, { FilterSelect } from "../components/IncidentFilters";
import IncidentRow from "../components/IncidentRow";
import { getPublicIncidents } from "../incident.service";

const PAGE_SIZE = 12;
const DEFAULTS = { ...EMPTY_FILTERS, sort: "LATEST", view: "grid" };

export default function Issues() {
  const { data: incidents, loading, error, reload } = useAsync(getPublicIncidents);
  const [filters, setFilters] = useFilterParams(DEFAULTS);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const results = useMemo(
    () => (incidents ? sortIncidents(filterIncidents(incidents, filters), filters.sort) : []),
    [incidents, filters],
  );

  function changeFilters(next) {
    setFilters(next);
    setVisible(PAGE_SIZE);
  }

  const isFiltered = ["query", "type", "status", "range"].some((key) => filters[key] !== DEFAULTS[key]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Public record"
        title="Detected civic issues"
        description="Potholes and garbage detected in CCTV footage. Every detection is reviewed by an operator; rejected false positives are not listed."
      />

      <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <IncidentFilters filters={filters} onChange={changeFilters} statuses={PUBLIC_STATUSES}>
          <FilterSelect
            label="Sort"
            value={filters.sort}
            onChange={(sort) => setFilters({ sort })}
            options={Object.entries(SORTS).map(([key, meta]) => [key, meta.label])}
          />
        </IncidentFilters>

        <div className="flex items-center justify-between gap-3 xl:justify-end">
          <p className="text-sm text-mute" aria-live="polite">
            {loading ? "Loading…" : `${results.length} ${results.length === 1 ? "issue" : "issues"}`}
          </p>
          <div className="flex rounded-lg border border-line bg-white p-0.5" role="group" aria-label="View">
            {[
              ["grid", LayoutGrid, "Grid view"],
              ["list", List, "List view"],
            ].map(([view, Icon, label]) => (
              <button
                key={view}
                type="button"
                onClick={() => setFilters({ view })}
                aria-label={label}
                aria-pressed={filters.view === view}
                className={`rounded-md p-1.5 transition ${filters.view === view ? "bg-slate-100 text-ink" : "text-slate-400 hover:text-ink"}`}
              >
                <Icon className="size-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {error ? (
        <Card>
          <ErrorState error={error} onRetry={reload} />
        </Card>
      ) : loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <SkeletonBlock key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <Card>
          <EmptyState
            icon={SearchX}
            title={isFiltered ? "No issues match these filters" : "No issues detected yet"}
            description={
              isFiltered
                ? "Try a different search term or widen the filters."
                : "Detected potholes and garbage will appear here once footage has been analysed."
            }
            action={
              isFiltered && (
                <Button variant="secondary" onClick={() => changeFilters(EMPTY_FILTERS)}>
                  Clear filters
                </Button>
              )
            }
          />
        </Card>
      ) : (
        <>
          {filters.view === "grid" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {results.slice(0, visible).map((incident) => (
                <IncidentCard key={incident.id} incident={incident} />
              ))}
            </div>
          ) : (
            <Card className="divide-y divide-line overflow-hidden">
              {results.slice(0, visible).map((incident) => (
                <IncidentRow key={incident.id} incident={incident} />
              ))}
            </Card>
          )}

          {visible < results.length && (
            <div className="mt-8 flex justify-center">
              <Button variant="secondary" onClick={() => setVisible((count) => count + PAGE_SIZE)}>
                Show more ({results.length - visible} remaining)
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
