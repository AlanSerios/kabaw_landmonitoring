"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store';
import { Target, X, MapPin } from '@phosphor-icons/react';

export default function SetMainBaseModal() {
  const { showMainBaseModal, setShowMainBaseModal, setIsPlottingMainLocation, setActiveTab } = useAppStore();

  if (!showMainBaseModal) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
      >
        <motion.div 
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 relative"
        >
          <button 
            onClick={() => {
              setShowMainBaseModal(false);
              setIsPlottingMainLocation(false);
            }}
            className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X weight="bold" className="w-4 h-4 text-slate-500" />
          </button>

          <div className="flex flex-col items-center text-center mt-2">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-5">
              <Target weight="duotone" className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
              Set Your Main Base
            </h2>
            
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed font-medium">
              Please click on the map to plot your central monitoring location. This will calibrate your Weather, AQI, and Notifications.
            </p>

            <button 
              onClick={() => {
                setActiveTab('dashboard');
                setIsPlottingMainLocation(true);
                setShowMainBaseModal(false);
              }}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
            >
              Got it, let's plot
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
