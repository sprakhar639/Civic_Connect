import { MapContainer, Marker, TileLayer } from "react-leaflet";

import { incidentIcon, OSM_TILES } from "./markers";

export default function IncidentMiniMap({ incident, className = "h-56" }) {
  const position = [incident.location.lat, incident.location.lng];
  return (
    <MapContainer
      center={position}
      zoom={16}
      scrollWheelZoom={false}
      className={`w-full ${className}`}
      attributionControl={false}
    >
      <TileLayer url={OSM_TILES.url} />
      <Marker position={position} icon={incidentIcon(incident.type, incident.status, true)} />
    </MapContainer>
  );
}
