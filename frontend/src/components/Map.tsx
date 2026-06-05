"use client";

import { MapContainer, TileLayer, Marker, useMapEvents, ZoomControl, Rectangle, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useEffect } from "react";
import L from "leaflet";
import { useAppStore } from "@/store";
import { MapTrifold, CaretDown, Plus, CircleNotch, NavigationArrow } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";

const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// A green/different colored marker for the main base
const baseIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapProps {
  onLocationSelect: (lat: number, lng: number) => void;
  radius?: number;
  mapCenter?: { lat: number, lng: number } | null;
  selectedLocation?: { lat: number, lng: number } | null;
}

function LocationMarker({ onLocationSelect, radius = 25, selectedLocation }: MapProps) {
  const { isPlottingMainLocation, setIsPlottingMainLocation, setMainLocation, mainLocation } = useAppStore();

  useMapEvents({
    async click(e) {
      if (isPlottingMainLocation) {
        // Reverse geocode to get name
        let name = "Main Base";
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`);
          const data = await res.json();
          name = data.address?.city || data.address?.town || data.address?.village || data.address?.municipality || data.display_name.split(',')[0] || "Main Base";
        } catch(err) {
          console.error(err);
        }
        
        setMainLocation({ lat: e.latlng.lat, lng: e.latlng.lng, name });
        setIsPlottingMainLocation(false);
      } else {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      }
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

  return (
    <>
      {mainLocation && (
        <Marker position={[mainLocation.lat, mainLocation.lng]} icon={baseIcon} />
      )}
      {selectedLocation && (
        <>
          <Marker position={[selectedLocation.lat, selectedLocation.lng]} icon={customIcon} />
          <Rectangle 
            bounds={getBounds(selectedLocation.lat, selectedLocation.lng)} 
            pathOptions={{ color: '#10b981', weight: 2, fillColor: '#10b981', fillOpacity: 0.2 }} 
          />
        </>
      )}
    </>
  );
}

function ResizeFix() {
  const map = useMap();
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
}

function FlyToLocation({ center }: { center?: { lat: number, lng: number } | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (!center) return;
    
    let timeoutId: NodeJS.Timeout;
    const currentZoom = map.getZoom();
    
    // If we're already fairly zoomed in, do a slight zoom out first
    if (currentZoom > 9) {
      map.setZoom(currentZoom - 2, { animate: true }); // Zoom out a bit
      timeoutId = setTimeout(() => {
        map.flyTo([center.lat, center.lng], 14, { duration: 2.5 });
      }, 1000); // Wait for the zoom out to finish
    } else {
      // If already zoomed out, just fly directly
      map.flyTo([center.lat, center.lng], 14, { duration: 2.5 });
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [center, map]);
  
  return null;
}

function WaypointsOverlay({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  const { waypoints, addWaypoint, selectedLocation, mapCenter, setMapCenter, setLocationName } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);

  const saveWaypoint = () => {
    const targetLat = selectedLocation?.lat || mapCenter?.lat;
    const targetLng = selectedLocation?.lng || mapCenter?.lng;
    
    if (targetLat && targetLng) {
      const name = prompt("Enter a name for this waypoint:");
      if (name) {
        addWaypoint({ name, lat: targetLat, lng: targetLng });
      }
    } else {
      alert("Please search for a location or click on the map to drop a pin before saving a waypoint.");
    }
    setIsOpen(false);
  };

  const loadWaypoint = (wp: any) => {
    setLocationName(wp.name);
    setMapCenter({ lat: wp.lat, lng: wp.lng }); // Force FlyToLocation to re-trigger
    onLocationSelect(wp.lat, wp.lng);
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 shadow-lg rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-95"
        >
          <MapTrifold weight="duotone" className="w-4 h-4 text-emerald-600" />
          Waypoints
          <CaretDown weight="bold" className={`w-3 h-3 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 5 }} 
              className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-2 min-w-[200px] overflow-hidden"
            >
              <div className="max-h-48 overflow-y-auto">
                {waypoints.length === 0 ? (
                  <div className="px-3 py-2 text-xs font-medium text-slate-400 text-center">No saved waypoints</div>
                ) : (
                  waypoints.map(wp => (
                    <button 
                      key={wp.id} 
                      onClick={() => loadWaypoint(wp)}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors truncate"
                    >
                      {wp.name}
                    </button>
                  ))
                )}
              </div>
              <div className="pt-2 mt-2 border-t border-slate-100">
                <button 
                  onClick={saveWaypoint}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors"
                >
                  <Plus weight="bold" className="w-3 h-3" /> Add Current View
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

function LocationButton({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  const { setMapCenter, setLocationName, addWaypoint, waypoints, removeWaypoint } = useAppStore();
  const [isLocating, setIsLocating] = useState(false);

  const handleLocate = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        onLocationSelect(latitude, longitude);
        setMapCenter({ lat: latitude, lng: longitude });
        setLocationName("Where you are");
        
        // Remove any existing instances to clean up duplicates and ensure fresh coordinates
        waypoints.filter(wp => wp.name === "Where you are").forEach(wp => {
          removeWaypoint(wp.id);
        });
        
        // Save as a waypoint automatically
        addWaypoint({ name: "Where you are", lat: latitude, lng: longitude });
        
        setIsLocating(false);
      },
      () => {
        alert("Unable to retrieve your location. Please check your browser permissions.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <>
      <button
        onClick={handleLocate}
        className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 shadow-lg rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-95 ${isLocating ? 'opacity-70 pointer-events-none' : ''}`}
      >
        {isLocating ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          >
            <CircleNotch weight="bold" className="w-4 h-4 text-emerald-600" />
          </motion.div>
        ) : (
          <NavigationArrow weight="duotone" className="w-4 h-4 text-emerald-600" />
        )}
        <span>{isLocating ? 'Locating...' : 'My Location'}</span>
      </button>
    </>
  );
}

export default function InteractiveMap({ onLocationSelect, radius = 25, mapCenter, selectedLocation }: MapProps) {
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
        <LocationMarker onLocationSelect={onLocationSelect} radius={radius} selectedLocation={selectedLocation} />
        <FlyToLocation center={mapCenter} />
        <ResizeFix />
      </MapContainer>
      <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2 items-end">
        <LocationButton onLocationSelect={onLocationSelect} />
        <WaypointsOverlay onLocationSelect={onLocationSelect} />
      </div>
    </div>
  );
}
