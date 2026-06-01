"use client";

import { useState, useEffect } from "react";
import { X, Calendar, MapPin, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { SCHEDULE_DISPLAY } from "@/lib/constants";

export const AnnouncementBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const dismissed = sessionStorage.getItem("training_announcement_dismissed");
    if (dismissed === "true") setIsVisible(false);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("training_announcement_dismissed", "true");
    window.dispatchEvent(new Event("announcement_dismissed"));
  };

  if (!isMounted || !isVisible) return null;

  return (
    <div className="bg-slate-900 relative overflow-hidden group border-b border-white/5">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-blue-600/20 animate-pulse" />

      {/* Shimmer Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" style={{ width: '200%' }} />

      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="hidden md:flex h-6 w-6 rounded-lg bg-blue-600 items-center justify-center text-white shadow-lg shadow-blue-600/20">
             <Sparkles size={14} className="animate-pulse" />
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-x-3 gap-y-0.5">
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 shrink-0">
                Enrollment Live
              </span>
              <div className="h-3 w-px bg-white/10 hidden sm:block" />
              <div className="flex items-center gap-2 text-[10px] md:text-[11px] font-bold text-white/90">
                <Calendar size={12} className="text-blue-500 shrink-0" />
                <span>Starts {SCHEDULE_DISPLAY.trainingStart.split(' at ')[0]}</span>
                <span className="hidden lg:inline text-white/20">•</span>
                <span className="hidden lg:inline italic text-white/40">{SCHEDULE_DISPLAY.mode}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDismiss}
            className="p-1.5 hover:bg-white/5 rounded-lg text-white/30 hover:text-white transition-all group/btn"
          >
            <X size={14} className="group-hover/btn:rotate-90 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
