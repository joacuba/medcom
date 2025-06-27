import { MapContainer, TileLayer, Polyline, GeoJSON } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import type { LatLngTuple } from "leaflet"

const LIMA: LatLngTuple = [-12.0464, -77.0428]

export function Map({ route }: { route?: any }) {
  return (
    <MapContainer center={LIMA} zoom={12} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {route && (route.type === "FeatureCollection" || route.type === "Feature") ? (
        <GeoJSON data={route} />
      ) : route && Array.isArray(route) ? (
        <Polyline positions={route} color="blue" />
      ) : null}
    </MapContainer>
  )
} 