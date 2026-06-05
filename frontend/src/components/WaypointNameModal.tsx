"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPinPlus, Check, X } from '@phosphor-icons/react';
import { useAppStore } from '@/store';

export default function WaypointNameModal() {
  const { isNamingWaypoint, setIsNamingWaypoint, pendingWaypointCoords, setPendingWaypointCoords, addWaypoint } = useAppStore();
  const [name, setName] = useState("");

  if (!isNamingWaypoint || !pendingWaypointCoords) return null;

  const handleSave = () => {
    if (name.trim()) {
      addWaypoint({ name: name.trim(), lat: pendingWaypointCoords.lat, lng: pendingWaypointCoords.lng });
      setIsNamingWaypoint(false);
      setPendingWaypointCoords(null);
      setName("");
    }
  };

  const handleCancel = () => {
    setIsNamingWaypoint(false);
    setPendingWaypointCoords(null);
    setName("");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        {/* Blurred Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-sm bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/50 dark:border-slate-700/50 text-center"
        >
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
            <MapPinPlus weight="duotone" className="w-8 h-8" />
          </div>
          
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Name this Waypoint</h2>
          
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
            Enter a descriptive name for this specific location.
          </p>

          <input 
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder="e.g. North Sector, Zone B"
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 mb-6 text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />

          <div className="flex gap-3">
            <button 
              onClick={handleCancel}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 py-3 px-4 rounded-xl font-bold transition-all active:scale-95"
            >
              <X weight="bold" className="w-4 h-4" />
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={!name.trim()}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              <Check weight="bold" className="w-4 h-4" />
              Save
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
