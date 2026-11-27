import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

import { MAP_DEFAULTS } from "../../../config/env";
import { StatusBadge, TypeBadge } from "../../../shared/components/Badge";
import { formatConfidence, formatDateTime } from "../../../shared/utils/format";
import { incidentIcon, OSM_TILES } from "./markers";

// Fits the view to the visible markers whenever `fitKey` changes, and flies to
// the selected incident (opening its popup) whenever the selection changes.
function MapController({ incidents, loaded, selectedId, fitKey, resizeKey, markerRefs }) {
  const map = useMap();
  const incidentsRef = useRef(incidents);

  // Declared first so the effects below always read the current list.
  useEffect(() => {
    incidentsRef.current = incidents;
  }, [incidents]);

  useEffect(() => {
    const points = incidentsRef.current.map((incident) => [incident.location.lat, incident.location.lng]);
    if (points.length === 1) map.flyTo(points[0], 16, { duration: 0.6 });
    else if (points.length > 1) map.flyToBounds(points, { padding: [48, 48], maxZoom: 15, duration: 0.6 });
  }, [fitKey, map]);

  useEffect(() => {
    if (!selectedId) return;
    const incident = incidentsRef.current.find((item) => item.id === selectedId);
    if (!incident) return;
    map.flyTo([incident.location.lat, incident.location.lng], Math.max(map.getZoom(), 15), { duration: 0.6 });
    const timer = setTimeout(() => markerRefs.current.get(selectedId)?.openPopup(), 650);
    return () => clearTimeout(timer);
  }, [selectedId, loaded, map, markerRefs]);

  // Leaflet measures its container once; re-measure after it was hidden.
  useEffect(() => {
    map.invalidateSize();
  }, [resizeKey, map]);

  return null;
}

export default function IncidentMap({ incidents, loaded, selectedId, onSelect, fitKey, resizeKey, className = "" }) {
  const markerRefs = useRef(new Map());

  return (
    <MapContainer center={MAP_DEFAULTS.center} zoom={MAP_DEFAULTS.zoom} className={`h-full w-full ${className}`}>
      <TileLayer url={OSM_TILES.url} attribution={OSM_TILES.attribution} />
      <MapController
        incidents={incidents}
        loaded={loaded}
        selectedId={selectedId}
        fitKey={fitKey}
        resizeKey={resizeKey}
        markerRefs={markerRefs}
      />

      {incidents.map((incident) => (
        <Marker
          key={incident.id}
          position={[incident.location.lat, incident.location.lng]}
          icon={incidentIcon(incident.type, incident.status, incident.id === selectedId)}
          zIndexOffset={incident.id === selectedId ? 1000 : 0}
          eventHandlers={{ click: () => onSelect(incident.id) }}
          ref={(marker) => {
            if (marker) markerRefs.current.set(incident.id, marker);
            else markerRefs.current.delete(incident.id);
          }}
        >
          <Popup minWidth={240}>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <TypeBadge type={incident.type} />
                <StatusBadge status={incident.status} short />
              </div>
              <p className="!m-0 text-sm font-semibold text-ink">{incident.location.address}</p>
              <p className="!m-0 text-xs text-mute">
                {formatDateTime(incident.detectedAt)} · {formatConfidence(incident.confidence)} confidence
              </p>
              <p className="!m-0 font-mono text-xs text-mute">
                {incident.ref} · {incident.camera.id}
              </p>
              <Link
                to={`/issues/${incident.id}`}
                className="mt-1 inline-flex justify-center rounded-md bg-brand px-3 py-1.5 text-xs font-semibold !text-white hover:bg-brand-2"
              >
                View incident details
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
