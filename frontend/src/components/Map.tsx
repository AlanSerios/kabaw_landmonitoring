"use client";

import { MapContainer, TileLayer, Marker, useMapEvents, ZoomControl, Rectangle, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useEffect } from "react";
import L from "leaflet";

// Fix for default marker icon in Leaflet + Next.js
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapProps {
  onLocationSelect: (lat: number, lng: number) => void;
  radius?: number;
}

function LocationMarker({ onLocationSelect, radius = 25 }: MapProps) {
  const [position, setPosition] = useState<L.LatLng | null>(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    }
  });

  // Calculate dynamic bounding box based on radius
  const getBounds = (lat: number, lng: number) => {
    const latRadius = radius / 111320;
    const lngRadius = radius / (111320 * Math.cos((lat * Math.PI) / 180));
    return [
      [lat - latRadius, lng - lngRadius],
      [lat + latRadius, lng + lngRadius],
    ] as [number, number][];
  };

  return position === null ? null : (
    <>
      <Marker position={position} icon={customIcon} />
      <Rectangle 
        bounds={getBounds(position.lat, position.lng)} 
        pathOptions={{ color: '#10b981', weight: 2, fillColor: '#10b981', fillOpacity: 0.2 }} 
      />
    </>
  );
}

function ResizeFix() {
  const map = useMap();
  useEffect(() => {
    // Invalidate size after layout completes so Leaflet knows its true flexbox height
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 500);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

export default function InteractiveMap({ onLocationSelect, radius = 25 }: MapProps) {
  // Default center roughly over Mindanao
  const defaultCenter: L.LatLngExpression = [8.4772, 124.6459];

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={9} 
        scrollWheelZoom={true} 
        className="w-full h-full rounded-3xl overflow-hidden shadow-[0_20px_40px_-15px_rgba(16,185,129,0.15)]"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://maps.google.com">Google Maps</a>'
          url="https://mt{s}.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}"
          subdomains={['0', '1', '2', '3']}
          maxZoom={20}
          maxNativeZoom={19}
          updateWhenZooming={false}
          keepBuffer={4}
        />
        <ZoomControl position="bottomright" />
        <LocationMarker onLocationSelect={onLocationSelect} radius={radius} />
        <ResizeFix />
      </MapContainer>
    </div>
  );
}
