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
      setIsScrolled(window.scrollY > 20);
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
      "fixed top-0 left-0 right-0 z-[2000] px-2 md:px-4 py-2 transition-all duration-500 pointer-events-none",
      isScrolled ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
    )}>
      <div className="max-w-7xl mx-auto relative group pointer-events-auto">
        {/* Main Banner Card */}
        <div className={cn(
          "relative overflow-hidden rounded-xl md:rounded-full border border-white/20 shadow-2xl transition-all duration-300",
          "bg-blue-600 shadow-blue-500/20"
        )}>
          {/* Animated Background Shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" style={{ width: '200%' }} />

          <div className="relative px-4 md:px-6 py-1.5 flex items-center justify-between gap-2">

            {/* Left Section: Live Indicator + Title */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[9px] md:text-xs font-black uppercase tracking-wider text-white">
                  Live: Training Enrollment
                </span>
                <div className="h-3 w-px bg-white/20 hidden sm:block" />
                <div className="flex items-center gap-1.5 min-w-0">
                   <Calendar size={12} className="text-blue-200 shrink-0" />
                   <span className="text-[9px] md:text-xs font-bold text-white truncate">
                      Starts {SCHEDULE_DISPLAY.trainingStart.split(' at ')[0]}
                   </span>
                </div>
              </div>
            </div>

            {/* Middle Section: Mode (Hidden on mobile) */}
            <div className="hidden lg:flex items-center gap-2">
               <MapPin size={12} className="text-blue-200 shrink-0" />
               <span className="text-[9px] md:text-[10px] font-bold text-blue-50 uppercase tracking-tight italic">
                  {SCHEDULE_DISPLAY.mode}
               </span>
            </div>

            {/* Right Section: Close */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleDismiss}
                className="p-1.5 hover:bg-white/20 rounded-full text-white/80 hover:text-white transition-colors"
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
