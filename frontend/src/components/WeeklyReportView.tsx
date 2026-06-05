"use client";

import React, { useRef, useState } from 'react';
import { useAppStore } from '@/store';
import { Printer, CaretLeft, Plant, Drop, Leaf, Gauge, Calendar, ShieldCheck, Compass, Database, HardDrives } from '@phosphor-icons/react';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { Playfair_Display, Inter } from "next/font/google";

const playfair = Playfair_Display({
  weight: ["400", "700"],
  subsets: ["latin"],
});

const inter = Inter({
  weight: ["400", "500", "600", "700", "900"],
  subsets: ["latin"],
});

export default function WeeklyReportView() {
  const { monitoredBases, setActiveReportMode } = useAppStore();
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    const pageElements = reportRef.current?.querySelectorAll('.report-page');
    if (!pageElements || pageElements.length === 0 || isGenerating) return;
    setIsGenerating(true);
    
    try {
      // Create jsPDF in portrait A4 size (210mm x 297mm)
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfW = 210;
      const pdfH = 297;
      
      for (let i = 0; i < pageElements.length; i++) {
        const el = pageElements[i] as HTMLElement;
        const canvas = await html2canvas(el, {
          scale: 2, // Optimized scale to stay crisp but avoid device memory crashes
          useCORS: true,
          backgroundColor: "#FFFFFF",
          logging: false,
        });
        const imgData = canvas.toDataURL("image/png");
        
        if (i > 0) {
          pdf.addPage();
        }
        pdf.addImage(imgData, "PNG", 0, 0, pdfW, pdfH);
      }
      
      pdf.save(`Kabaw_Weekly_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error("Multi-page PDF generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className={`w-full max-w-4xl mx-auto h-full overflow-y-auto pb-24 px-4 print:pb-0 ${inter.className}`}>
      {/* Controls - Hidden when printing */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8 print:hidden">
        <button 
          onClick={() => setActiveReportMode('scan')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold transition-colors text-sm"
        >
          <CaretLeft weight="bold" /> Back to Receipt
        </button>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={generatePDF}
            disabled={isGenerating}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-full font-bold shadow-md transition-all active:scale-95 text-xs uppercase tracking-widest"
          >
            <Printer weight="duotone" className="w-5 h-5" />
            {isGenerating ? "Exporting PDF..." : "Download 10-Page PDF"}
          </button>
        </div>
      </div>

      {/* Pages Container - Scrollable on mobile, prints cleanly */}
      <div ref={reportRef} className="flex flex-col gap-8 items-center w-full overflow-x-auto py-2">
        
        {/* PAGE 1: COVER PAGE */}
        <div className="report-page bg-slate-950 text-white rounded-3xl p-12 md:p-20 shadow-2xl flex flex-col justify-between select-none relative overflow-hidden"
          style={{ width: "210mm", height: "297mm", minWidth: "210mm", minHeight: "297mm", boxSizing: "border-box" }}>
          {/* Subtle grid background overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          
          <div className="flex justify-between items-start z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-black text-white shadow-lg">K</div>
              <span className="text-xs font-black tracking-widest uppercase text-emerald-400">Kabaw Command Center</span>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">Official Report</span>
          </div>

          <div className="my-auto z-10 space-y-6">
            <h1 className={`${playfair.className} text-6xl font-black leading-[1.05] tracking-tight max-w-xl`}>
              Weekly <br />
              Environmental <br />
              <span className="italic text-emerald-400">Analysis Report</span>
            </h1>
            <div className="h-2 w-32 bg-emerald-500 rounded-full"></div>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              Automated geospatial telemetry and crop metrics compiled via the Sentinel-2 orbital mapping array.
            </p>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-between gap-4 z-10 text-xs">
            <div>
              <p className="font-bold text-slate-500 uppercase tracking-wider mb-1">Prepared For</p>
              <p className="font-black text-slate-200">Alan Serios (Kabaw Land Monitoring Project)</p>
            </div>
            <div>
              <p className="font-bold text-slate-500 uppercase tracking-wider mb-1">Issue Date</p>
              <p className="font-black text-slate-200">{currentDate}</p>
            </div>
            <div>
              <p className="font-bold text-slate-500 uppercase tracking-wider mb-1">Satellite Array</p>
              <p className="font-black text-emerald-400">Sentinel-2 (A & B)</p>
            </div>
          </div>
        </div>

        {/* PAGE 2: EXECUTIVE SUMMARY */}
        <div className="report-page bg-white text-slate-900 rounded-3xl p-12 md:p-16 shadow-2xl flex flex-col justify-between"
          style={{ width: "210mm", height: "297mm", minWidth: "210mm", minHeight: "297mm", boxSizing: "border-box" }}>
          
          <div>
            <header className="border-b-2 border-slate-900 pb-6 mb-8 flex justify-between items-end">
              <div>
                <span className="text-[10px] font-black tracking-widest uppercase text-emerald-700">Section 01 / General Overview</span>
                <h2 className={`${playfair.className} text-3xl font-bold text-slate-900 mt-1`}>Executive Summary</h2>
              </div>
              <span className="text-xs font-mono text-slate-400">Page 2 of 10</span>
            </header>

            <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
              <p>
                During the monitoring cycle ending June 2026, the KABAW Space telemetry platform completed continuous observations of all registered agricultural bases. The objective of this summary is to evaluate general crop density changes (via NDVI indices) and detect potential soil drought risks early.
              </p>
              
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 my-6">
                <h3 className="font-black text-xs uppercase text-slate-500 mb-3 tracking-wider">Key Takeaways</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                    <span><strong>Vegetation Health Peak:</strong> Average NDVI levels across monitoring targets registered at <strong>0.68</strong>, confirming stable vegetative activity.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                    <span><strong>Hydration Warning:</strong> Localized regions in Carmel Waters registered a significant drop in NDWI (-0.14), indicating drying soils due to sparse rain.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                    <span><strong>Sensor Calibration:</strong> Standard Sentinel-2 Multi-Spectral Instrument (MSI) calibration was updated to reduce cloud reflectance interference by 8.5%.</span>
                  </li>
                </ul>
              </div>

              <p>
                Overall, the agricultural productivity profile remains optimistic. However, targeted irrigation actions are advised within the next 48 to 72 hours for crops showing moderate thermal anomalies.
              </p>
            </div>
          </div>

          <footer className="border-t border-slate-100 pt-6 flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Generated by Kabaw System</span>
            <span>Ref: EX-SUM-02</span>
          </footer>
        </div>

        {/* PAGE 3: SATELLITE ORBITAL GEOSPATIAL PARAMETERS */}
        <div className="report-page bg-white text-slate-900 rounded-3xl p-12 md:p-16 shadow-2xl flex flex-col justify-between"
          style={{ width: "210mm", height: "297mm", minWidth: "210mm", minHeight: "297mm", boxSizing: "border-box" }}>
          
          <div>
            <header className="border-b-2 border-slate-900 pb-6 mb-8 flex justify-between items-end">
              <div>
                <span className="text-[10px] font-black tracking-widest uppercase text-emerald-700">Section 02 / Telemetry Parameters</span>
                <h2 className={`${playfair.className} text-3xl font-bold text-slate-900 mt-1`}>Geospatial Parameters</h2>
              </div>
              <span className="text-xs font-mono text-slate-400">Page 3 of 10</span>
            </header>

            <div className="space-y-6 text-sm">
              <p className="text-slate-600">
                The indices used in this report are processed from Sentinel-2 L2A bottom-of-atmosphere reflectance bands. These bands operate on various wavelengths:
              </p>

              <div className="grid grid-cols-1 gap-4">
                <div className="border border-slate-200 rounded-xl p-4 flex gap-4 items-center">
                  <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0"><Plant className="w-5 h-5 text-emerald-600" /></div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">NDVI (Normalized Difference Vegetation Index)</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Formula: (Band 8 - Band 4) / (Band 8 + Band 4). Measures chlorophyll absorption to monitor vegetation vigor.</p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 flex gap-4 items-center">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0"><Drop className="w-5 h-5 text-blue-600" /></div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">NDWI (Normalized Difference Water Index)</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Formula: (Band 8 - Band 3) / (Band 8 + Band 3). Measures surface water reflections to highlight liquid water contents.</p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 flex gap-4 items-center">
                  <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center shrink-0"><Gauge className="w-5 h-5 text-slate-600" /></div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">EVI (Enhanced Vegetation Index)</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Formula: 2.5 * ((B8 - B4) / (B8 + 6 * B4 - 7.5 * B2 + 1)). Optimized for high-biomass regions with structural canopy detection.</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-[11px] text-slate-600 leading-relaxed font-mono">
                Observation Bands detail: <br />
                - Band 2 (Blue): 490 nm | Band 3 (Green): 560 nm <br />
                - Band 4 (Red): 665 nm | Band 8 (NIR): 842 nm
              </div>
            </div>
          </div>

          <footer className="border-t border-slate-100 pt-6 flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Generated by Kabaw System</span>
            <span>Ref: BAND-CAL-3</span>
          </footer>
        </div>

        {/* PAGE 4: DETAILED REGIONAL HYDRATION LEVELS */}
        <div className="report-page bg-white text-slate-900 rounded-3xl p-12 md:p-16 shadow-2xl flex flex-col justify-between"
          style={{ width: "210mm", height: "297mm", minWidth: "210mm", minHeight: "297mm", boxSizing: "border-box" }}>
          
          <div>
            <header className="border-b-2 border-slate-900 pb-6 mb-8 flex justify-between items-end">
              <div>
                <span className="text-[10px] font-black tracking-widest uppercase text-emerald-700">Section 03 / Soil Moisture Statistics</span>
                <h2 className={`${playfair.className} text-3xl font-bold text-slate-900 mt-1`}>Regional Hydration</h2>
              </div>
              <span className="text-xs font-mono text-slate-400">Page 4 of 10</span>
            </header>

            <div className="space-y-6 text-sm">
              <p className="text-slate-600">
                Below are simulated soil moisture indicators and daily evapotranspiration rates. Evapotranspiration measures how fast water leaves the soil and crop leaves.
              </p>

              {/* Styled CSS Bar Graph */}
              <div className="space-y-4 my-6">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">Evapotranspiration rate (mm/day)</h4>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1 font-bold text-slate-700">
                      <span>Monitored Zone A (Carmel Waters)</span>
                      <span>5.4 mm/day (High)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: "80%" }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1 font-bold text-slate-700">
                      <span>Monitored Zone B (Aglayan Fields)</span>
                      <span>3.2 mm/day (Moderate)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: "50%" }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1 font-bold text-slate-700">
                      <span>Monitored Zone C (Cagayan Basin)</span>
                      <span>2.1 mm/day (Optimal)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: "35%" }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-amber-50/50 border-amber-200/50 text-amber-900 text-xs">
                <strong>Analysis Note:</strong> High evapotranspiration rate in Carmel Waters is drying the topsoil rapidly due to high winds and heat. Watering cycles should be moved to late afternoon (4 PM - 6 PM) to reduce evaporation losses.
              </div>
            </div>
          </div>

          <footer className="border-t border-slate-100 pt-6 flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Generated by Kabaw System</span>
            <span>Ref: HYD-ST-4</span>
          </footer>
        </div>

        {/* PAGE 5: ZONE A - CARMEL WATERS ANALYSIS */}
        <div className="report-page bg-white text-slate-900 rounded-3xl p-12 md:p-16 shadow-2xl flex flex-col justify-between"
          style={{ width: "210mm", height: "297mm", minWidth: "210mm", minHeight: "297mm", boxSizing: "border-box" }}>
          
          <div>
            <header className="border-b-2 border-slate-900 pb-6 mb-8 flex justify-between items-end">
              <div>
                <span className="text-[10px] font-black tracking-widest uppercase text-emerald-700">Section 04 / Zone A Analysis</span>
                <h2 className={`${playfair.className} text-3xl font-bold text-slate-900 mt-1`}>Carmel Waters</h2>
              </div>
              <span className="text-xs font-mono text-slate-400">Page 5 of 10</span>
            </header>

            <div className="space-y-6 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-500">Coordinates: 8.0536° N, 125.1312° E</span>
                <span className="bg-amber-100 text-amber-800 text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-amber-200">Alert Status: Warning</span>
              </div>

              <p className="text-slate-700">
                Zone A is primarily populated with row crops. Due to the recent dry spell, the vegetation density is holding stable, but the moisture reserves have depleted significantly.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="border border-slate-100 bg-slate-50/50 p-4 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">NDVI Health</span>
                  <div className="text-2xl font-black text-slate-900 mt-1">0.58</div>
                  <p className="text-[10px] text-slate-400 mt-1">Stable growth density</p>
                </div>

                <div className="border border-slate-100 bg-slate-50/50 p-4 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">NDWI Moisture</span>
                  <div className="text-2xl font-black text-rose-600 mt-1">-0.14</div>
                  <p className="text-[10px] text-rose-500 mt-1">Deficit detected</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-xs text-slate-900">AI Observation Notes:</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Row crop leaves are beginning to manifest dry tips. Although root zones remain active, structural irrigation is required immediately to prevent transition to dry land status. Suggested watering volume: 15L/sqm.
                </p>
              </div>
            </div>
          </div>

          <footer className="border-t border-slate-100 pt-6 flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Generated by Kabaw System</span>
            <span>Ref: ZONE-A-5</span>
          </footer>
        </div>

        {/* PAGE 6: ZONE B - AGLAYAN FIELDS ANALYSIS */}
        <div className="report-page bg-white text-slate-900 rounded-3xl p-12 md:p-16 shadow-2xl flex flex-col justify-between"
          style={{ width: "210mm", height: "297mm", minWidth: "210mm", minHeight: "297mm", boxSizing: "border-box" }}>
          
          <div>
            <header className="border-b-2 border-slate-900 pb-6 mb-8 flex justify-between items-end">
              <div>
                <span className="text-[10px] font-black tracking-widest uppercase text-emerald-700">Section 05 / Zone B Analysis</span>
                <h2 className={`${playfair.className} text-3xl font-bold text-slate-900 mt-1`}>Aglayan Fields</h2>
              </div>
              <span className="text-xs font-mono text-slate-400">Page 6 of 10</span>
            </header>

            <div className="space-y-6 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-500">Coordinates: 8.0811° N, 125.1054° E</span>
                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-emerald-200">Alert Status: Optimal</span>
              </div>

              <p className="text-slate-700">
                Zone B consists of dense perennial orchard blocks. These trees have deeper root systems, allowing them to draw moisture from deeper soil layers, rendering them less sensitive to dry periods.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="border border-slate-100 bg-slate-50/50 p-4 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">NDVI Health</span>
                  <div className="text-2xl font-black text-emerald-600 mt-1">0.74</div>
                  <p className="text-[10px] text-emerald-500 mt-1">Highly dense canopy</p>
                </div>

                <div className="border border-slate-100 bg-slate-50/50 p-4 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">NDWI Moisture</span>
                  <div className="text-2xl font-black text-slate-900 mt-1">0.08</div>
                  <p className="text-[10px] text-slate-400 mt-1">Adequate surface wetness</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-xs text-slate-900">AI Observation Notes:</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Excellent development index. Nitrogen levels appear stable, and canopy shading helps preserve soil water under high temperatures. No emergency watering needed for the next 7 days.
                </p>
              </div>
            </div>
          </div>

          <footer className="border-t border-slate-100 pt-6 flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Generated by Kabaw System</span>
            <span>Ref: ZONE-B-6</span>
          </footer>
        </div>

        {/* PAGE 7: CLIMATOLOGY & 30-DAY FORECAST ANALYSIS */}
        <div className="report-page bg-white text-slate-900 rounded-3xl p-12 md:p-16 shadow-2xl flex flex-col justify-between"
          style={{ width: "210mm", height: "297mm", minWidth: "210mm", minHeight: "297mm", boxSizing: "border-box" }}>
          
          <div>
            <header className="border-b-2 border-slate-900 pb-6 mb-8 flex justify-between items-end">
              <div>
                <span className="text-[10px] font-black tracking-widest uppercase text-emerald-700">Section 06 / Climatology Analysis</span>
                <h2 className={`${playfair.className} text-3xl font-bold text-slate-900 mt-1`}>Climate & Weather Trends</h2>
              </div>
              <span className="text-xs font-mono text-slate-400">Page 7 of 10</span>
            </header>

            <div className="space-y-6 text-sm">
              <p className="text-slate-600">
                Weather patterns play an important role in our telemetry forecasts. Below is a simulated forecast log gathered from satellite weather modeling.
              </p>

              {/* Weather Data Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden mt-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                      <th className="p-3">Period</th>
                      <th className="p-3">Avg Temp</th>
                      <th className="p-3">Humidity</th>
                      <th className="p-3">Expected Rain</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="p-3 font-semibold">Week 1 (Current)</td>
                      <td className="p-3">28.5°C</td>
                      <td className="p-3">72%</td>
                      <td className="p-3 text-rose-500">&lt; 5mm (Dry)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">Week 2 (Forecast)</td>
                      <td className="p-3">29.1°C</td>
                      <td className="p-3">68%</td>
                      <td className="p-3 text-rose-500">&lt; 3mm (Dry)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">Week 3 (Forecast)</td>
                      <td className="p-3">27.0°C</td>
                      <td className="p-3">82%</td>
                      <td className="p-3 text-emerald-600">24mm (Showers)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">Week 4 (Forecast)</td>
                      <td className="p-3">27.3°C</td>
                      <td className="p-3">80%</td>
                      <td className="p-3 text-emerald-600">18mm (Normal)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-xs text-slate-500 italic mt-2">
                * Note: Weeks 1 and 2 present elevated solar radiation values. Shade net implementations for young nursery sprouts are highly recommended to prevent sun scorch.
              </p>
            </div>
          </div>

          <footer className="border-t border-slate-100 pt-6 flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Generated by Kabaw System</span>
            <span>Ref: CLIM-ST-7</span>
          </footer>
        </div>

        {/* PAGE 8: RECOMMENDATIONS & FARMING SCHEDULER */}
        <div className="report-page bg-white text-slate-900 rounded-3xl p-12 md:p-16 shadow-2xl flex flex-col justify-between"
          style={{ width: "210mm", height: "297mm", minWidth: "210mm", minHeight: "297mm", boxSizing: "border-box" }}>
          
          <div>
            <header className="border-b-2 border-slate-900 pb-6 mb-8 flex justify-between items-end">
              <div>
                <span className="text-[10px] font-black tracking-widest uppercase text-emerald-700">Section 07 / Agronomic Recommendations</span>
                <h2 className={`${playfair.className} text-3xl font-bold text-slate-900 mt-1`}>Agronomic Recommendations</h2>
              </div>
              <span className="text-xs font-mono text-slate-400">Page 8 of 10</span>
            </header>

            <div className="space-y-6 text-sm">
              <div className="grid grid-cols-1 gap-4">
                
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 font-bold"><Calendar weight="bold" className="w-4 h-4" /></div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Irrigation Strategy (Days 1-7)</h4>
                    <p className="text-xs text-slate-600 mt-1">Deploy drip irrigation cycles for Carmel Waters base at 05:00 AM and 05:30 PM. Total allocation: 1200L over the field block to compensate for evaporative draw.</p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 shrink-0 font-bold"><ShieldCheck weight="bold" className="w-4 h-4" /></div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Organic Mulching (Sprouts and Shrubs)</h4>
                    <p className="text-xs text-slate-600 mt-1">Apply a 3-inch layer of dried rice straw or coconut husks around base rows. This retains up to 40% more soil humidity and suppresses unwanted weed growth.</p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 font-bold"><Compass weight="bold" className="w-4 h-4" /></div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Fertilizer Application Delay</h4>
                    <p className="text-xs text-slate-600 mt-1">Postpone granulated nitrogen application until Week 3 (when rains start). Applying chemical fertilizers to extremely dry soils can trigger root-burn anomalies.</p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <footer className="border-t border-slate-100 pt-6 flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Generated by Kabaw System</span>
            <span>Ref: REC-AGR-8</span>
          </footer>
        </div>

        {/* PAGE 9: ENVIRONMENTAL SUSTAINABILITY INDEX */}
        <div className="report-page bg-white text-slate-900 rounded-3xl p-12 md:p-16 shadow-2xl flex flex-col justify-between"
          style={{ width: "210mm", height: "297mm", minWidth: "210mm", minHeight: "297mm", boxSizing: "border-box" }}>
          
          <div>
            <header className="border-b-2 border-slate-900 pb-6 mb-8 flex justify-between items-end">
              <div>
                <span className="text-[10px] font-black tracking-widest uppercase text-emerald-700">Section 08 / Carbon & Ecology</span>
                <h2 className={`${playfair.className} text-3xl font-bold text-slate-900 mt-1`}>Sustainability Index</h2>
              </div>
              <span className="text-xs font-mono text-slate-400">Page 9 of 10</span>
            </header>

            <div className="space-y-6 text-sm">
              <p className="text-slate-600">
                KABAW Space evaluates the general biodiversity index and carbon sequestration capacity of your land by tracking biomass density over time.
              </p>

              <div className="border border-slate-200 rounded-2xl p-6 bg-emerald-50/20 border-emerald-100 flex flex-col gap-4">
                <h3 className="font-black text-xs uppercase text-slate-500 tracking-wider">Estimated Carbon Sequestration</h3>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Carmel Waters Block</span>
                    <p className="text-xl font-bold text-slate-800">1.2 Tons CO₂e / yr</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Aglayan Fields Block</span>
                    <p className="text-xl font-bold text-slate-800">4.8 Tons CO₂e / yr</p>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: "75%" }}></div>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  * Estimated using multi-spectral reflectance integration algorithms based on mature tree foliage densities.
                </p>
              </div>

              <div className="text-slate-700 text-xs leading-relaxed space-y-2">
                <h4 className="font-bold text-slate-900">Ecosystem Vitality Status:</h4>
                <p>
                  Biological diversity is stable. The presence of crop barriers and dense cover crops in Aglayan helps prevent soil run-off and maintains microbial activity, enhancing organic soil structure.
                </p>
              </div>
            </div>
          </div>

          <footer className="border-t border-slate-100 pt-6 flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Generated by Kabaw System</span>
            <span>Ref: SUST-ECO-9</span>
          </footer>
        </div>

        {/* PAGE 10: ATTRIBUTIONS & ORBITAL TELEMETRY ARCHITECTURE */}
        <div className="report-page bg-white text-slate-900 rounded-3xl p-12 md:p-16 shadow-2xl flex flex-col justify-between"
          style={{ width: "210mm", height: "297mm", minWidth: "210mm", minHeight: "297mm", boxSizing: "border-box" }}>
          
          <div>
            <header className="border-b-2 border-slate-900 pb-6 mb-8 flex justify-between items-end">
              <div>
                <span className="text-[10px] font-black tracking-widest uppercase text-emerald-700">Section 09 / Attributions</span>
                <h2 className={`${playfair.className} text-3xl font-bold text-slate-900 mt-1`}>System Attributions</h2>
              </div>
              <span className="text-xs font-mono text-slate-400">Page 10 of 10</span>
            </header>

            <div className="space-y-6 text-sm">
              <div className="space-y-4">
                <p className="text-slate-700">
                  This report has been automatically compiled by the KABAW Environmental Monitoring Engine utilizing data sources from the following agencies:
                </p>

                <div className="space-y-3">
                  <div className="flex gap-3 items-start text-xs border-b border-slate-100 pb-3">
                    <Database className="w-5 h-5 text-slate-500 mt-0.5 shrink-0" />
                    <div>
                      <strong>ESA Copernicus (Sentinel-2):</strong> Core multi-spectral imagery captured on orbital passes. Telemetry updated every 5 days.
                    </div>
                  </div>

                  <div className="flex gap-3 items-start text-xs border-b border-slate-100 pb-3">
                    <HardDrives className="w-5 h-5 text-slate-500 mt-0.5 shrink-0" />
                    <div>
                      <strong>Open-Meteo API:</strong> Historical solar radiations, regional dew point indexes, and relative soil moisture profiles.
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl text-[10px] text-slate-400 leading-relaxed">
                  <strong>DISCLAIMER:</strong> This report is an automatically compiled simulation based on satellite and meteorological predictions. Local soil tests should be executed to confirm structural hydration profiles before deploying heavy irrigation infrastructure. KABAW is not liable for outcomes stemming from decision adjustments based on these metrics.
                </div>
              </div>
            </div>
          </div>

          <footer className="border-t border-slate-100 pt-6 flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Generated by Kabaw System</span>
            <span>Ref: ATT-SYS-10</span>
          </footer>
        </div>

      </div>
    </div>
  );
}
