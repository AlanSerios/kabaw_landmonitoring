import { useAppStore } from "@/store";
import { FileText, Printer, Warning } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function ReportsTab() {
  const { scanResult, selectedLocation } = useAppStore();
  
  // To re-trigger animation when result changes
  const [key, setKey] = useState(0);
  useEffect(() => {
    if (scanResult) setKey(prev => prev + 1);
  }, [scanResult]);

  return (
    <div className="bg-slate-100 dark:bg-[#0f1115] rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8 min-h-[80vh] flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b border-slate-200 dark:border-slate-800 pb-6 relative z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <FileText weight="duotone" className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold uppercase tracking-widest text-xs text-slate-400">Mission Summary</h2>
            <h1 className="text-xl font-black text-slate-900 dark:text-slate-100">Telemetry Receipt</h1>
          </div>
        </div>
        <button 
          onClick={() => window.print()} 
          disabled={!scanResult}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors shadow-sm border border-slate-200 dark:border-slate-700"
        >
          <Printer weight="bold" className="w-4 h-4" /> Print
        </button>
      </div>

      {!scanResult ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4 relative z-30">
          <Warning className="w-12 h-12 opacity-50" />
          <p className="font-medium text-sm">No active scan to generate a report. Select a target on the Dashboard.</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center pt-2 md:pt-8 relative z-20">
           
           {/* Printer Hardware Slot */}
           <div className="w-full max-w-[320px] md:max-w-sm relative z-30 drop-shadow-xl">
             <div className="h-8 md:h-10 bg-gradient-to-b from-slate-200 to-slate-400 dark:from-slate-700 dark:to-slate-900 rounded-full w-full mx-auto relative border border-slate-300 dark:border-slate-950 flex items-center justify-center shadow-[inset_0_4px_10px_rgba(255,255,255,0.5),0_4px_6px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_4px_10px_rgba(255,255,255,0.1),0_4px_6px_rgba(0,0,0,0.3)]">
                {/* The dark hole of the slot */}
                <div className="h-2 md:h-3 w-[92%] bg-black/90 dark:bg-black rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] border-b border-white/20" />
             </div>
           </div>

           {/* Receipt Container - overflow hidden prevents seeing it before it slides out */}
           <div className="w-full max-w-[300px] md:max-w-[340px] relative -mt-4 md:-mt-5 z-20 overflow-hidden pt-4 pb-12 px-2 print:overflow-visible">
              
              <div style={{ filter: "drop-shadow(0px 10px 15px rgba(0,0,0,0.2))" }}>
                <motion.div
                  key={key}
                  initial={{ y: "-100%" }}
                  animate={{ y: 0 }}
                  transition={{ type: "spring", damping: 14, stiffness: 45, delay: 0.1 }}
                  className="bg-[#fdfcf8] text-slate-900 p-6 md:p-8 relative print:shadow-none"
                  style={{ 
                      fontFamily: "'Courier New', Courier, monospace",
                      // Zig-zag bottom edge using clip-path
                      clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 8px), 98% 100%, 96% calc(100% - 8px), 94% 100%, 92% calc(100% - 8px), 90% 100%, 88% calc(100% - 8px), 86% 100%, 84% calc(100% - 8px), 82% 100%, 80% calc(100% - 8px), 78% 100%, 76% calc(100% - 8px), 74% 100%, 72% calc(100% - 8px), 70% 100%, 68% calc(100% - 8px), 66% 100%, 64% calc(100% - 8px), 62% 100%, 60% calc(100% - 8px), 58% 100%, 56% calc(100% - 8px), 54% 100%, 52% calc(100% - 8px), 50% 100%, 48% calc(100% - 8px), 46% 100%, 44% calc(100% - 8px), 42% 100%, 40% calc(100% - 8px), 38% 100%, 36% calc(100% - 8px), 34% 100%, 32% calc(100% - 8px), 30% 100%, 28% calc(100% - 8px), 26% 100%, 24% calc(100% - 8px), 22% 100%, 20% calc(100% - 8px), 18% 100%, 16% calc(100% - 8px), 14% 100%, 12% calc(100% - 8px), 10% 100%, 8% calc(100% - 8px), 6% 100%, 4% calc(100% - 8px), 2% 100%, 0 calc(100% - 8px))"
                  }}
                >
                  <div className="text-center mb-6">
                      <h2 className="text-3xl font-bold tracking-widest mb-1 text-black">KABAW</h2>
                      <h3 className="text-xs font-bold tracking-widest text-slate-700">TELEMETRY REPORT</h3>
                  </div>

                  <div className="border-t-2 border-b-2 border-double border-slate-300 py-3 my-4 flex flex-col gap-1 text-xs font-bold text-slate-600">
                      <div className="flex justify-between">
                        <span>DATE:</span>
                        <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>TIME:</span>
                        <span>{new Date().toLocaleTimeString('en-US', { hour12: false })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>LOC:</span>
                        <span>{selectedLocation?.lat.toFixed(4)}, {selectedLocation?.lng.toFixed(4)}</span>
                      </div>
                  </div>

                  <div className="py-2 my-4">
                      <div className="flex justify-between font-bold text-xs mb-3 text-black">
                        <span>ITEM</span>
                        <span>VALUE</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2 text-slate-800">
                        <span>NDVI (VEG)</span>
                        <span>{scanResult.ndvi_score.toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2 text-slate-800">
                        <span>NDWI (H2O)</span>
                        <span>{scanResult.ndwi_score.toFixed(3)}</span>
                      </div>
                  </div>

                  <div className="border-t-2 border-dashed border-slate-300 pt-4 mt-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-bold text-black">STATUS</span>
                        <span className="font-bold text-black">{scanResult.ndvi_score > 0.5 ? 'OPTIMAL' : scanResult.ndvi_score >= 0.3 ? 'WARNING' : 'CRITICAL'}</span>
                      </div>
                      <div className="text-[10px] leading-relaxed mt-4 uppercase text-slate-600 font-bold">
                        {scanResult.ndvi_score > 0.5 ? "DENSE CANOPY COVER DETECTED. HIGH PHOTOSYNTHETIC ACTIVITY." : "SPARSE VEGETATION DETECTED. PLEASE MONITOR SOIL MOISTURE."}
                      </div>
                  </div>

                  <div className="mt-10 flex flex-col items-center">
                      {/* Fake Barcode built with pure CSS */}
                      <div className="h-10 w-[90%] opacity-80" 
                           style={{ backgroundImage: 'repeating-linear-gradient(90deg, #0f172a 0, #0f172a 2px, transparent 2px, transparent 4px, #0f172a 4px, #0f172a 5px, transparent 5px, transparent 8px, #0f172a 8px, #0f172a 12px, transparent 12px, transparent 14px, #0f172a 14px, #0f172a 15px, transparent 15px, transparent 18px)' }}>
                      </div>
                      <div className="text-center text-[10px] mt-2 tracking-widest font-bold text-slate-800">
                        {Math.random().toString().slice(2, 17)}
                      </div>
                  </div>

                  {/* Spacer for clip path teeth */}
                  <div className="h-6"></div>
                </motion.div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
