import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";

import { MAP_DEFAULTS } from "../../../config/env";
import { OSM_TILES } from "./markers";

const pin = L.divIcon({
  className: "civic-marker",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  html: '<div style="width:24px;height:24px;border-radius:50%;background:#1d4ed8;border:3px solid #fff;box-shadow:0 2px 6px rgb(15 23 42/.4)"></div>',
});

function ClickHandler({ onPick }) {
  useMapEvents({
    click: (e) => onPick({ lat: Math.round(e.latlng.lat * 1e5) / 1e5, lng: Math.round(e.latlng.lng * 1e5) / 1e5 }),
  });
  return null;
}

export default function LocationPicker({ value, onPick, className = "h-48" }) {
  const hasValue = Number.isFinite(value?.lat) && Number.isFinite(value?.lng);
  return (
    <MapContainer
      center={hasValue ? [value.lat, value.lng] : MAP_DEFAULTS.center}
      zoom={hasValue ? 15 : MAP_DEFAULTS.zoom}
      className={`w-full cursor-crosshair rounded-lg ${className}`}
      attributionControl={false}
    >
      <TileLayer url={OSM_TILES.url} />
      <ClickHandler onPick={onPick} />
      {hasValue && <Marker position={[value.lat, value.lng]} icon={pin} />}
    </MapContainer>
  );
}
