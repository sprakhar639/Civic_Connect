import { ChevronRight, List, Map as MapIcon, MapPinned } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { INCIDENT_STATUSES, ISSUE_TYPES, PUBLIC_STATUSES } from "../../../config/domain";
import useAsync from "../../../hooks/useAsync";
import { StatusBadge, TypeBadge } from "../../../shared/components/Badge";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import IssueTypeIcon from "../../../shared/components/IssueTypeIcon";
import Loader from "../../../shared/components/Loader";
import SearchInput from "../../../shared/components/SearchInput";
import { formatRelative } from "../../../shared/utils/format";
import { countBy, filterIncidents, hasCoordinates, sortIncidents } from "../../../shared/utils/incidents";
import { getPublicIncidents } from "../../incidents/incident.service";
import IncidentMap from "../components/IncidentMap";
import MapLegend from "../components/MapLegend";

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${
        active ? "border-brand bg-brand-soft text-brand" : "border-line bg-white text-slate-600 hover:border-slate-300"
      }`}
    >
      {children}
    </button>
  );
}

export default function ExploreMap() {
  const { data: incidents, loading, error, reload } = useAsync(getPublicIncidents);
  const [params, setParams] = useSearchParams();
  const selectedId = params.get("incident");

  const [query, setQuery] = useState("");
  const [type, setType] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [mobileView, setMobileView] = useState("map");

  const visible = useMemo(
    () => (incidents ? sortIncidents(filterIncidents(incidents, { query, type, status })) : []),
    [incidents, query, type, status],
  );

  const mappable = useMemo(() => visible.filter(hasCoordinates), [visible]);
  const typeCounts = useMemo(() => countBy(visible, "type"), [visible]);
  const statusCounts = useMemo(() => countBy(visible, "status"), [visible]);

  // Refit the map whenever the filters change. A deep link (?incident=ID)
  // skips the initial fit so the map flies straight to that incident.
  const [deepLinked] = useState(Boolean(selectedId));
  const filtersKey = `${query}|${type}|${status}`;
  const fitKey = deepLinked && filtersKey === "|ALL|ALL" ? "deep-link" : `${filtersKey}|${Boolean(incidents)}`;

  function select(id) {
    setParams(id ? { incident: id } : {}, { replace: true });
    if (id) setMobileView("map");
  }

  const selected = visible.find((incident) => incident.id === selectedId);

  const panel = (
    <div className="flex h-full flex-col">
      <div className="space-y-3 border-b border-line p-4">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search area, street or incident ID"
          label="Search locations"
          debounceMs={350}
        />
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Issue type">
          <Chip active={type === "ALL"} onClick={() => setType("ALL")}>All types</Chip>
          {Object.entries(ISSUE_TYPES).map(([key, meta]) => (
            <Chip key={key} active={type === key} onClick={() => setType(key)}>
              <IssueTypeIcon type={key} className="size-3" />
              {meta.label}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Status">
          <Chip active={status === "ALL"} onClick={() => setStatus("ALL")}>All statuses</Chip>
          {PUBLIC_STATUSES.map((key) => (
            <Chip key={key} active={status === key} onClick={() => setStatus(key)}>
              {INCIDENT_STATUSES[key].short}
            </Chip>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-px border-b border-line bg-line text-center">
        {[
          ["Showing", visible.length],
          [ISSUE_TYPES.POTHOLE.plural, typeCounts.POTHOLE ?? 0],
          [ISSUE_TYPES.GARBAGE.plural, typeCounts.GARBAGE ?? 0],
        ].map(([label, value]) => (
          <div key={label} className="bg-white px-2 py-3">
            <p className="text-lg font-bold text-ink tabular-nums">{value}</p>
            <p className="text-[11px] text-mute">{label}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-3 border-b border-line px-4 py-2 text-[11px] text-mute">
        {PUBLIC_STATUSES.map((key) => (
          <span key={key}>
            {INCIDENT_STATUSES[key].short}: <strong className="text-ink">{statusCounts[key] ?? 0}</strong>
          </span>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <Loader label="Loading incidents…" />
        ) : error ? (
          <ErrorState error={error} onRetry={reload} />
        ) : visible.length === 0 ? (
          <EmptyState icon={MapPinned} title="No incidents here" description="Try another search or clear the filters." />
        ) : (
          <ul className="divide-y divide-line">
            {visible.map((incident) => (
              <li key={incident.id}>
                <button
                  type="button"
                  onClick={() => select(incident.id)}
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50 ${
                    incident.id === selectedId ? "bg-brand-soft/60" : ""
                  }`}
                >
                  <span
                    className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg text-white"
                    style={{ background: ISSUE_TYPES[incident.type].color }}
                  >
                    <IssueTypeIcon type={incident.type} className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">{incident.location.address}</span>
                    <span className="mt-0.5 flex items-center gap-2 text-xs text-mute">
                      <span className="font-mono">{incident.ref}</span>· {formatRelative(incident.detectedAt)}
                    </span>
                  </span>
                  <StatusBadge status={incident.status} short />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="flex border-b border-line md:hidden" role="tablist">
        {[
          ["map", MapIcon, "Map"],
          ["list", List, `List (${visible.length})`],
        ].map(([view, Icon, label]) => (
          <button
            key={view}
            type="button"
            role="tab"
            aria-selected={mobileView === view}
            onClick={() => setMobileView(view)}
            className={`flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-medium ${
              mobileView === view ? "border-b-2 border-brand text-brand" : "text-mute"
            }`}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      <aside
        className={`min-h-0 flex-1 border-line bg-white md:block md:w-96 md:flex-none md:border-r ${mobileView === "list" ? "block" : "hidden"}`}
      >
        {panel}
      </aside>

      <section className={`relative min-h-0 flex-1 md:block ${mobileView === "map" ? "block" : "hidden"}`}>
        <IncidentMap
          incidents={mappable}
          loaded={Boolean(incidents)}
          selectedId={selectedId}
          onSelect={select}
          fitKey={fitKey}
          resizeKey={mobileView}
        />

        <div className="pointer-events-none absolute bottom-6 left-3 z-[400] hidden sm:block">
          <MapLegend />
        </div>

        {selected && (
          <div className="absolute inset-x-3 bottom-3 z-[400] sm:left-auto sm:w-80">
            <div className="rounded-xl border border-line bg-white p-4 shadow-xl">
              <div className="flex items-center justify-between gap-2">
                <TypeBadge type={selected.type} />
                <button type="button" onClick={() => select(null)} className="text-xs text-mute hover:text-ink">
                  Clear
                </button>
              </div>
              <p className="mt-2 text-sm font-semibold text-ink">{selected.location.address}</p>
              <div className="mt-2 flex items-center justify-between">
                <StatusBadge status={selected.status} />
                <Link
                  to={`/issues/${selected.id}`}
                  className="inline-flex items-center gap-0.5 text-sm font-semibold text-brand hover:text-brand-2"
                >
                  Details
                  <ChevronRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
