"use client";

import { useAppStore } from "@/store";
import { Printer, Warning, DownloadSimple } from "@phosphor-icons/react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { IBM_Plex_Mono, Playfair_Display } from "next/font/google";
import Image from "next/image";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

/* ─── Fonts ─── */
const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
  style: ["normal", "italic"],
});

/* ─── Receipt Paper Print Animation (CSS Keyframes injected once) ─── */
const PRINT_CSS = `
@keyframes receiptFeed {
  0%   { max-height: 0; }
  100% { max-height: 1200px; }
}
@keyframes receiptFeedReduced {
  0%   { max-height: 0; }
  100% { max-height: 1200px; }
}
`;

/* ─── Component ─── */
export default function ReportsTab() {
  const { scanResult, selectedLocation, locationName } = useAppStore();
  const shouldReduceMotion = useReducedMotion();

  /* Scroll trigger ref — animation starts when this enters the viewport */
  const triggerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(triggerRef, { once: true, amount: 0.15 });

  const receiptContentRef = useRef<HTMLDivElement>(null);

  const [key, setKey] = useState(0);
  const [receiptId, setReceiptId] = useState("");
  const [scanDate, setScanDate] = useState("");
  const [scanTime, setScanTime] = useState("");
  const [animating, setAnimating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  /* ─── PDF Download handler ─── */
  const handleDownloadPDF = useCallback(async () => {
    if (!receiptContentRef.current || isGenerating) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(receiptContentRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#faf6ec",
        logging: false,
      });
      const imgData = canvas.toDataURL("image/png");
      const imgW = canvas.width;
      const imgH = canvas.height;

      // Receipt-shaped PDF (custom page size in mm)
      const pdfW = 80; // 80mm receipt width
      const pdfH = (imgH / imgW) * pdfW;
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [pdfW, pdfH + 10] });
      pdf.addImage(imgData, "PNG", 5, 5, pdfW - 10, pdfH);
      pdf.save(`Kabaw_Report_${receiptId || "receipt"}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating, receiptId]);

  /* ─── Print handler ─── */
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  useEffect(() => {
    if (scanResult) {
      setKey((prev) => prev + 1);
      setReceiptId(`KBW-${Date.now().toString(36).toUpperCase()}`);
      setScanDate(
        new Date().toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        })
      );
      setScanTime(
        new Date().toLocaleTimeString("en-US", {
          hour12: true,
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }
  }, [scanResult]);

  /* Trigger animation when in view */
  useEffect(() => {
    if (isInView && scanResult) {
      setAnimating(true);
    }
  }, [isInView, scanResult]);

  /* ─── Status logic ─── */
  const getStatus = () => {
    if (!scanResult) return { label: "N/A", color: "#64748b" };
    if (scanResult.ndvi_score > 0.5) return { label: "OPTIMAL", color: "#16a34a" };
    if (scanResult.ndvi_score >= 0.3) return { label: "WARNING", color: "#ca8a04" };
    return { label: "CRITICAL", color: "#dc2626" };
  };

  const status = getStatus();

  return (
    <>
      {/* Inject keyframe CSS */}
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

      <div
        ref={triggerRef}
        className="rounded-[2.5rem] p-6 md:p-12 min-h-[80vh] flex flex-col relative overflow-hidden"
      >
        {!scanResult ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4 relative z-30">
            <Warning className="w-12 h-12 opacity-50" />
            <p className="font-medium text-sm">
              No active scan to generate a report. Select a target on the
              Dashboard.
            </p>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-8 xl:gap-16 items-center relative z-20">
            {/* ─── LEFT: The Receipt ─── */}
            <div className="xl:col-span-5 relative w-full flex flex-col items-center xl:items-end order-2 xl:order-1">
              {/* ── Printer Body ── */}
              <div className="relative w-[280px] md:w-[320px]">
                {/* TOP LIP — sits IN FRONT of the paper (z-30) */}
                <div className="relative z-30">
                  <div
                    className="h-14 md:h-16 w-full rounded-t-2xl border border-slate-300/80 dark:border-slate-700 flex flex-col items-center justify-end overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(180deg, #e2e5ea 0%, #c8cdd4 40%, #b0b8c2 100%)",
                    }}
                  >
                    {/* Subtle LED indicator */}
                    <div className="absolute top-3 right-4 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)] animate-pulse" />

                    {/* The dark slot opening */}
                    <div
                      className="h-4 md:h-5 w-[88%] rounded-t-sm mb-0"
                      style={{
                        background:
                          "linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)",
                        boxShadow:
                          "inset 0 4px 12px rgba(0,0,0,1), inset 0 -1px 0 rgba(255,255,255,0.08)",
                      }}
                    />
                  </div>
                  {/* Bottom edge shadow cast over paper */}
                  <div
                    className="h-[3px] w-full"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, transparent 100%)",
                    }}
                  />
                </div>

                {/* RECEIPT PAPER — sits BEHIND the top lip (z-20) */}
                {/* Uses max-height + steps() for realistic mechanical printer feed */}
                <div className="relative z-20 -mt-[2px] flex justify-center">
                  <div
                    key={key}
                    className="w-[92%] overflow-hidden"
                    style={{
                      maxHeight: animating ? "1200px" : "0",
                      animation: animating
                        ? shouldReduceMotion
                          ? "receiptFeedReduced 0.5s linear forwards"
                          : "receiptFeed 2.8s steps(40, end) forwards"
                        : "none",
                    }}
                  >
                    <div
                      className={`bg-[#faf6ec] text-slate-900 relative ${ibmPlexMono.className}`}
                      style={{
                        filter:
                          "drop-shadow(0 12px 24px rgba(0,0,0,0.12)) drop-shadow(0 4px 8px rgba(0,0,0,0.06))",
                        clipPath:
                          "polygon(0 0, 100% 0, 100% calc(100% - 8px), 97% 100%, 94% calc(100% - 8px), 91% 100%, 88% calc(100% - 8px), 85% 100%, 82% calc(100% - 8px), 79% 100%, 76% calc(100% - 8px), 73% 100%, 70% calc(100% - 8px), 67% 100%, 64% calc(100% - 8px), 61% 100%, 58% calc(100% - 8px), 55% 100%, 52% calc(100% - 8px), 49% 100%, 46% calc(100% - 8px), 43% 100%, 40% calc(100% - 8px), 37% 100%, 34% calc(100% - 8px), 31% 100%, 28% calc(100% - 8px), 25% 100%, 22% calc(100% - 8px), 19% 100%, 16% calc(100% - 8px), 13% 100%, 10% calc(100% - 8px), 7% 100%, 4% calc(100% - 8px), 1% 100%, 0 calc(100% - 8px))",
                      }}
                    >
                      {/* Noise texture overlay */}
                      <div
                        className="absolute inset-0 opacity-[0.035] pointer-events-none mix-blend-multiply"
                        style={{
                          backgroundImage:
                            'url("data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.85%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E")',
                        }}
                      />

                      <div ref={receiptContentRef} className="relative z-10 px-6 py-7 md:px-7 md:py-9">
                        {/* ── Logo & Brand ── */}
                        <div className="flex flex-col items-center mb-7">
                          <Image
                            src="/unibase_kabaw_logo.svg"
                            alt="Kabaw Logo"
                            width={44}
                            height={44}
                            className="mb-2.5 rounded-lg"
                          />
                          <h2
                            className={`text-3xl md:text-[2rem] font-black text-[#1e3a5f] tracking-wide ${playfair.className}`}
                          >
                            Kabaw
                          </h2>
                          <p className="text-[9px] tracking-[0.3em] text-slate-500 font-medium mt-0.5 uppercase">
                            Air Monitoring System
                          </p>
                        </div>

                        {/* ── Separator ── */}
                        <div className="border-t border-dashed border-slate-400/50 my-4" />

                        {/* ── Meta Info ── */}
                        <div className="flex flex-col gap-1 text-[11px] text-slate-600 mb-5">
                          <div className="flex justify-between">
                            <span className="font-semibold">DATE</span>
                            <span className="font-bold text-slate-800">
                              {scanDate}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-semibold">TIME</span>
                            <span className="font-bold text-slate-800">
                              {scanTime}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-semibold">LOCATION</span>
                            <span className="font-bold text-slate-800 text-right max-w-[55%] truncate" title={locationName || `${selectedLocation?.lat.toFixed(4)}, ${selectedLocation?.lng.toFixed(4)}`}>
                              {locationName || `${selectedLocation?.lat.toFixed(4)}, ${selectedLocation?.lng.toFixed(4)}`}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-semibold">ID</span>
                            <span className="font-bold text-slate-800">
                              {receiptId}
                            </span>
                          </div>
                        </div>

                        {/* ── Separator ── */}
                        <div className="border-t border-dashed border-slate-400/50 my-4" />

                        {/* ── Data Table ── */}
                        <div className="mb-5">
                          <div className="flex justify-between text-[10px] text-slate-400 font-semibold pb-1.5 mb-2.5 border-b border-slate-200">
                            <span>MEASUREMENT</span>
                            <span>VALUE</span>
                          </div>

                          <div className="flex justify-between items-baseline text-[13px] mb-3.5">
                            <div>
                              <span className="font-bold text-slate-700 text-[10px] block">
                                01
                              </span>
                              <span
                                className={`font-bold text-slate-900 text-[15px] ${playfair.className}`}
                              >
                                Vegetation Index
                              </span>
                              <span className="text-[9px] text-slate-500 block mt-0.5">
                                NDVI via Sentinel-2 B8/B4
                              </span>
                            </div>
                            <span className="font-bold text-lg text-slate-900 tabular-nums">
                              {scanResult.ndvi_score.toFixed(3)}
                            </span>
                          </div>

                          <div className="border-t border-dotted border-slate-300/50 my-2.5" />

                          <div className="flex justify-between items-baseline text-[13px] mb-3.5">
                            <div>
                              <span className="font-bold text-slate-700 text-[10px] block">
                                02
                              </span>
                              <span
                                className={`font-bold text-slate-900 text-[15px] ${playfair.className}`}
                              >
                                Water Content
                              </span>
                              <span className="text-[9px] text-slate-500 block mt-0.5">
                                NDWI via Sentinel-2 B8/B3
                              </span>
                            </div>
                            <span className="font-bold text-lg text-slate-900 tabular-nums">
                              {scanResult.ndwi_score.toFixed(3)}
                            </span>
                          </div>
                        </div>

                        {/* ── Separator ── */}
                        <div className="border-t border-dashed border-slate-400/50 my-4" />

                        {/* ── Status ── */}
                        <div className="mb-6">
                          <div className="flex justify-between items-center text-sm mb-1.5">
                            <span className="font-semibold text-slate-500 text-[11px]">
                              OVERALL STATUS:
                            </span>
                            <span
                              className="font-bold text-sm"
                              style={{ color: status.color }}
                            >
                              {status.label}
                            </span>
                          </div>
                          <p className="text-[9px] leading-relaxed text-slate-500 mt-1.5">
                            {scanResult.ndvi_score > 0.5
                              ? "Dense canopy cover detected. High photosynthetic activity indicates healthy vegetation in the scanned region."
                              : scanResult.ndvi_score >= 0.3
                              ? "Moderate vegetation density. Monitor soil moisture levels and consider supplemental irrigation."
                              : "Sparse vegetation detected. Immediate attention recommended. Check for drought, deforestation, or land degradation."}
                          </p>
                        </div>

                        <div className="flex flex-col items-center mt-5 mb-3">
                          <QRCodeSVG
                            value={`https://kabaw-landmonitoring.vercel.app?lat=${selectedLocation?.lat || 0}&lng=${selectedLocation?.lng || 0}`}
                            size={72}
                            bgColor="transparent"
                            fgColor="#1e3a5f"
                            level="M"
                          />
                          <p className="text-[8px] text-slate-400 mt-1.5 tracking-wider font-medium">
                            SCAN TO VIEW LIVE DATA
                          </p>
                        </div>

                        {/* ── Footer ── */}
                        <div className="border-t border-dashed border-slate-400/50 mt-4 pt-4">
                          <div className="text-center">
                            <p className="text-[11px] font-bold text-[#1e3a5f] tracking-wider">
                              UNIBASE
                            </p>
                            <p className="text-[8px] text-slate-400 mt-0.5 leading-relaxed">
                              Kabaw Air Monitoring System
                              <br />
                              kabaw-landmonitoring.vercel.app
                            </p>
                          </div>
                        </div>

                        {/* Spacer for clip-path teeth */}
                        <div className="h-3" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* PRINTER BOTTOM BODY — sits BEHIND the paper (z-10) */}
                <div className="relative z-10 -mt-[1px]">
                  <div
                    className="h-6 md:h-8 w-full rounded-b-2xl border border-t-0 border-slate-300/80 dark:border-slate-700"
                    style={{
                      background:
                        "linear-gradient(180deg, #b8bfc8 0%, #c8cdd4 50%, #d8dde2 100%)",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* ─── RIGHT: Action Area ─── */}
            <motion.div
              className="xl:col-span-7 flex flex-col justify-center gap-6 xl:gap-8 xl:pl-8 order-1 xl:order-2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.12 },
                },
              }}
            >
              <motion.p
                variants={{
                  hidden: { y: 12, opacity: 0 },
                  visible: {
                    y: 0,
                    opacity: 1,
                    transition: {
                      type: "spring",
                      damping: 25,
                      stiffness: 120,
                    },
                  },
                }}
                className="text-xs font-bold tracking-[0.25em] text-slate-400 dark:text-slate-500 uppercase"
              >
                Mission Summary
              </motion.p>

              <motion.h1
                variants={{
                  hidden: { y: 20, opacity: 0 },
                  visible: {
                    y: 0,
                    opacity: 1,
                    transition: {
                      type: "spring",
                      damping: 20,
                      stiffness: 80,
                    },
                  },
                }}
                className={`text-5xl md:text-6xl xl:text-7xl font-black text-[#1e3a5f] dark:text-slate-100 leading-[0.95] tracking-tight ${playfair.className}`}
              >
                Get Your
                <br />
                Telemetry
                <br />
                <span className="italic">Receipt</span>
              </motion.h1>

              <motion.p
                variants={{
                  hidden: { y: 12, opacity: 0 },
                  visible: {
                    y: 0,
                    opacity: 1,
                    transition: {
                      type: "spring",
                      damping: 25,
                      stiffness: 120,
                    },
                  },
                }}
                className="text-slate-500 dark:text-slate-400 max-w-sm text-sm md:text-base leading-relaxed"
              >
                Your certified Sentinel-2 orbital scan report. Download for
                documentation, compliance, or offline verification.
              </motion.p>

              <motion.div
                variants={{
                  hidden: { y: 12, opacity: 0 },
                  visible: {
                    y: 0,
                    opacity: 1,
                    transition: {
                      type: "spring",
                      damping: 25,
                      stiffness: 120,
                    },
                  },
                }}
                className="flex flex-col sm:flex-row gap-3 pt-2"
              >
                <button
                  onClick={handleDownloadPDF}
                  disabled={isGenerating}
                  className="px-7 py-3.5 bg-[#1e3a5f] text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-[#162d4a] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-slate-900/15 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <DownloadSimple weight="bold" className="w-4 h-4" />
                  {isGenerating ? "Generating..." : "Download PDF"}
                </button>
                <button
                  onClick={handlePrint}
                  className="px-7 py-3.5 bg-transparent border-2 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-full font-bold uppercase tracking-widest text-xs hover:border-slate-400 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5"
                >
                  <Printer weight="bold" className="w-4 h-4" />
                  Print
                </button>
              </motion.div>
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
}
