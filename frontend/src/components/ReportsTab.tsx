"use client";

import { useAppStore } from "@/store";
import { Printer, Warning, DownloadSimple } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { IBM_Plex_Mono, Playfair_Display } from "next/font/google";
import Image from "next/image";

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

/* ─── Component ─── */
export default function ReportsTab() {
  const { scanResult, selectedLocation } = useAppStore();
  const shouldReduceMotion = useReducedMotion();
  const receiptRef = useRef<HTMLDivElement>(null);

  const [key, setKey] = useState(0);
  const [receiptId, setReceiptId] = useState("");
  const [scanDate, setScanDate] = useState("");
  const [scanTime, setScanTime] = useState("");

  useEffect(() => {
    if (scanResult) {
      setKey((prev) => prev + 1);
      setReceiptId(`KBW-${Date.now().toString(36).toUpperCase()}`);
      setScanDate(
        new Date()
          .toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
          })
      );
      setScanTime(
        new Date().toLocaleTimeString("en-US", { hour12: true, hour: "2-digit", minute: "2-digit" })
      );
    }
  }, [scanResult]);

  /* ─── Status logic ─── */
  const getStatus = () => {
    if (!scanResult) return { label: "N/A", color: "#64748b" };
    if (scanResult.ndvi_score > 0.5) return { label: "OPTIMAL", color: "#16a34a" };
    if (scanResult.ndvi_score >= 0.3) return { label: "WARNING", color: "#ca8a04" };
    return { label: "CRITICAL", color: "#dc2626" };
  };

  const status = getStatus();

  return (
    <div className="rounded-[2.5rem] p-6 md:p-12 min-h-[80vh] flex flex-col relative overflow-hidden">
      {!scanResult ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4 relative z-30">
          <Warning className="w-12 h-12 opacity-50" />
          <p className="font-medium text-sm">
            No active scan to generate a report. Select a target on the Dashboard.
          </p>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-8 xl:gap-16 items-center relative z-20">
          {/* ─── LEFT: The Receipt ─── */}
          <div className="xl:col-span-5 relative w-full flex flex-col items-center xl:items-end order-2 xl:order-1">
            {/* Subtle printer slot — minimal and understated */}
            <div className="w-[280px] md:w-[320px] relative z-30 mb-0">
              <div className="h-5 bg-gradient-to-b from-slate-300/60 to-slate-400/40 dark:from-slate-600/60 dark:to-slate-700/40 rounded-t-xl w-full flex items-end justify-center">
                <div className="h-[6px] w-[85%] bg-slate-800/80 dark:bg-black rounded-t-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]" />
              </div>
            </div>

            {/* Receipt — scroll triggered */}
            <motion.div
              ref={receiptRef}
              key={key}
              initial={{ y: -60, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { type: "spring", damping: 22, stiffness: 70, mass: 1.2, delay: 0.15 }
              }
              className="relative z-20 w-[280px] md:w-[320px]"
              style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.12)) drop-shadow(0 8px 16px rgba(0,0,0,0.08))" }}
            >
              <div
                className={`bg-[#faf6ec] text-slate-900 relative ${ibmPlexMono.className}`}
                style={{
                  clipPath:
                    "polygon(0 0, 100% 0, 100% calc(100% - 8px), 97% 100%, 94% calc(100% - 8px), 91% 100%, 88% calc(100% - 8px), 85% 100%, 82% calc(100% - 8px), 79% 100%, 76% calc(100% - 8px), 73% 100%, 70% calc(100% - 8px), 67% 100%, 64% calc(100% - 8px), 61% 100%, 58% calc(100% - 8px), 55% 100%, 52% calc(100% - 8px), 49% 100%, 46% calc(100% - 8px), 43% 100%, 40% calc(100% - 8px), 37% 100%, 34% calc(100% - 8px), 31% 100%, 28% calc(100% - 8px), 25% 100%, 22% calc(100% - 8px), 19% 100%, 16% calc(100% - 8px), 13% 100%, 10% calc(100% - 8px), 7% 100%, 4% calc(100% - 8px), 1% 100%, 0 calc(100% - 8px))",
                }}
              >
                {/* Noise texture overlay */}
                <div
                  className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-multiply"
                  style={{
                    backgroundImage:
                      'url("data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E")',
                  }}
                />

                <div className="relative z-10 px-7 py-8 md:px-8 md:py-10">
                  {/* ── Logo & Brand ── */}
                  <div className="flex flex-col items-center mb-8">
                    <Image
                      src="/unibase_kabaw_logo.svg"
                      alt="Kabaw Logo"
                      width={48}
                      height={48}
                      className="mb-3 rounded-lg"
                    />
                    <h2
                      className={`text-3xl md:text-4xl font-black text-[#1e3a5f] tracking-wide ${playfair.className}`}
                    >
                      Kabaw
                    </h2>
                    <p className="text-[10px] tracking-[0.3em] text-slate-500 font-medium mt-1 uppercase">
                      Air Monitoring System
                    </p>
                  </div>

                  {/* ── Separator ── */}
                  <div className="border-t border-dashed border-slate-400/50 my-5" />

                  {/* ── Meta Info ── */}
                  <div className="flex flex-col gap-1.5 text-[11px] text-slate-600 mb-6">
                    <div className="flex justify-between">
                      <span className="font-semibold">DATE</span>
                      <span className="font-bold text-slate-800">{scanDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">TIME</span>
                      <span className="font-bold text-slate-800">{scanTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">COORDS</span>
                      <span className="font-bold text-slate-800">
                        {selectedLocation?.lat.toFixed(4)}, {selectedLocation?.lng.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">ID</span>
                      <span className="font-bold text-slate-800">{receiptId}</span>
                    </div>
                  </div>

                  {/* ── Separator ── */}
                  <div className="border-t border-dashed border-slate-400/50 my-5" />

                  {/* ── Data Table ── */}
                  <div className="mb-6">
                    <div className="flex justify-between text-[10px] text-slate-400 font-semibold pb-2 mb-3 border-b border-slate-200">
                      <span>MEASUREMENT</span>
                      <span>VALUE</span>
                    </div>

                    <div className="flex justify-between items-baseline text-[13px] mb-4">
                      <div>
                        <span className="font-bold text-slate-800 block">01</span>
                        <span className={`font-bold text-slate-900 text-base ${playfair.className}`}>
                          Vegetation Index
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          NDVI via Sentinel-2 B8/B4
                        </span>
                      </div>
                      <span className="font-bold text-lg text-slate-900 tabular-nums">
                        {scanResult.ndvi_score.toFixed(3)}
                      </span>
                    </div>

                    <div className="border-t border-dotted border-slate-300/60 my-3" />

                    <div className="flex justify-between items-baseline text-[13px] mb-4">
                      <div>
                        <span className="font-bold text-slate-800 block">02</span>
                        <span className={`font-bold text-slate-900 text-base ${playfair.className}`}>
                          Water Content
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          NDWI via Sentinel-2 B8/B3
                        </span>
                      </div>
                      <span className="font-bold text-lg text-slate-900 tabular-nums">
                        {scanResult.ndwi_score.toFixed(3)}
                      </span>
                    </div>
                  </div>

                  {/* ── Separator ── */}
                  <div className="border-t border-dashed border-slate-400/50 my-5" />

                  {/* ── Status Summary ── */}
                  <div className="mb-8">
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="font-semibold text-slate-600 text-xs">OVERALL STATUS:</span>
                      <span
                        className="font-bold text-sm"
                        style={{ color: status.color }}
                      >
                        {status.label}
                      </span>
                    </div>
                    <p className="text-[10px] leading-relaxed text-slate-500 mt-2">
                      {scanResult.ndvi_score > 0.5
                        ? "Dense canopy cover detected. High photosynthetic activity indicates healthy vegetation in the scanned region."
                        : scanResult.ndvi_score >= 0.3
                        ? "Moderate vegetation density. Monitor soil moisture levels and consider supplemental irrigation."
                        : "Sparse vegetation detected. Immediate attention recommended. Check for drought, deforestation, or land degradation."}
                    </p>
                  </div>

                  {/* ── QR Code ── */}
                  <div className="flex flex-col items-center mt-6 mb-4">
                    <QRCodeSVG
                      value="https://kabaw-landmonitoring.vercel.app"
                      size={80}
                      bgColor="transparent"
                      fgColor="#1e3a5f"
                      level="M"
                    />
                    <p className="text-[9px] text-slate-400 mt-2 tracking-wider font-medium">
                      SCAN TO VIEW LIVE DATA
                    </p>
                  </div>

                  {/* ── Footer ── */}
                  <div className="border-t border-dashed border-slate-400/50 mt-5 pt-5">
                    <div className="text-center">
                      <p className="text-[11px] font-bold text-[#1e3a5f] tracking-wider">
                        UNIBASE
                      </p>
                      <p className="text-[9px] text-slate-400 mt-1 leading-relaxed">
                        Kabaw Air Monitoring System
                        <br />
                        kabaw-landmonitoring.vercel.app
                      </p>
                    </div>
                  </div>

                  {/* Spacer for clip-path teeth */}
                  <div className="h-4" />
                </div>
              </div>
            </motion.div>
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
                  transition: { type: "spring", damping: 25, stiffness: 120 },
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
                  transition: { type: "spring", damping: 20, stiffness: 80 },
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
                  transition: { type: "spring", damping: 25, stiffness: 120 },
                },
              }}
              className="text-slate-500 dark:text-slate-400 max-w-sm text-sm md:text-base leading-relaxed"
            >
              Your certified Sentinel-2 orbital scan report. Download for documentation, compliance, or offline verification.
            </motion.p>

            <motion.div
              variants={{
                hidden: { y: 12, opacity: 0 },
                visible: {
                  y: 0,
                  opacity: 1,
                  transition: { type: "spring", damping: 25, stiffness: 120 },
                },
              }}
              className="flex flex-col sm:flex-row gap-3 pt-2"
            >
              <button
                onClick={() => window.print()}
                className="px-7 py-3.5 bg-[#1e3a5f] text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-[#162d4a] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-slate-900/15"
              >
                <DownloadSimple weight="bold" className="w-4 h-4" />
                Download PDF
              </button>
              <button
                onClick={() => window.print()}
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
  );
}
