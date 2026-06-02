"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { 
  MagnifyingGlass, CalendarBlank, SquaresFour, RocketLaunch, MapTrifold, 
  ChartLineUp, FileText, Gear, Globe, Planet, Lightning, Warning, CaretDown, Info
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";

const Map = dynamic(() => import("@/components/Map"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-100/50 backdrop-blur-sm flex items-center justify-center rounded-2xl">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
    </div>
  )
});

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [radius, setRadius] = useState(25);
  const [showRadius, setShowRadius] = useState(false);

  const handleLocationSelect = async (lat: number, lng: number) => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lng, radius }),
      });

      if (!response.ok) throw new Error("Failed to connect to satellite");
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError("Satellite telemetry unavailable.");
    } finally {
      setLoading(false);
    }
  };

  const currentStatus = result ? (result.ndvi_score > 0.6 ? 'optimal' : result.ndvi_score >= 0.3 ? 'warning' : 'error') : (error ? 'error' : 'standby');

  const getStatus = (score: number) => {
    if (score > 0.5) {
      return { 
        title: "Dense Vegetation", 
        color: "text-emerald-700", bg: "bg-emerald-50/80 backdrop-blur-md", border: "border-emerald-200/50 shadow-inner",
        actionable: "Crops are in peak health with high chlorophyll density. Maintain current irrigation and fertilizer schedules.",
        science: "NDVI > 0.5 indicates dense, thriving canopy. The leaves are absorbing almost all visible red light for photosynthesis and strongly reflecting near-infrared light."
      };
    }
    if (score >= 0.2) {
      return { 
        title: "Moderate Vegetation", 
        color: "text-indigo-700", bg: "bg-indigo-50/80 backdrop-blur-md", border: "border-indigo-200/50 shadow-inner",
        actionable: "Typical for mid-growth crops or sparse grasslands. Monitor soil moisture to ensure steady growth.",
        science: "NDVI between 0.2 and 0.5 suggests moderate leaf area index. The area is actively photosynthesizing but lacks total canopy closure."
      };
    }
    if (score >= 0) {
      return { 
        title: "Bare Soil / Urban", 
        color: "text-amber-700", bg: "bg-amber-50/80 backdrop-blur-md", border: "border-amber-200/50 shadow-inner",
        actionable: "No significant agricultural activity detected. If this is a planted field, immediate intervention for drought or disease is required.",
        science: "NDVI between 0 and 0.2 indicates bare soil, dead crops, or urban infrastructure. Red and near-infrared reflectance are nearly equal."
      };
    }
    return { 
      title: "Water / Non-Plant", 
      color: "text-slate-700", bg: "bg-slate-50/80 backdrop-blur-md", border: "border-slate-200/50 shadow-inner",
      actionable: "Target area is a body of water, deep shadows, or dense clouds. Reposition coordinates to a landmass.",
      science: "Negative NDVI values occur when water or snow absorbs near-infrared light and reflects visible light."
    };
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#ebf4f1] font-sans text-emerald-950">
      
      {/* Sidebar (Deep Forest / Carabao Mud) */}
      <aside className="w-64 bg-[#0a1c14] text-emerald-100/70 flex flex-col shrink-0 border-r border-[#153828]">
        <div className="p-6 flex items-center gap-3 text-white">
          <Planet weight="duotone" className="w-7 h-7 text-emerald-400" />
          <span className="font-black tracking-widest text-lg">KABAW</span>
        </div>
        
        <nav className="flex-1 px-4 py-4 flex flex-col gap-2">
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-[#153828]/80 backdrop-blur-sm text-white rounded-xl text-sm font-bold transition-all duration-300 shadow-inner border border-white/5 active:scale-[0.98]">
            <SquaresFour weight="duotone" className="w-5 h-5 text-emerald-400" /> Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-[#153828]/50 hover:text-emerald-50 rounded-xl text-sm font-bold transition-all duration-300 active:scale-[0.98]">
            <RocketLaunch weight="regular" className="w-5 h-5" /> Missions
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-[#153828]/50 hover:text-emerald-50 rounded-xl text-sm font-bold transition-all duration-300 active:scale-[0.98]">
            <MapTrifold weight="regular" className="w-5 h-5" /> Map
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-[#153828]/50 hover:text-emerald-50 rounded-xl text-sm font-bold transition-all duration-300 active:scale-[0.98]">
            <ChartLineUp weight="regular" className="w-5 h-5" /> Analytics
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-[#153828]/50 hover:text-emerald-50 rounded-xl text-sm font-bold transition-all duration-300 active:scale-[0.98]">
            <FileText weight="regular" className="w-5 h-5" /> Reports
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-[#153828]/50 hover:text-emerald-50 rounded-xl text-sm font-bold transition-all duration-300 active:scale-[0.98]">
            <Gear weight="regular" className="w-5 h-5" /> Settings
          </a>
        </nav>

        <div className="p-6 border-t border-[#153828] flex items-center gap-3 hover:bg-[#153828]/30 transition-all duration-300 cursor-pointer active:scale-95">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 font-bold text-xs shadow-inner">AS</div>
          <div className="text-sm font-bold text-emerald-50">Alan Serios</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Subtle background noise overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>

        {/* Header */}
        <header className="px-8 py-6 flex items-center justify-between shrink-0 relative z-10">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter text-[#0a1c14]">Mission Dashboard: Kabaw</h1>
            <div className="flex gap-2 mt-2">
              <button className="flex items-center gap-1 text-xs bg-white border border-emerald-100 px-3 py-1 rounded-full font-bold text-emerald-800 hover:bg-emerald-50 transition-all duration-300 shadow-sm active:scale-95">Active filters <CaretDown weight="bold" className="w-3 h-3" /></button>
              <button className="flex items-center gap-1 text-xs bg-white border border-emerald-100 px-3 py-1 rounded-full font-bold text-emerald-800 hover:bg-emerald-50 transition-all duration-300 shadow-sm active:scale-95">Waypointer <CaretDown weight="bold" className="w-3 h-3" /></button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <MagnifyingGlass weight="bold" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-900/40 group-focus-within:text-emerald-600 transition-colors" />
              <input type="text" placeholder="Global Search" className="pl-9 pr-4 py-2 rounded-xl border border-emerald-100 shadow-sm text-sm w-64 bg-white/80 backdrop-blur-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 font-medium text-emerald-900 placeholder:text-emerald-900/40" />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-emerald-100 shadow-sm rounded-xl bg-white/80 backdrop-blur-sm text-sm font-bold text-emerald-900 hover:bg-white hover:shadow-md transition-all duration-300 active:scale-95">
              <CalendarBlank weight="duotone" className="w-4 h-4 text-emerald-600" /> Date, UTC <CaretDown weight="bold" className="w-3 h-3" />
            </button>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 relative z-10">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full">
            
            {/* Map Column */}
            <div className="xl:col-span-7 flex flex-col bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(16,185,129,0.05)] border border-emerald-100 overflow-hidden hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.15)] transition-all duration-500">
              <div className="p-6 border-b border-emerald-50/50 bg-white/50">
                <h2 className="font-bold uppercase tracking-widest text-xs text-emerald-800/60">Real-Time Mission Map</h2>
              </div>
              <div className="flex-1 relative bg-emerald-50/30 p-3">
                <Map onLocationSelect={handleLocationSelect} radius={radius} />
                
                {/* Target Radius Dropdown */}
                <div className="absolute top-6 right-6 z-[1000] flex flex-col items-end gap-2">
                  <button 
                    onClick={() => setShowRadius(!showRadius)}
                    className="bg-white/90 backdrop-blur-md border border-emerald-100 shadow-lg px-4 py-2 rounded-xl text-xs font-bold text-emerald-900 hover:bg-emerald-50 transition-all duration-300 flex items-center gap-2"
                  >
                    Radius: {radius}m <CaretDown weight="bold" className={`w-3 h-3 transition-transform duration-300 ${showRadius ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {showRadius && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-emerald-100 p-4 flex flex-col gap-2 cursor-default origin-top-right"
                      >
                        <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-800/60">Adjust Scan Area</div>
                        <div className="flex items-center gap-3 mt-2">
                          <input 
                            type="range" min="10" max="250" step="5"
                            value={radius} 
                            onChange={(e) => setRadius(parseInt(e.target.value))} 
                            className="w-32 accent-emerald-500 cursor-pointer" 
                          />
                          <span className="text-xs font-bold text-emerald-900 w-8 text-right">{radius}m</span>
                        </div>
                        <div className="text-[9px] font-medium text-emerald-900/40 uppercase tracking-widest text-center mt-2 pt-2 border-t border-emerald-100/50">
                          Click Map to Apply
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Active Missions Overlay */}
                <div className="absolute bottom-6 left-6 z-[1000] bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-emerald-100 p-4 flex gap-6 text-xs font-bold uppercase tracking-wider hover:scale-105 transition-transform duration-300 cursor-default">
                  <div className="flex items-center gap-2 text-emerald-600"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></div> Active: 18</div>
                  <div className="flex items-center gap-2 text-indigo-600"><div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div> Tracked: 5</div>
                  <div className="flex items-center gap-2 text-rose-600"><div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></div> Alerts: 2</div>
                </div>
              </div>
            </div>

            {/* Control Panel Column */}
            <div className="xl:col-span-5 flex flex-col gap-6">
              
              {/* Mission Control Panel (Status) */}
              <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(16,185,129,0.05)] border border-emerald-100 p-8 hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.15)] transition-all duration-500">
                <h2 className="font-bold uppercase tracking-widest text-xs text-emerald-800/60 mb-6">Mission Control Panel</h2>
                
                <div className="flex items-center gap-8 mb-8">
                  {/* Glowing Orb */}
                  <div className="relative w-24 h-24 shrink-0">
                    <motion.div 
                      animate={
                        currentStatus === 'standby' ? { scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] } :
                        currentStatus === 'optimal' ? { scale: [1, 1.1, 1], opacity: [0.6, 0.8, 0.6] } :
                        { scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }
                      }
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`absolute inset-0 rounded-full blur-xl ${
                        currentStatus === 'optimal' ? 'bg-emerald-500' :
                        currentStatus === 'error' || currentStatus === 'warning' ? 'bg-rose-500' :
                        'bg-slate-400'
                      }`}
                    />
                    <div className={`relative w-full h-full rounded-full shadow-[inset_0_-4px_8px_rgba(0,0,0,0.2)] border-4 ${
                      currentStatus === 'optimal' ? 'bg-emerald-400 border-emerald-300' :
                      currentStatus === 'error' || currentStatus === 'warning' ? 'bg-rose-400 border-rose-300' :
                      'bg-slate-300 border-slate-200'
                    }`} />
                  </div>

                  <div>
                    <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1">Status</div>
                    <div className={`text-2xl font-bold uppercase tracking-tight mb-2 ${
                      currentStatus === 'optimal' ? 'text-emerald-600' :
                      currentStatus === 'error' || currentStatus === 'warning' ? 'text-rose-600' :
                      'text-slate-600'
                    }`}>
                      {currentStatus === 'standby' ? 'Awaiting Target' :
                       currentStatus === 'optimal' ? 'Target Acquired' :
                       'Critical Warning'}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono tracking-wider bg-slate-100/50 px-2 py-1 rounded border border-slate-200/50 inline-block">
                      SYS: <span className="text-emerald-500 font-bold">ON</span> | {new Date().toLocaleTimeString()} UTC
                    </div>
                  </div>
                </div>

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Large Hero Card */}
                  <div className="col-span-2 bg-gradient-to-br from-emerald-50/80 to-emerald-100/40 border border-emerald-200/50 rounded-2xl p-4 flex items-center justify-between shadow-inner hover:scale-[1.01] transition-all duration-300 cursor-default">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-[1rem] bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20"><Globe weight="duotone" className="w-6 h-6" /></div>
                      <div>
                        <div className="text-[10px] font-bold tracking-widest text-emerald-900/60 uppercase">Primary Sensor</div>
                        <div className="text-sm font-bold text-emerald-900">SENTINEL-2 ORBITAL</div>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-emerald-500/10 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-500/20">Online</div>
                  </div>
                  
                  {/* Small Square Cards */}
                  <div className="bg-gradient-to-br from-blue-50/80 to-blue-100/40 border border-blue-200/50 rounded-2xl p-4 flex flex-col justify-between shadow-inner hover:scale-[1.02] transition-all duration-300 cursor-default h-28">
                    <div className="flex justify-between items-start">
                      <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20"><Planet weight="duotone" className="w-4 h-4" /></div>
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold tracking-widest text-blue-900/60 uppercase">API Link</div>
                      <div className="text-xs font-bold text-blue-900">GEE-SYNC</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50/80 to-amber-100/40 border border-amber-200/50 rounded-2xl p-4 flex flex-col justify-between shadow-inner hover:scale-[1.02] transition-all duration-300 cursor-default h-28">
                    <div className="flex justify-between items-start">
                      <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20"><Lightning weight="duotone" className="w-4 h-4" /></div>
                      <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">{loading ? 'Fetching' : 'Ready'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold tracking-widest text-amber-900/60 uppercase">Telemetry</div>
                      <div className="text-xs font-bold text-amber-900">DATALINK</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Target Analysis (Explains Score) */}
              <AnimatePresence>
                {result && !loading && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, height: 0 }}
                    animate={{ opacity: 1, scale: 1, height: 'auto' }}
                    className="overflow-hidden"
                  >
                    {(() => {
                      const status = getStatus(result.ndvi_score);
                      return (
                        <div className={`rounded-[2rem] shadow-sm border p-7 mb-2 ${status.bg} ${status.border} hover:shadow-md transition-all duration-300`}>
                          <div className="flex justify-between items-start mb-5">
                            <h2 className={`font-bold uppercase tracking-widest text-xs flex items-center gap-2 ${status.color}`}>
                              <Info weight="bold" className="w-4 h-4" /> Target Analysis: {status.title}
                            </h2>
                            <div className={`text-4xl font-mono font-black tracking-tighter ${status.color}`}>
                              {result.ndvi_score.toFixed(2)}
                            </div>
                          </div>
                          <div className="flex flex-col gap-4">
                            <div>
                              <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${status.color} opacity-60`}>Action Plan</div>
                              <p className={`text-sm font-medium ${status.color} leading-relaxed`}>{status.actionable}</p>
                            </div>
                            <div className={`pt-4 border-t ${status.border}`}>
                              <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${status.color} opacity-60`}>Scientific Context</div>
                              <p className={`text-xs font-medium ${status.color} opacity-80 leading-relaxed`}>{status.science}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </motion.div>
                )}
              </AnimatePresence>



            </div>
          </div>
        </div>
      </main>

    </div>
  );
}
