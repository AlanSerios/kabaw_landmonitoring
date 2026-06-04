"use client";
import { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts';
import { useAppStore } from "@/store";
import { 
  ChartLineUp, Leaf, Drop, ArrowUp, ArrowDown, Planet, CaretDown, Clock
} from "@phosphor-icons/react";
import { AreaChart, Area } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from "react";
import { LoaderTwo } from "@/components/ui/unique-loader-components";
import { t } from "@/lib/i18n";



// Custom tooltip for the chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active) {
    // If the payload is empty or ONLY contains artificial gap lines, it's a missing data point
    if (!payload || payload.length === 0 || payload.every((entry: any) => entry.dataKey.includes('_gap'))) {
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-4 min-w-[180px]">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">{label}</div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Status:</span>
            <span className="text-xs font-black text-amber-600 dark:text-amber-400">
              No Data Recorded
            </span>
          </div>
        </div>
      );
    }

    // Otherwise, we have valid data. Filter out the gap lines so they don't show up.
    const filteredPayload = payload.filter((entry: any) => !entry.dataKey.includes('_gap'));
    
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-4 min-w-[180px]">
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">{label}</div>
        {filteredPayload.map((entry: any) => (
          <div key={entry.dataKey} className="flex items-center gap-2 mb-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{entry.name}:</span>
            <span className="text-xs font-black" style={{ color: entry.color }}>
              {typeof entry.value === 'number' ? entry.value.toFixed(3) : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsTab() {
  const { 
    scanResult, 
    selectedLocation, 
    locationName, 
    timeframe, setTimeframe,
    language
  } = useAppStore();
  const [activeMetric, setActiveMetric] = useState<'both' | 'ndvi' | 'ndwi'>('both');
  const [isSimpleHistoryOpen, setIsSimpleHistoryOpen] = useState(false);

  const loadingTexts = [
    "Naghahanap ng Satellite...",
    "Nagtatanong kay Kuya Kabaw...",
    "KABAW is working...",
    "Sinusuri ang lupa..."
  ];
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);

  useEffect(() => {
    if (!scanResult) {
      const interval = setInterval(() => {
        setLoadingTextIndex(prev => (prev + 1) % loadingTexts.length);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [scanResult]);


  const data = useMemo(() => {
    if (!scanResult || !scanResult.history || !scanResult.history[timeframe]) return [];
    
    // We keep all 12 periods so the X-axis is complete. Recharts handles null values by leaving gaps.
    const rawData = scanResult.history[timeframe].map((h: any) => {
      let label = h.date;
      if (timeframe === 'days') {
        label = new Date(h.date).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      } else if (timeframe === 'months') {
        label = new Date(h.date).toLocaleString('en-US', { month: 'short', year: 'numeric' });
      } else {
        label = h.date.substring(0, 4);
      }
      return {
        label,
        ndvi: h.ndvi,
        ndwi: h.ndwi,
        ndvi_gap: null,
        ndwi_gap: null
      };
    });

    // Populate the gap points for the dashed line
    let lastValidNdviIdx = -1;
    let lastValidNdwiIdx = -1;

    for (let i = 0; i < rawData.length; i++) {
      if (rawData[i].ndvi !== null) {
        if (lastValidNdviIdx !== -1 && i - lastValidNdviIdx > 1) {
          rawData[lastValidNdviIdx].ndvi_gap = rawData[lastValidNdviIdx].ndvi;
          rawData[i].ndvi_gap = rawData[i].ndvi;
        }
        lastValidNdviIdx = i;
      }
      if (rawData[i].ndwi !== null) {
        if (lastValidNdwiIdx !== -1 && i - lastValidNdwiIdx > 1) {
          rawData[lastValidNdwiIdx].ndwi_gap = rawData[lastValidNdwiIdx].ndwi;
          rawData[i].ndwi_gap = rawData[i].ndwi;
        }
        lastValidNdwiIdx = i;
      }
    }

    return rawData;
  }, [scanResult, timeframe]);

  // Check if there was any missing data in the raw history (e.g. from 2013-2015)
  const hasMissingData = scanResult?.history?.[timeframe]?.some((h: any) => h.ndvi === null);

  const validData = data.filter((d: any) => d.ndvi !== null && d.ndwi !== null);
  const latestNdvi = validData.length ? validData[validData.length - 1].ndvi : null;
  const firstNdvi = validData.length ? validData[0].ndvi : null;
  const ndviTrend = latestNdvi !== null && firstNdvi !== null ? latestNdvi - firstNdvi : 0;

  const latestNdwi = validData.length ? validData[validData.length - 1].ndwi : null;
  const firstNdwi = validData.length ? validData[0].ndwi : null;
  const ndwiTrend = latestNdwi !== null && firstNdwi !== null ? latestNdwi - firstNdwi : 0;

  const displayName = locationName || (selectedLocation 
    ? `${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}` 
    : 'Unknown Location');

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 min-h-[80vh] flex flex-col gap-6 overflow-y-auto">
      
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md">
            <ChartLineUp weight="duotone" className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">{t('analytics', language)}</div>
            <h1 className="text-xl font-black text-slate-900 dark:text-slate-100">{t('analytics', language)}</h1>
          </div>
        </div>
      </div>

      {!scanResult ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <LoaderTwo />
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-4">{loadingTexts[loadingTextIndex]}</h3>
          </div>
        </div>
      ) : (
        <>
          {hasMissingData && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-800/50 rounded-2xl p-4 flex items-start gap-3 mt-[-10px]">
              <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                <Leaf weight="duotone" className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-900 dark:text-amber-300">Walang nakuhang data mula sa satellite</h4>
                <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-0.5 leading-relaxed">
                  Minsan ay hindi makita ng satellite ang lupa dahil sa makapal na ulap, o kaya'y bago pa lang ang satellite. <strong className="text-amber-900 dark:text-amber-300 font-bold">Ang dashed yellow line</strong> ay nangangahulugang walang record sa panahong iyon.
                </p>
              </div>
            </div>
          )}

          {/* Metric summary cards */}
          <div className="grid grid-cols-2 gap-3 md:gap-4">
        <button
          onClick={() => setActiveMetric(activeMetric === 'ndvi' ? 'both' : 'ndvi')}
          className={`rounded-2xl p-4 sm:p-5 border transition-all duration-300 text-left ${
            activeMetric === 'ndwi' ? 'opacity-40' : 
            activeMetric === 'ndvi' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700/50 shadow-md' :
            'bg-slate-50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50 hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-700/50'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <Leaf weight="fill" className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-slate-500">NDVI</span>
            </div>
            <div className={`flex items-center gap-1 text-xs font-bold ${ndviTrend >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
              {ndviTrend >= 0 ? <ArrowUp weight="bold" className="w-3 h-3 shrink-0" /> : <ArrowDown weight="bold" className="w-3 h-3 shrink-0" />}
              {ndviTrend >= 0 ? '+' : ''}{ndviTrend.toFixed(3)}
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 leading-tight">{scanResult.ndvi_score.toFixed(3)}</div>
          <div className="text-[11px] sm:text-xs text-slate-500 mt-1 font-medium leading-tight whitespace-nowrap overflow-hidden text-ellipsis">{t('cropHealth', language)}</div>
        </button>

        <button
          onClick={() => setActiveMetric(activeMetric === 'ndwi' ? 'both' : 'ndwi')}
          className={`rounded-2xl p-4 sm:p-5 border transition-all duration-300 text-left ${
            activeMetric === 'ndvi' ? 'opacity-40' : 
            activeMetric === 'ndwi' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700/50 shadow-md' :
            'bg-slate-50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700/50'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0">
                <Drop weight="fill" className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-slate-500">NDWI</span>
            </div>
            <div className={`flex items-center gap-1 text-xs font-bold ${ndwiTrend >= 0 ? 'text-blue-600' : 'text-rose-500'}`}>
              {ndwiTrend >= 0 ? <ArrowUp weight="bold" className="w-3 h-3 shrink-0" /> : <ArrowDown weight="bold" className="w-3 h-3 shrink-0" />}
              {ndwiTrend >= 0 ? '+' : ''}{ndwiTrend.toFixed(3)}
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 leading-tight">{scanResult.ndwi_score.toFixed(3)}</div>
          <div className="text-[11px] sm:text-xs text-slate-500 mt-1 font-medium leading-tight whitespace-nowrap overflow-hidden text-ellipsis">{t('moistureLevel', language)}</div>
        </button>
      </div>

      {/* Chart controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mt-4 md:mt-6 gap-4">
        <div className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest text-center md:text-left">
          {activeMetric === 'both' ? t('both', language) : activeMetric === 'ndvi' ? t('cropHealth', language) : t('moistureLevel', language)} {t('overTime', language)}
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl mx-auto md:mx-0 w-full md:w-auto overflow-x-auto hide-scrollbar">
          {(['days', 'months', 'years'] as const).map((g) => (
            <button
              key={g}
              onClick={() => {
                if (timeframe === g) return;
                setTimeframe(g);
              }}
              className={`flex-1 md:flex-none px-3 md:px-4 py-2 md:py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                timeframe === g 
                ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {t(g as 'days' | 'months' | 'years', language)}
            </button>
          ))}
        </div>
      </div>
      
      <div className="mt-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col">
        <button 
          onClick={() => setIsSimpleHistoryOpen(!isSimpleHistoryOpen)}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full text-left focus:outline-none group"
        >
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 shrink-0 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center">
                <Clock weight="bold" className="w-5 h-5 text-emerald-600" />
             </div>
             <h3 className="font-bold text-slate-800 dark:text-slate-200 shrink-0 group-hover:text-emerald-500 transition-colors">{t('simpleHistory', language)}</h3>
          </div>
          <div className="flex items-center self-end sm:self-auto justify-end gap-3 w-full sm:w-auto">
            <motion.div animate={{ rotate: isSimpleHistoryOpen ? 180 : 0 }} transition={{ type: 'spring', bounce: 0.5 }}>
              <CaretDown weight="bold" className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
            </motion.div>
          </div>
        </button>

        <AnimatePresence initial={false}>
          {isSimpleHistoryOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              className="overflow-hidden"
            >
              <div className="pt-6">
                <div className="flex flex-wrap items-center justify-start gap-3 sm:gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50 dark:bg-slate-700/80 p-2 sm:px-3 rounded-xl border border-slate-100 dark:border-slate-600 shadow-sm w-max max-w-full overflow-hidden mb-4">
                  <span className="text-slate-400 mr-1 hidden sm:inline">{t('legend', language)}</span>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-inner shrink-0"></div> {t('healthy', language)}</div>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-inner shrink-0"></div> {t('watered', language)}</div>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-inner shrink-0"></div> {t('danger', language)}</div>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-inner shrink-0"></div> {t('drought', language)}</div>
                </div>
                
                <div className="w-full flex flex-nowrap gap-3 overflow-x-auto pb-4 pt-1 px-1">
                  {data.filter((d: any) => d.ndvi !== null).map((d: any, idx: number) => {
                    const isHealthy = d.ndvi > 0.4;
                    const isWarning = d.ndvi >= 0.2 && d.ndvi <= 0.4;
                    
                    const isWaterHealthy = d.ndwi > 0.0;
                    const isWaterWarning = d.ndwi > -0.2 && d.ndwi <= 0.0;
                    
                    return (
                      <div key={idx} className="flex flex-col items-center gap-2 border border-slate-100 dark:border-slate-700 p-3 rounded-2xl shrink-0">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">{d.label}</div>
                        <div className="flex gap-2">
                          <div className={`w-8 h-8 rounded-full shadow-inner flex items-center justify-center ${isHealthy ? 'bg-emerald-500' : isWarning ? 'bg-amber-500' : 'bg-rose-500'}`}>
                            <Leaf weight="fill" className="w-4 h-4 text-white" />
                          </div>
                          <div className={`w-8 h-8 rounded-full shadow-inner flex items-center justify-center ${isWaterHealthy ? 'bg-blue-500' : isWaterWarning ? 'bg-amber-500' : 'bg-rose-500'}`}>
                            <Drop weight="fill" className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div className="w-2 shrink-0"></div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-6 relative h-[300px] w-full" style={{ minHeight: '300px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMetric}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute inset-0 w-full"
          >
            <ResponsiveContainer width="99%" height={300}>
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="ndviGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ndwiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="label" 
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} 
                  tickLine={false} 
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} 
                  tickLine={false} 
                  axisLine={false}
                  domain={[-1, 1]}
                  tickFormatter={(v) => v.toFixed(1)}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="#e2e8f0" strokeWidth={1} strokeDasharray="4 4" />
                
                {(activeMetric === 'both' || activeMetric === 'ndvi') && (
                  <Area
                    type="monotone"
                    dataKey="ndvi"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#ndviGrad)"
                    connectNulls={false}
                    dot={{ r: 3, strokeWidth: 2, fill: '#fff', stroke: '#10b981' }}
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
                    name="NDVI (Kalusugan ng Tanim)"
                  />
                )}
                {(activeMetric === 'both' || activeMetric === 'ndvi') && (
                  <Line
                    type="monotone"
                    dataKey="ndvi_gap"
                    stroke="#eab308"
                    strokeWidth={2.5}
                    strokeDasharray="4 4"
                    connectNulls={true}
                    dot={false}
                    activeDot={false}
                    isAnimationActive={false}
                  />
                )}
                {(activeMetric === 'both' || activeMetric === 'ndwi') && (
                  <Area
                    type="monotone"
                    dataKey="ndwi"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    fill="url(#ndwiGrad)"
                    connectNulls={false}
                    dot={{ r: 3, strokeWidth: 2, fill: '#fff', stroke: '#3b82f6' }}
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }}
                    name="NDWI (Dami ng Tubig)"
                  />
                )}
                {(activeMetric === 'both' || activeMetric === 'ndwi') && (
                  <Line
                    type="monotone"
                    dataKey="ndwi_gap"
                    stroke="#eab308"
                    strokeWidth={2.5}
                    strokeDasharray="4 4"
                    connectNulls={true}
                    dot={false}
                    activeDot={false}
                    isAnimationActive={false}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 pt-2 border-t border-slate-100 dark:border-slate-800 flex-wrap mt-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-emerald-500 rounded-full" />
          <span className="text-xs font-semibold text-slate-500">NDVI — Vegetation Index</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-blue-500 rounded-full" />
          <span className="text-xs font-semibold text-slate-500">NDWI — Moisture Index</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-0 bg-transparent border-t-2 border-dashed border-yellow-500 rounded-full" />
          <span className="text-xs font-semibold text-slate-500">Missing Data Interpolation</span>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
