"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPinArea, PushPin, X } from '@phosphor-icons/react';
import { useAppStore } from '@/store';

export default function SetPrimaryBaseModal() {
  const { newlyAddedBaseId, setNewlyAddedBaseId, setPrimaryBaseId, monitoredBases } = useAppStore();

  const newlyAddedBase = monitoredBases.find(b => b.id === newlyAddedBaseId);

  if (!newlyAddedBaseId || !newlyAddedBase) return null;

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
          <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mb-4 text-emerald-600 dark:text-emerald-400">
            <MapPinArea weight="duotone" className="w-8 h-8" />
          </div>
          
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Set as Primary Base?</h2>
          
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            You've successfully plotted <strong className="text-slate-700 dark:text-slate-300">"{newlyAddedBase.name}"</strong>. Do you want this location to be your primary monitoring base in the header?
          </p>

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => {
                setPrimaryBaseId(newlyAddedBaseId);
                setNewlyAddedBaseId(null);
              }}
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-6 rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              <PushPin weight="bold" className="w-4 h-4" />
              Yes, make it Primary
            </button>
            <button 
              onClick={() => setNewlyAddedBaseId(null)}
              className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 py-3 px-6 rounded-xl font-bold transition-all active:scale-95"
            >
              <X weight="bold" className="w-4 h-4" />
              No, keep my current base
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
