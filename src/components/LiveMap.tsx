'use client';

import { useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';

/**
 * Default marker icon fix — Next.js webpack'da leaflet image asset
 * path'ini topa olmaydi. CDN'dan URL beramiz.
 */
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

/** Courier icon — ko'kroq. */
const courierIcon = L.divIcon({
  className: '',
  html: `<div style="
    background:#0ea5e9;border:2px solid #fff;border-radius:50%;
    width:28px;height:28px;display:flex;align-items:center;justify-content:center;
    color:#fff;font-size:14px;box-shadow:0 2px 6px rgba(0,0,0,.3);
  ">🚚</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const clientIcon = L.divIcon({
  className: '',
  html: `<div style="
    background:#ef4444;border:2px solid #fff;border-radius:50%;
    width:28px;height:28px;display:flex;align-items:center;justify-content:center;
    color:#fff;font-size:14px;box-shadow:0 2px 6px rgba(0,0,0,.3);
  ">🏠</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

export interface MapMarker {
  id: string | number;
  lat: number;
  lng: number;
  label?: string;
  kind?: 'courier' | 'client' | 'default';
}

/**
 * Map view reusable komponent.
 * `followId` — shu id'ga har update'da markaz siljiydi (tracking mode).
 */
export default function LiveMap({
  markers,
  center = [41.311081, 69.240562], // Toshkent markazi
  zoom = 12,
  followId,
  height = '100%',
}: {
  markers: MapMarker[];
  center?: [number, number];
  zoom?: number;
  followId?: string | number;
  height?: string;
}) {
  return (
    <div style={{ height, width: '100%' }}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((m) => (
          <Marker
            key={m.id}
            position={[m.lat, m.lng]}
            icon={m.kind === 'courier' ? courierIcon : m.kind === 'client' ? clientIcon : defaultIcon}
          >
            {m.label && <Popup>{m.label}</Popup>}
          </Marker>
        ))}

        {followId != null && <Follower markers={markers} followId={followId} />}
      </MapContainer>
    </div>
  );
}

/**
 * `followId` target markazini yangilab turadi.
 * Alohida komponent — `useMap` faqat MapContainer'ning descendant'ida ishlaydi.
 */
function Follower({
  markers,
  followId,
}: {
  markers: MapMarker[];
  followId: string | number;
}) {
  const map = useMap();
  useEffect(() => {
    const target = markers.find((m) => m.id === followId);
    if (target) map.panTo([target.lat, target.lng]);
  }, [markers, followId, map]);
  return null;
}
