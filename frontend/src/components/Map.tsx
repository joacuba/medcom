import { MapContainer, TileLayer, Polyline, GeoJSON, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import type { LatLngTuple } from "leaflet"

const LIMA: LatLngTuple = [-12.0464, -77.0428]

export function Map({ route, selectedUsers = [], selectedDoctor }: { route?: any, selectedUsers?: any[], selectedDoctor?: any }) {
  console.log("Map component received route:", route);
  // Use a stringified version of the route as a key to force remount
  const geoJsonKey = route ? JSON.stringify(route) : "empty";
  return (
    <MapContainer center={LIMA} zoom={12} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {route && (route.type === "FeatureCollection" || route.type === "Feature") ? (
        <GeoJSON data={route} key={geoJsonKey} />
      ) : route && Array.isArray(route) ? (
        <Polyline positions={route} color="blue" />
      ) : null}
      {selectedUsers.map(user => (
        <Marker key={user._id} position={[user.latitude, user.longitude]}>
          <Popup>
            <div>
              <div><b>{user.name}</b></div>
              <div>Lat: {user.latitude}</div>
              <div>Lng: {user.longitude}</div>
            </div>
          </Popup>
        </Marker>
      ))}
      {selectedDoctor && (
        <Marker key={selectedDoctor._id} position={[selectedDoctor.latitude, selectedDoctor.longitude]}>
          <Popup>
            <div>
              <div><b>{selectedDoctor.name}</b></div>
              <div>Lat: {selectedDoctor.latitude}</div>
              <div>Lng: {selectedDoctor.longitude}</div>
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  )
} 