"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudSun, Wind, Drop, Thermometer } from '@phosphor-icons/react';
import { useAppStore } from '@/store';

export default function WeatherPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBaseId, setSelectedBaseId] = useState<string | null>(null);
  const { mainLocation, monitoredBases } = useAppStore();

  const activeBase = selectedBaseId ? monitoredBases.find(b => b.id === selectedBaseId) : (monitoredBases.length > 0 ? monitoredBases[0] : mainLocation);

  return (
    <div 
      className="relative flex items-center"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Weather Pill */}
      <div className="flex items-center gap-2 px-3 py-2 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-full border border-slate-200/50 dark:border-slate-700/50 shadow-sm cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-colors duration-300">
        <CloudSun weight="duotone" className="w-4 h-4 text-sky-500" />
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">28°C</span>
      </div>

      {/* Expandable Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full right-0 mt-3 w-64 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden z-[9999]"
          >
            {/* Popover Header */}
            <div className="p-4 border-b border-slate-200/50 dark:border-slate-800/50 bg-gradient-to-br from-sky-50 to-white dark:from-slate-800 dark:to-slate-900">
              <div className="flex items-start justify-between">
                <div>
                  {monitoredBases.length > 1 ? (
                    <select 
                      value={selectedBaseId || monitoredBases[0].id}
                      onChange={(e) => setSelectedBaseId(e.target.value)}
                      className="font-black text-slate-900 dark:text-white bg-transparent outline-none max-w-[140px] appearance-none cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      {monitoredBases.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  ) : (
                    <h3 className="font-black text-slate-900 dark:text-white truncate max-w-[140px]">
                      {activeBase?.name || 'Cebu City'}
                    </h3>
                  )}
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Partly Cloudy</p>
                </div>
                <CloudSun weight="duotone" className="w-10 h-10 text-sky-500" />
              </div>
              <div className="mt-3 text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                28°<span className="text-xl text-slate-400">C</span>
              </div>
            </div>

            {/* Current Metrics */}
            <div className="p-3 grid grid-cols-2 gap-2 border-b border-slate-200/50 dark:border-slate-800/50">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <Wind className="w-4 h-4 text-slate-400" />
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Wind</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">12 km/h</span>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <Drop className="w-4 h-4 text-slate-400" />
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Humidity</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">65%</span>
                </div>
              </div>
            </div>

            {/* 3-Day Forecast */}
            <div className="p-3 bg-white dark:bg-slate-900">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">3-Day Forecast</p>
              <div className="space-y-1">
                {[
                  { day: 'Tomorrow', temp: '29°C', icon: <CloudSun weight="duotone" className="w-4 h-4 text-sky-500" /> },
                  { day: 'Wednesday', temp: '27°C', icon: <Drop weight="duotone" className="w-4 h-4 text-blue-400" /> },
                  { day: 'Thursday', temp: '30°C', icon: <Thermometer weight="duotone" className="w-4 h-4 text-orange-500" /> }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{item.day}</span>
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 w-8 text-right">{item.temp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
