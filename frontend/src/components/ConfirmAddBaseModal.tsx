"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store';
import { Target, X, MapPin } from '@phosphor-icons/react';

export default function ConfirmAddBaseModal() {
  const { showConfirmAddBaseModal, setShowConfirmAddBaseModal, setIsPlottingMainLocation, setActiveTab } = useAppStore();

  if (!showConfirmAddBaseModal) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
        {/* Blurred Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowConfirmAddBaseModal(false)}
          className="absolute inset-0 bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div 
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-white/50 dark:border-slate-800/50 relative text-center"
        >
          <button 
            onClick={() => setShowConfirmAddBaseModal(false)}
            className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X weight="bold" className="w-4 h-4 text-slate-500" />
          </button>

          <div className="flex flex-col items-center mt-2">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-5">
              <MapPin weight="duotone" className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-bounce" />
            </div>
            
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
              Add Another Base?
            </h2>
            
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed font-medium">
              Would you like to plot another monitored base on the map? This will track localized satellite metrics and weather charts for this new base zone.
            </p>

            <div className="flex flex-col gap-3 w-full">
              <button 
                onClick={() => {
                  setActiveTab('dashboard');
                  setIsPlottingMainLocation(true);
                  setShowConfirmAddBaseModal(false);
                }}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95 text-sm"
              >
                Yes, let's plot
              </button>
              
              <button 
                onClick={() => setShowConfirmAddBaseModal(false)}
                className="w-full py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition-all active:scale-95 text-sm"
              >
                No, cancel
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
