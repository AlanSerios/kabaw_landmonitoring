"use client";

import React, { useRef, useState } from 'react';
import { useAppStore } from '@/store';
import { Printer, CaretLeft, Plant, Drop, Leaf } from '@phosphor-icons/react';
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
    if (!reportRef.current || isGenerating) return;
    setIsGenerating(true);
    
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#FFFFFF",
      });
      const imgData = canvas.toDataURL("image/png");
      
      const pdfW = 210; // A4 width in mm
      const pdfH = 297; // A4 height in mm
      
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      pdf.addImage(imgData, "PNG", 0, 0, pdfW, pdfH);
      pdf.save(`Kabaw_Weekly_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className={`w-full max-w-4xl mx-auto h-full overflow-y-auto pb-24 print:pb-0 ${inter.className}`}>
      {/* Controls - Hidden when printing */}
      <div className="flex items-center justify-between mb-8 print:hidden">
        <button 
          onClick={() => setActiveReportMode('scan')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold transition-colors"
        >
          <CaretLeft weight="bold" /> Back to Receipt
        </button>
        
        <button 
          onClick={generatePDF}
          disabled={isGenerating}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-full font-bold shadow-md transition-all active:scale-95"
        >
          <Printer weight="duotone" className="w-5 h-5" />
          {isGenerating ? "Generating PDF..." : "Export as PDF"}
        </button>
      </div>

      {/* Actual A4 Report Wrapper */}
      <div 
        ref={reportRef} 
        className="bg-white text-slate-900 rounded-3xl md:p-16 p-8 shadow-2xl print:shadow-none print:p-0 mx-auto"
        style={{ aspectRatio: "210/297", minHeight: "1122px", width: "100%", maxWidth: "794px" }}
      >
        {/* Header */}
        <header className="border-b-2 border-slate-900 pb-8 mb-12 flex justify-between items-end">
          <div>
            <h1 className={`${playfair.className} text-5xl font-bold tracking-tight text-slate-900 mb-2`}>
              Environmental Report
            </h1>
            <p className="text-sm font-semibold tracking-widest uppercase text-emerald-700">Kabaw Command Center</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Issue Date</p>
            <p className="text-lg font-bold text-slate-900">{currentDate}</p>
          </div>
        </header>

        {/* Executive Summary */}
        <section className="mb-12">
          <h2 className="text-xs font-black tracking-widest uppercase text-slate-400 mb-4">Executive Summary</h2>
          <p className="text-lg leading-relaxed text-slate-700">
            This weekly automated analysis aggregates geospatial vegetation and moisture indices across your monitored zones. The system has detected mild fluctuations in soil moisture reserves across primary bases, indicating a potential need for proactive irrigation scheduling.
          </p>
        </section>

        {/* Bases Data */}
        <div className="flex flex-col gap-8">
          {monitoredBases.length === 0 ? (
            <div className="p-8 border border-dashed border-slate-300 rounded-2xl text-center text-slate-400">
              No monitored bases have been added yet.
            </div>
          ) : (
            monitoredBases.map((base, idx) => (
              <div key={base.id} className="border border-slate-200 rounded-2xl p-8 bg-slate-50/50">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className={`${playfair.className} text-2xl font-bold text-slate-900`}>{base.name}</h3>
                    <p className="text-xs font-mono text-slate-500 mt-1">{base.lat.toFixed(4)}°, {base.lng.toFixed(4)}°</p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                    Zone {idx + 1}
                  </span>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 text-emerald-600 mb-2">
                      <Plant weight="duotone" className="w-5 h-5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">NDVI</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900">0.72</div>
                    <div className="text-[10px] text-emerald-500 font-bold mt-1">↑ +0.03 vs last week</div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 text-blue-500 mb-2">
                      <Drop weight="duotone" className="w-5 h-5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">NDWI</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900">-0.14</div>
                    <div className="text-[10px] text-orange-500 font-bold mt-1">↓ -0.05 vs last week</div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 text-amber-500 mb-2">
                      <Leaf weight="duotone" className="w-5 h-5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Crop Health</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900">Stable</div>
                    <div className="text-[10px] text-slate-400 font-bold mt-1">Monitoring Required</div>
                  </div>
                </div>

                {/* AI Analysis Notes */}
                <div>
                  <h4 className="text-[10px] font-black tracking-widest uppercase text-slate-400 mb-2">AI Observation</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Vegetation density remains robust (NDVI &gt; 0.7). However, the moisture index (NDWI) shows a slight decline, suggesting that the topsoil is drying faster than the historical average for this month. We recommend deploying secondary ground sensors to verify local hydration levels.
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-slate-200 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span>Generated by Kabaw System</span>
          <span>Page 1 of 1</span>
        </footer>
      </div>
    </div>
  );
}
