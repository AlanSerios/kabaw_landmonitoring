"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Warning, Info, CheckCircle } from '@phosphor-icons/react';

export default function NotificationsPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  return (
    <div className="relative flex items-center hidden md:block">
      {/* Notification Bell */}
      <button 
        onClick={() => { setIsOpen(!isOpen); setHasUnread(false); }}
        className="relative p-2 md:p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
      >
        <Bell weight="bold" className="w-5 h-5" />
        
        {/* Pinging Red Dot for unread */}
        {hasUnread && (
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white dark:border-slate-900"></span>
          </span>
        )}
      </button>

      {/* Expandable Popover */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for closing */}
            <div 
              className="fixed inset-0 z-[9998]" 
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute top-full right-0 mt-3 w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl overflow-hidden z-[9999]"
            >
              {/* Popover Header */}
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Notifications</h3>
                <button className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline">Mark all as read</button>
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto">
                {[
                  {
                    id: 1,
                    type: 'warning',
                    title: 'Air Quality Alert',
                    message: 'AQI has dropped below optimal levels in your monitored area.',
                    time: 'Just now',
                    icon: <Warning weight="duotone" className="w-5 h-5 text-orange-500" />
                  },
                  {
                    id: 2,
                    type: 'success',
                    title: 'System Update',
                    message: 'Kabaw system software updated to version 2.1.',
                    time: '2 hours ago',
                    icon: <CheckCircle weight="duotone" className="w-5 h-5 text-emerald-500" />
                  },
                  {
                    id: 3,
                    type: 'info',
                    title: 'Weekly Report Ready',
                    message: 'Your environmental analysis for the week is ready to view.',
                    time: '1 day ago',
                    icon: <Info weight="duotone" className="w-5 h-5 text-blue-500" />
                  }
                ].map((notif) => (
                  <div key={notif.id} className="p-4 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer flex gap-3">
                    <div className="shrink-0 mt-0.5">
                      {notif.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-0.5">{notif.title}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mb-1">{notif.message}</p>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">{notif.time}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* View All Button */}
              <div className="p-2 border-t border-slate-100 dark:border-slate-800">
                <button className="w-full py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  View all activity
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
