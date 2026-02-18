"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Polyline, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { useTheme } from "next-themes";
import type { AirportCoords } from "@/types/flights";

// Spherical linear interpolation → great-circle arc points
function greatCirclePoints(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
  n = 80
): [number, number][] {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;

  const φ1 = toRad(lat1), λ1 = toRad(lon1);
  const φ2 = toRad(lat2), λ2 = toRad(lon2);

  const x1 = Math.cos(φ1) * Math.cos(λ1), y1 = Math.cos(φ1) * Math.sin(λ1), z1 = Math.sin(φ1);
  const x2 = Math.cos(φ2) * Math.cos(λ2), y2 = Math.cos(φ2) * Math.sin(λ2), z2 = Math.sin(φ2);

  const d = Math.acos(Math.min(1, x1 * x2 + y1 * y2 + z1 * z2));
  const sinD = Math.sin(d);

  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    if (sinD < 1e-10) return [lat1, lon1] as [number, number];
    const A = Math.sin((1 - t) * d) / sinD;
    const B = Math.sin(t * d) / sinD;
    const x = A * x1 + B * x2, y = A * y1 + B * y2, z = A * z1 + B * z2;
    return [toDeg(Math.atan2(z, Math.sqrt(x * x + y * y))), toDeg(Math.atan2(y, x))] as [number, number];
  });
}

// Auto-fit map to show both airports with padding
function FitBounds({ origin, dest }: { origin: AirportCoords; dest: AirportCoords }) {
  const map = useMap();
  useEffect(() => {
    const bounds = L.latLngBounds(
      [origin.lat, origin.lon],
      [dest.lat, dest.lon]
    );
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 8 });
  }, [map, origin.lat, origin.lon, dest.lat, dest.lon]);
  return null;
}

interface Props {
  origin: AirportCoords;
  destination: AirportCoords;
}

export default function RouteMap({ origin, destination }: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const arcPoints = useMemo(
    () => greatCirclePoints(origin.lat, origin.lon, destination.lat, destination.lon),
    [origin.lat, origin.lon, destination.lat, destination.lon]
  );

  // Tile layers: CartoDB — clean, free, no API key
  const tileUrl = isDark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  // Arc colour comes from CSS brand tokens
  const arcColor = isDark ? "#22d3ee" : "#f97316"; // cyan in dark, amber in light

  // Custom dot markers (avoids leaflet's broken default icon in Next.js)
  const dotIcon = useMemo(() => L.divIcon({
    className: "",
    html: `<div style="
      width:10px;height:10px;border-radius:50%;
      background:${arcColor};
      border:2px solid ${isDark ? "#0b0f1a" : "#fff"};
      box-shadow:0 0 0 3px ${arcColor}40;
    "></div>`,
    iconSize: [10, 10],
    iconAnchor: [5, 5],
  }), [arcColor, isDark]);

  // Label icons for IATA codes
  const makeLabel = (code: string, city: string) => L.divIcon({
    className: "",
    html: `<div style="
      display:flex;flex-direction:column;align-items:center;gap:2px;
      transform:translate(-50%,-100%);margin-top:-14px;
    ">
      <span style="
        font-family:monospace;font-size:11px;font-weight:700;letter-spacing:0.05em;
        color:${arcColor};background:${isDark ? "#0b0f1a" : "#fff"};
        padding:2px 6px;border-radius:4px;border:1px solid ${arcColor}40;
        white-space:nowrap;
      ">${code}</span>
      <span style="
        font-size:10px;color:${isDark ? "#94a3b8" : "#64748b"};
        white-space:nowrap;max-width:100px;overflow:hidden;text-overflow:ellipsis;
      ">${city}</span>
    </div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });

  const mid: [number, number] = [
    (origin.lat + destination.lat) / 2,
    (origin.lon + destination.lon) / 2,
  ];

  return (
    <MapContainer
      center={mid}
      zoom={4}
      className="w-full h-full"
      zoomControl={false}
      scrollWheelZoom={false}
      attributionControl={false}
    >
      {/* Re-key on theme change to swap tile layer cleanly */}
      <TileLayer key={tileUrl} url={tileUrl} />

      <FitBounds origin={origin} dest={destination} />

      {/* Glow halo */}
      <Polyline
        positions={arcPoints}
        pathOptions={{ color: arcColor, weight: 10, opacity: 0.1 }}
      />
      {/* Main arc — dashed */}
      <Polyline
        positions={arcPoints}
        pathOptions={{ color: arcColor, weight: 1.5, opacity: 0.85, dashArray: "6 5" }}
      />

      {/* Markers */}
      <Marker position={[origin.lat, origin.lon]} icon={dotIcon} />
      <Marker position={[origin.lat, origin.lon]} icon={makeLabel(origin.iataCode, origin.cityName)} />
      <Marker position={[destination.lat, destination.lon]} icon={dotIcon} />
      <Marker position={[destination.lat, destination.lon]} icon={makeLabel(destination.iataCode, destination.cityName)} />
    </MapContainer>
  );
}
