import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Circle, Tooltip, useMap } from "react-leaflet";
import { magColor, magRadius } from "../quake.js";

const INDONESIA_CENTER = [-2.5, 118];

function FlyTo({ quake }) {
  const map = useMap();
  useEffect(() => {
    if (quake) map.flyTo([quake.latitude, quake.longitude], 7, { duration: 0.8 });
  }, [quake, map]);
  return null;
}

export default function QuakeMap({ quakes, places = [], selected, onSelect }) {
  return (
    <MapContainer center={INDONESIA_CENTER} zoom={5} minZoom={4} className="map">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      {places.map((p) => (
        <Circle
          key={`place-${p.id}`}
          center={[p.latitude, p.longitude]}
          radius={p.radius_km * 1000}
          pathOptions={{ color: "#2f6f8f", weight: 2, dashArray: "6 6", fillOpacity: 0.06 }}
        >
          <Tooltip>{p.name} ({p.radius_km} km)</Tooltip>
        </Circle>
      ))}
      {quakes.map((q) => {
        const isSelected = selected?.id === q.id;
        return (
          <CircleMarker
            key={q.id}
            center={[q.latitude, q.longitude]}
            radius={magRadius(q.magnitude)}
            pathOptions={{
              color: isSelected ? "#15303D" : "white",
              weight: isSelected ? 3 : 1,
              fillColor: magColor(q.magnitude),
              fillOpacity: 0.85,
            }}
            eventHandlers={{ click: () => onSelect(q) }}
          >
            <Tooltip>M {q.magnitude.toFixed(1)} · {q.region}</Tooltip>
          </CircleMarker>
        );
      })}
      <FlyTo quake={selected} />
    </MapContainer>
  );
}
