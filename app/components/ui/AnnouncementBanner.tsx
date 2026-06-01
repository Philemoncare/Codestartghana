"use client";

import { useState, useEffect } from "react";
import { X, Calendar, MapPin, Info, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SCHEDULE_DISPLAY } from "@/lib/constants";

export const AnnouncementBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Check if user has dismissed it before
    const dismissed = localStorage.getItem("training_announcement_dismissed");
    if (dismissed === "true") {
      setIsVisible(false);
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("training_announcement_dismissed", "true");
    window.dispatchEvent(new Event("announcement_dismissed"));
  };

  if (!isMounted || !isVisible) return null;

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-[1000] px-4 py-3 transition-all duration-500 pointer-events-none",
      "animate-in fade-in slide-in-from-top-4 duration-1000",
      isScrolled ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
    )}>
      <div className="max-w-7xl mx-auto relative group pointer-events-auto">
        {/* Main Banner Card */}
        <div className={cn(
          "relative overflow-hidden rounded-2xl md:rounded-full border border-white/20 shadow-2xl transition-all duration-300",
          "bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700",
          "backdrop-blur-xl bg-opacity-90"
        )}>
          {/* Animated Background Shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" style={{ width: '200%' }} />

          <div className="relative px-6 py-3 md:py-2.5 flex flex-col md:flex-row items-center justify-between gap-4">

            {/* Left Section: Live Indicator + Title */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-white/90">
                  Training Announcement
                </span>
                <div className="h-3 w-px bg-white/20 hidden md:block" />
                <div className="flex items-center gap-2">
                   <Calendar size={14} className="text-blue-200" />
                   <span className="text-[11px] md:text-xs font-bold text-white">
                      Begins <span className="text-yellow-300">{SCHEDULE_DISPLAY.trainingStart.split(' at ')[0]}</span>
                   </span>
                </div>
              </div>
            </div>

            {/* Middle Section: Details */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
               <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-blue-200" />
                  <span className="text-[10px] md:text-[11px] font-medium text-blue-50 uppercase tracking-wider italic">
                     {SCHEDULE_DISPLAY.mode} Sessions
                  </span>
               </div>
               <div className="flex items-center gap-2 text-white/70">
                  <Info size={14} className="hidden sm:block" />
                  <span className="text-[10px] font-bold uppercase tracking-tight">
                     Reg closes {SCHEDULE_DISPLAY.registrationDeadline.split(' at ')[0]}
                  </span>
               </div>
            </div>

            {/* Right Section: Action/Close */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleDismiss}
                className="p-1.5 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-colors"
                aria-label="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Subtle Bottom Glow */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent blur-sm" />
      </div>
    </div>
  );
};
