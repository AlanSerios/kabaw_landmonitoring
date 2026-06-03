"use client";
import { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, AreaChart
} from 'recharts';
import { useAppStore } from "@/store";
import { 
  ChartLineUp, MapPin, Leaf, Drop, ArrowUp, ArrowDown
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";



// Custom tooltip for the chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active) {
    // If the payload is empty or ONLY contains artificial gap lines, it's a missing data point
    if (!payload || payload.length === 0 || payload.every((entry: any) => entry.dataKey.includes('_gap'))) {
      return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-4 min-w-[180px]">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">{label}</div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-xs font-bold text-slate-600">Status:</span>
            <span className="text-xs font-black text-amber-600">
              No Data Recorded
            </span>
          </div>
        </div>
      );
    }

    // Otherwise, we have valid data. Filter out the gap lines so they don't show up.
    const filteredPayload = payload.filter((entry: any) => !entry.dataKey.includes('_gap'));
    
    return (
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-4 min-w-[180px]">
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">{label}</div>
        {filteredPayload.map((entry: any) => (
          <div key={entry.dataKey} className="flex items-center gap-2 mb-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-xs font-bold text-slate-600">{entry.name}:</span>
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

export default function AnalyticsTab({ handleLocationSelect }: { handleLocationSelect?: (lat: number, lng: number) => void }) {
  const { 
    scanResult, setScanResult, 
    selectedLocation, setSelectedLocation, 
    locationName, setLocationName, 
    waypoints,
    timeframe, setTimeframe
  } = useAppStore();
  const [activeMetric, setActiveMetric] = useState<'both' | 'ndvi' | 'ndwi'>('both');


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
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 min-h-[80vh] flex flex-col gap-6 overflow-y-auto">
      
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md">
            <ChartLineUp weight="duotone" className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Time-Series Analytics</div>
            <h1 className="text-xl font-black text-slate-900">Historical Trends</h1>
          </div>
        </div>
      </div>

      {!scanResult ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 min-h-[400px]">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            >
              <ChartLineUp weight="duotone" className="w-8 h-8 text-slate-400" />
            </motion.div>
          </div>
          <div className="text-center">
            <h3 className="font-bold text-slate-800 mb-1">Awaiting Telemetry</h3>
            <p className="text-sm text-slate-400 max-w-xs">Connecting to Sentinel-2 and processing historical imagery. This may take a few seconds...</p>
          </div>
        </div>
      ) : (
        <>
          {hasMissingData && (
            <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-4 flex items-start gap-3 mt-[-10px]">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <Leaf weight="duotone" className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-900">Some historical data is unavailable</h4>
                <p className="text-xs text-amber-700/80 mt-0.5 leading-relaxed">
                  Sentinel-2 was launched in mid-2015. Data prior to this date, or during periods of continuous heavy cloud cover, cannot be retrieved. <strong className="text-amber-900 font-bold">Missing periods are connected with a dashed yellow line</strong> to indicate no data was recorded during that time.
                </p>
              </div>
            </div>
          )}

          {/* Metric summary cards */}
          <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setActiveMetric(activeMetric === 'ndvi' ? 'both' : 'ndvi')}
          className={`rounded-2xl p-5 border transition-all duration-300 text-left ${
            activeMetric === 'ndwi' ? 'opacity-40' : 
            activeMetric === 'ndvi' ? 'bg-emerald-50 border-emerald-300 shadow-md' :
            'bg-slate-50 border-slate-200/50 hover:shadow-md hover:border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                <Leaf weight="fill" className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">NDVI</span>
            </div>
            <div className={`flex items-center gap-1 text-xs font-bold ${ndviTrend >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
              {ndviTrend >= 0 ? <ArrowUp weight="bold" className="w-3 h-3" /> : <ArrowDown weight="bold" className="w-3 h-3" />}
              {ndviTrend >= 0 ? '+' : ''}{ndviTrend.toFixed(3)}
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{scanResult.ndvi_score.toFixed(3)}</div>
          <div className="text-xs text-slate-500 mt-1 font-medium">Vegetation Index</div>
        </button>

        <button
          onClick={() => setActiveMetric(activeMetric === 'ndwi' ? 'both' : 'ndwi')}
          className={`rounded-2xl p-5 border transition-all duration-300 text-left ${
            activeMetric === 'ndvi' ? 'opacity-40' : 
            activeMetric === 'ndwi' ? 'bg-blue-50 border-blue-300 shadow-md' :
            'bg-slate-50 border-slate-200/50 hover:shadow-md hover:border-blue-200'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500 text-white flex items-center justify-center">
                <Drop weight="fill" className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">NDWI</span>
            </div>
            <div className={`flex items-center gap-1 text-xs font-bold ${ndwiTrend >= 0 ? 'text-blue-600' : 'text-rose-500'}`}>
              {ndwiTrend >= 0 ? <ArrowUp weight="bold" className="w-3 h-3" /> : <ArrowDown weight="bold" className="w-3 h-3" />}
              {ndwiTrend >= 0 ? '+' : ''}{ndwiTrend.toFixed(3)}
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{scanResult.ndwi_score.toFixed(3)}</div>
          <div className="text-xs text-slate-500 mt-1 font-medium">Moisture Index</div>
        </button>
      </div>

      {/* Chart controls */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          {activeMetric === 'both' ? 'NDVI & NDWI' : activeMetric === 'ndvi' ? 'Vegetation (NDVI)' : 'Moisture (NDWI)'} over Time
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {(['days', 'months', 'years'] as const).map((g) => (
            <button
              key={g}
              onClick={() => {
                if (timeframe === g) return;
                setTimeframe(g);
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeframe === g 
                ? 'bg-white text-emerald-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-[300px] mt-6 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMetric}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute inset-0 w-full h-full"
          >
            <ResponsiveContainer width="100%" height="100%">
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
                    name="NDVI (Vegetation)"
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
                    name="NDWI (Moisture)"
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
      <div className="flex items-center gap-6 pt-2 border-t border-slate-100 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-emerald-500 rounded-full" />
          <span className="text-xs font-semibold text-slate-500">NDVI — Normalized Difference Vegetation Index</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-blue-500 rounded-full" />
          <span className="text-xs font-semibold text-slate-500">NDWI — Normalized Difference Water Index</span>
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
