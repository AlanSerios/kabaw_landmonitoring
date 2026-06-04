import { Globe, Leaf, Drop, Warning } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

// FlipCard component for animated 3D Bento reveals (Pure CSS)
function FlipCard({ label, score, icon: Icon, color: statusColor, bg: statusBg, border: statusBorder, iconBg, actionable, science }: any) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="relative w-full h-28 cursor-pointer group [perspective:1000px]"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={`w-full h-full relative transition-transform duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
      >
        {/* FRONT */}
        <div 
          className="absolute inset-0 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-4 flex flex-col justify-between group-hover:shadow-md transition-shadow [backface-visibility:hidden]"
        >
          <div className="flex justify-between items-start">
            <div className={`w-8 h-8 rounded-lg text-white flex items-center justify-center shadow-md ${iconBg}`}>
              <Icon weight="duotone" className="w-4 h-4" />
            </div>
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300">Tap to flip</div>
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">{label}</div>
            <div className="text-xl font-black text-slate-900 dark:text-slate-100">{score}</div>
          </div>
        </div>

        {/* BACK */}
        <div 
          className={`absolute inset-0 rounded-2xl border p-4 ${statusBg} ${statusBorder} flex flex-col justify-center [backface-visibility:hidden] [transform:rotateY(180deg)]`}
        >
          <p className={`text-[11px] font-bold ${statusColor} mb-1 leading-tight line-clamp-2`}>{actionable}</p>
          <p className={`text-[10px] font-medium opacity-80 ${statusColor} leading-tight line-clamp-3`}>{science}</p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardTab({ 
  loading, 
  error, 
  handleLocationSelect 
}: { 
  loading: boolean; 
  error: string; 
  handleLocationSelect: (lat: number, lng: number) => void;
}) {
  const { scanResult, mapCenter, scanRadius, selectedLocation } = useAppStore();
  const currentStatus = scanResult ? (scanResult.ndvi_score > 0.6 ? 'optimal' : scanResult.ndvi_score >= 0.3 ? 'warning' : 'error') : (error ? 'error' : 'standby');
  
  // Live clock — client-only to avoid SSR hydration mismatch
  const [clockTime, setClockTime] = useState("");
  useEffect(() => {
    const tick = () => setClockTime(new Date().toLocaleTimeString());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const getVegetationStatus = (score: number) => {
    if (score > 0.5) return { 
      title: "Dense Vegetation", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", iconBg: "bg-emerald-500", actionable: "Crops are in peak health.", science: "NDVI > 0.5" 
    };
    if (score >= 0.2) return { 
      title: "Moderate Vegetation", color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-200", iconBg: "bg-indigo-500", actionable: "Monitor soil moisture.", science: "NDVI 0.2-0.5" 
    };
    return { 
      title: "Bare Soil / Urban", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", iconBg: "bg-amber-500", actionable: "No significant agriculture.", science: "NDVI < 0.2" 
    };
  };

  const getWaterStatus = (score: number) => {
    if (score > 0.1) return { 
      title: "Surface Water", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", iconBg: "bg-blue-500", actionable: "High water content.", science: "NDWI > 0.1" 
    };
    return { 
      title: "Dry Land", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200", iconBg: "bg-rose-500", actionable: "No surface water.", science: "NDWI < 0" 
    };
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-6 min-h-[80vh] flex-1 w-full relative">
      {/* Map Column */}
      <div className="xl:col-span-7 flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-all duration-500 min-h-[400px] md:min-h-[500px] xl:min-h-0">
        <div className="flex-1 relative bg-slate-50 dark:bg-slate-900/50">
          <Map onLocationSelect={handleLocationSelect} radius={scanRadius} mapCenter={mapCenter} selectedLocation={selectedLocation} />
        </div>
      </div>

      {/* Control Panel Column */}
      <div className="xl:col-span-5 flex flex-col gap-4 md:gap-6">
        
        {/* Mission Control Panel */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 md:p-8 hover:shadow-md transition-all duration-500">
          <h2 className="font-bold uppercase tracking-widest text-[10px] md:text-xs text-slate-400 mb-4 md:mb-6">Mission Control Panel</h2>
          
          <div className="flex items-center gap-4 md:gap-8 mb-6 md:mb-8">
            <div className="relative w-16 h-16 md:w-24 md:h-24 shrink-0">
              <motion.div 
                animate={
                  currentStatus === 'standby' ? { scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] } :
                  currentStatus === 'optimal' ? { scale: [1, 1.1, 1], opacity: [0.6, 0.8, 0.6] } :
                  { scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }
                }
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
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
                currentStatus === 'optimal' ? 'text-emerald-600 dark:text-emerald-400' :
                currentStatus === 'error' || currentStatus === 'warning' ? 'text-rose-600 dark:text-rose-400' :
                'text-slate-600 dark:text-slate-300'
              }`}>
                {loading ? 'Scanning...' : currentStatus === 'standby' ? 'Awaiting Target' : currentStatus === 'optimal' ? 'Target Acquired' : 'Critical Warning'}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-wider bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 inline-block">
                SYS: <span className="text-emerald-500 dark:text-emerald-400 font-bold">ON</span> | {clockTime || '—'} UTC
              </div>
            </div>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-2 gap-3">
            {/* Primary Sensor Card */}
            <div className="col-span-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-4 flex items-center justify-between hover:shadow-sm transition-all duration-300 cursor-default">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[1rem] bg-slate-800 text-white flex items-center justify-center shadow-md"><Globe weight="duotone" className="w-6 h-6" /></div>
                <div>
                  <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Primary Sensor</div>
                  <div className="text-sm font-bold text-slate-700 dark:text-slate-200">SENTINEL-2 ORBITAL</div>
                </div>
              </div>
              <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-200/50 dark:border-emerald-700/50">Online</div>
            </div>
            
            {/* Vegetation Flip Card */}
            {(() => {
              const status = scanResult ? getVegetationStatus(scanResult.ndvi_score) : null;
              return status ? (
                <FlipCard 
                  {...status}
                  label="Vegetation"
                  score={scanResult!.ndvi_score.toFixed(2)}
                  icon={Leaf}
                />
              ) : (
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-4 flex flex-col justify-between h-28 cursor-default">
                  <div className="flex justify-between items-start">
                    <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-400 flex items-center justify-center"><Leaf weight="duotone" className="w-4 h-4" /></div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{loading ? 'Scanning...' : 'Standby'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Vegetation</div>
                    <div className="text-xl font-black text-slate-300">--</div>
                  </div>
                </div>
              );
            })()}

            {/* Moisture Flip Card */}
            {(() => {
              // Using the same logic block, just swapping text to Moisture for demonstration
              const status = scanResult ? getWaterStatus(scanResult.ndwi_score) : null;
              return status ? (
                <FlipCard 
                  {...status}
                  label="Moisture"
                  score={scanResult!.ndwi_score.toFixed(2)}
                  icon={Drop}
                />
              ) : (
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-4 flex flex-col justify-between h-28 cursor-default">
                  <div className="flex justify-between items-start">
                    <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-400 flex items-center justify-center"><Drop weight="duotone" className="w-4 h-4" /></div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{loading ? 'Scanning...' : 'Standby'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Moisture</div>
                    <div className="text-xl font-black text-slate-300">--</div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Re-usable analysis logic */}
        <AnimatePresence mode="wait">
          {!scanResult && !loading && !error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="rounded-3xl border p-7 mb-2 bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700">
                <h2 className="font-bold uppercase tracking-widest text-xs flex items-center gap-2 text-slate-700 dark:text-slate-300 mb-3">
                  <Globe weight="bold" className="w-4 h-4" /> System Explanation
                </h2>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  Welcome to the KABAW Orbital Crop & Land Monitoring System. This dashboard connects directly to the <strong className="text-slate-900 dark:text-slate-200">Sentinel-2 Satellite</strong> API to provide real-time agricultural telemetry.
                </p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    <span className="font-bold">NDVI (Vegetation):</span> Measures plant health and crop density.
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    <span className="font-bold">NDWI (Moisture):</span> Detects surface water and irrigation levels.
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {error && !loading && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="rounded-3xl border p-7 mb-2 bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800/50">
                <h2 className="font-bold uppercase tracking-widest text-xs flex items-center gap-2 text-rose-700 dark:text-rose-400 mb-2">
                  <Warning weight="bold" className="w-4 h-4" /> Error
                </h2>
                <p className="text-sm font-medium text-rose-700 dark:text-rose-400">{error}</p>
              </div>
            </motion.div>
          )}
          {scanResult && !loading && !error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="rounded-3xl border p-6 mb-2 bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Globe weight="duotone" className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="font-bold uppercase tracking-widest text-xs text-slate-700 dark:text-slate-300">Telemetry Acquired</h2>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Click the score cards above to view detailed analysis</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider">Optimal Signal</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
