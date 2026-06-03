"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { 
  MagnifyingGlass, CalendarBlank, SquaresFour, RocketLaunch, 
  ChartLineUp, FileText, Gear, Planet, CaretDown, List,
  Thermometer, Wind, WifiHigh
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore, TabId } from "@/store";
import { useDebouncedCallback } from 'use-debounce';

import DashboardTab from "@/components/DashboardTab";
import AnalyticsTab from "@/components/AnalyticsTab";
import ReportsTab from "@/components/ReportsTab";
import SettingsTab from "@/components/SettingsTab";

// Tab Navigation Component
const NavItem = ({ id, icon: Icon, label }: { id: TabId, icon: any, label: string }) => {
  const { activeTab, setActiveTab } = useAppStore();
  const isActive = activeTab === id;
  
  const handleScroll = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveTab(id); // Keep state for highlighting
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <a 
      href={`#${id}`}
      onClick={handleScroll}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 active:scale-[0.98] ${
        isActive 
        ? 'bg-white/10 text-white shadow-inner border border-white/10' 
        : 'hover:bg-white/5 text-slate-400 hover:text-white border border-transparent'
      }`}
    >
      <Icon weight={isActive ? "duotone" : "regular"} className={`w-5 h-5 shrink-0 ${isActive ? 'text-emerald-400' : ''}`} /> 
      {label}
    </a>
  );
};

export default function Home() {
  // Global State
  const { 
    activeTab, setActiveTab,
    mapCenter, setMapCenter,
    selectedLocation, setSelectedLocation,
    scanRadius,
    waypoints, addWaypoint,
    setScanResult,
    setLocationName,
    timeframe
  } = useAppStore();

  // Local UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Live AQI State from WAQI (World Air Quality Index) API
  const [aqi, setAqi] = useState<number | null>(null);
  
  useEffect(() => {
    async function fetchAQI() {
      // Prioritize the plotted location, then map center, then fallback to Mindanao
      const targetCenter = selectedLocation || mapCenter || { lat: 8.4772, lng: 124.6459 };
      try {
        const { lat, lng } = targetCenter;
        // Fetch accurate coordinates from Open-Meteo (free, no token needed)
        const res = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=us_aqi`);
        const data = await res.json();
        if (data?.current?.us_aqi !== undefined) {
          setAqi(data.current.us_aqi);
        } else {
          setAqi(42); // fallback
        }
      } catch (err) {
        console.error("Failed to fetch AQI", err);
        setAqi(42); // fallback
      }
    }

    
    // Fetch immediately, and set up a refresh interval
    fetchAQI();
    const timer = setInterval(fetchAQI, 60000); // refresh every minute
    return () => clearInterval(timer);
  }, [mapCenter, selectedLocation]);

  // Debounced Search API Call
  const debouncedSearch = useDebouncedCallback(async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`);
      const data = await res.json();
      setSearchResults(data);
      setShowSearchResults(true);
    } catch (err) {
      console.error(err);
    }
  }, 500); // 500ms debounce to prevent API ban

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.length >= 3) {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5`);
        const data = await res.json();
        setSearchResults(data);
        setShowSearchResults(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const selectSearchResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const name = result.display_name.split(',')[0];
    
    // Update map and UI
    setMapCenter({ lat, lng });
    setSearchQuery(name);
    setLocationName(name);
    setShowSearchResults(false);
    
    // Switch to dashboard and trigger scan automatically!
    setActiveTab('dashboard');
    handleLocationSelect(lat, lng);
  };

  const handleLocationSelect = async (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    setLoading(true);
    setError("");
    setScanResult(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const response = await fetch(`${apiUrl}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          lat, 
          lng, 
          radius: useAppStore.getState().scanRadius,
          timeframe: useAppStore.getState().timeframe
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || "Failed to connect to satellite");
      }
      const data = await response.json();
      setScanResult(data);
    } catch (err: any) {
      if (err.message.includes("Failed to fetch") || err.name === "TypeError") {
        setError("Cannot reach Mission Control backend. Ensure the Python server is running.");
      } else {
        setError(err.message || "Satellite telemetry unavailable.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f9fafb] font-sans text-slate-900">
      
      {/* Sidebar (Deep Forest / Premium Contrast) - Using pure CSS for bulletproof reliability */}
      <aside 
        className={`bg-[#0a1c14] flex flex-col shrink-0 border-[#153828] overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64 opacity-100 border-r' : 'w-0 opacity-0 border-r-0'}`}
      >
        <div className="p-6 flex items-center gap-3 text-white w-64">
          <Image src="/unibase_kabaw_logo.svg" alt="Kabaw Logo" width={28} height={28} className="shrink-0" />
          <span className="font-black tracking-widest text-lg">KABAW</span>
        </div>
        
        <nav className="flex-1 px-4 py-4 flex flex-col gap-2 w-64">
          <NavItem id="dashboard" icon={SquaresFour} label="Dashboard" />
          <NavItem id="analytics" icon={ChartLineUp} label="Analytics" />
          <NavItem id="reports" icon={FileText} label="Reports" />
          <NavItem id="settings" icon={Gear} label="Settings" />
        </nav>

        <div className="p-6 border-t border-[#153828] flex items-center gap-3 hover:bg-white/5 transition-all duration-300 cursor-pointer active:scale-95 w-64">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 font-bold text-xs shadow-inner shrink-0">AS</div>
          <div className="text-sm font-bold text-white">Alan Serios</div>
        </div>
      </aside>

      {/* Main Content Area (Bento 2.0 Light Aesthetic) */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header (z-[9999] to stay above Leaflet map) */}
        <header className="px-8 py-6 flex items-center justify-between shrink-0 relative z-[9999] gap-6 bg-[#f9fafb]/80 backdrop-blur-md border-b border-slate-200/60">
          
          {/* LEFT: Menu & Title */}
          <div className="flex items-center gap-4 flex-shrink-0 min-w-[200px]">
            <Image src="/unibase_kabaw_logo.svg" alt="Kabaw Logo" width={48} height={48} className="shrink-0 drop-shadow-sm rounded-xl" />
            <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-900 hidden sm:block">
              {activeTab === 'dashboard' ? 'KABAW' : activeTab === 'analytics' ? 'Analytics' : activeTab === 'reports' ? 'Reports' : 'Settings'}
            </h1>
          </div>

          {/* CENTER: Global Search */}
          <div className="flex-1 max-w-xl mx-auto relative group z-[100]">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
              <input 
                id="location-search"
                name="location-search"
                type="text" 
                placeholder="Search location to monitor..." 
                value={searchQuery}
                onChange={handleSearchInput}
                onFocus={() => { if (searchResults.length > 0) setShowSearchResults(true); }}
                aria-label="Search for a location"
                className="pl-11 pr-4 py-3 rounded-xl border border-slate-200 shadow-sm text-sm w-full bg-white outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-medium relative z-0" 
              />
              <MagnifyingGlass weight="bold" className="w-5 h-5 absolute left-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors pointer-events-none z-10" />
            </form>
            
            <AnimatePresence>
              {showSearchResults && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: 5 }} 
                  className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-xl border border-slate-200 p-2 overflow-hidden"
                >
                  {searchResults.length === 0 ? (
                    <div className="p-3 text-xs text-slate-400 text-center font-medium">No results found</div>
                  ) : (
                    searchResults.map((res, i) => (
                      <button 
                        key={i} 
                        onClick={() => selectSearchResult(res)} 
                        className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 truncate"
                      >
                        {res.display_name}
                      </button>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT: Controls */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Live AQI Widget */}
            <div className="flex items-center gap-3 px-4 py-2 bg-white/60 backdrop-blur-xl rounded-full border border-slate-200/50 shadow-sm text-xs font-black tracking-wide text-slate-800">
              <span className="text-slate-500">AIR QUALITY</span>
              <div className="w-px h-3 bg-slate-300"></div>
              <div className="flex items-center gap-2">
                <div className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${!aqi ? 'bg-slate-400' : aqi <= 50 ? 'bg-emerald-400' : aqi <= 100 ? 'bg-yellow-400' : aqi <= 150 ? 'bg-orange-400' : 'bg-red-400'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${!aqi ? 'bg-slate-500' : aqi <= 50 ? 'bg-emerald-500' : aqi <= 100 ? 'bg-yellow-500' : aqi <= 150 ? 'bg-orange-500' : 'bg-red-500'}`}></span>
                </div>
                <span className="inline-block min-w-[45px]">AQI {aqi ?? '--'}</span>
                <span className={`font-bold ${!aqi ? 'text-slate-400' : aqi <= 50 ? 'text-emerald-600' : aqi <= 100 ? 'text-yellow-600' : aqi <= 150 ? 'text-orange-600' : 'text-red-600'}`}>
                  {!aqi ? 'LOAD' : aqi <= 50 ? 'GOOD' : aqi <= 100 ? 'MODERATE' : aqi <= 150 ? 'UNHEALTHY' : 'DANGER'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Scrolling One-Page Content */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 pt-6 relative z-10 flex flex-col gap-12 scroll-smooth">
          
          <section id="dashboard" className="w-full flex flex-col scroll-mt-24">
            <DashboardTab 
              loading={loading} 
              error={error} 
              handleLocationSelect={handleLocationSelect} 
            />
          </section>

          <section id="analytics" className="w-full flex flex-col scroll-mt-24">
            <AnalyticsTab handleLocationSelect={handleLocationSelect} />
          </section>

          <section id="reports" className="w-full flex flex-col scroll-mt-24">
            <ReportsTab />
          </section>

          <section id="settings" className="w-full flex flex-col scroll-mt-24 pb-12">
            <SettingsTab />
          </section>

          {/* Minimalistic Footer */}
          <footer className="w-full flex flex-col items-center justify-center pt-12 pb-12 mt-8 border-t border-slate-200/50">
            <Image src="/unibase_kabaw_logo.svg" alt="Kabaw Logo" width={32} height={32} className="opacity-50 hover:opacity-100 transition-opacity mb-4 drop-shadow-sm rounded-lg" />
            <p className="text-xs font-bold text-slate-400">© 2026 KABAW Orbital Crop Intelligence. All rights reserved.</p>
            <p className="text-[10px] font-bold text-slate-400/60 mt-1 uppercase tracking-widest">Powered by Unibase & Open-Meteo</p>
          </footer>

        </div>
      </main>
    </div>
  );
}
