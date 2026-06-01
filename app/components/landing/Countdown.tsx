"use client";

import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Timer, Sparkles } from "lucide-react";

const TARGET_DATE = new Date('2026-06-06T13:00:00');

export const Countdown = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isFinished: false,
    progress: 0,
    isReady: false
  });

  useEffect(() => {
    let serverOffset = 0;
    let timer: NodeJS.Timeout;

    const calculateTimeLeft = (offset = 0) => {
      const now = new Date(Date.now() + offset);
      const difference = TARGET_DATE.getTime() - now.getTime();

      const startDate = new Date('2025-01-01T00:00:00');
      const totalDuration = TARGET_DATE.getTime() - startDate.getTime();
      const elapsed = now.getTime() - startDate.getTime();
      const progress = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isFinished: true, progress: 100, isReady: true });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isFinished: false,
        progress: progress,
        isReady: true
      });
    };

    const syncTime = async () => {
      try {
        const start = Date.now();
        const res = await fetch('/api/system/time');
        const data = await res.json();
        const end = Date.now();
        const latency = (end - start) / 2;
        serverOffset = data.timestamp - (end - latency);
        // Re-calculate with sync offset
        calculateTimeLeft(serverOffset);
      } catch (e) {
        console.warn("Timer: Sync failed, using local clock", e);
      }
    };

    // Initial immediate calculation with local time
    calculateTimeLeft(0);

    // Start interval
    timer = setInterval(() => calculateTimeLeft(serverOffset), 1000);

    // Perform background sync
    syncTime();

    return () => {
      if (timer) clearInterval(timer);
    };
  }, []);

  const scrollToRegistration = () => {
    const registrationSection = document.getElementById('registration');
    if (registrationSection) {
      registrationSection.scrollIntoView({ behavior: 'smooth' });
    } else {
        window.location.href = '/register';
    }
  };

  if (timeLeft.isFinished) {
    return (
      <section className="py-20 bg-white border-y border-slate-100 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-5 text-center relative z-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700 text-sm font-bold mb-6 animate-bounce">
            <Sparkles size={16} />
            Live Now
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
            🎉 Training Has Officially Started!
          </h2>
          <p className="mt-4 text-slate-500 text-lg md:text-xl font-medium">
            Join hundreds of students currently mastering the web.
          </p>
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-50/50 via-transparent to-transparent -z-0" />
      </section>
    );
  }

  return (
    <section className="relative py-20 md:py-32 bg-white overflow-hidden">
      {/* Abstract Background Patterns */}
      <div className="absolute inset-0 -z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 relative z-10">
        <div className="flex flex-col items-center text-center space-y-12">

          <div className="space-y-4 max-w-3xl animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest border border-blue-100 mb-2">
              <Timer size={14} />
              Countdown to Kickoff
            </div>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]">
               Training Begins In
            </h2>
            <p className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed">
              Get ready to start your Web Development journey with <span className="text-slate-900 font-bold">HTML, CSS, and JavaScript</span>.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 w-full max-w-5xl animate-fade-in [animation-delay:200ms]">
            <TimeUnit value={timeLeft.days} label="Days" />
            <TimeUnit value={timeLeft.hours} label="Hours" />
            <TimeUnit value={timeLeft.minutes} label="Minutes" />
            <TimeUnit value={timeLeft.seconds} label="Seconds" />
          </div>

          <div className="w-full max-w-3xl space-y-5 animate-fade-in [animation-delay:400ms]">
             <div className="flex justify-between items-end px-1">
                <div className="flex flex-col items-start gap-1 text-left">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Onboarding Progress</span>
                    <span className="text-sm font-bold text-slate-900">Training Roadmap</span>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-black text-slate-900 leading-none">{Math.round(timeLeft.progress)}%</span>
                </div>
             </div>
             <div className="h-4 w-full bg-slate-100 rounded-2xl overflow-hidden p-1 border border-slate-200/50">
                <div
                  className="h-full bg-gradient-to-r from-blue-700 via-blue-500 to-indigo-500 transition-all duration-1000 ease-out rounded-xl relative shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                  style={{ width: `${timeLeft.progress}%` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" style={{ width: '200%' }} />
                </div>
             </div>
          </div>

          <div className="pt-8 flex flex-col items-center gap-8 animate-fade-in [animation-delay:600ms]">
            <button
              onClick={scrollToRegistration}
              className="group relative inline-flex items-center justify-center gap-3 px-12 py-6 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all hover:bg-blue-600 hover:shadow-[0_20px_50px_rgba(59,130,246,0.3)] active:scale-95 overflow-hidden"
            >
              <span className="relative z-10">Complete Registration</span>
              <ArrowUpRight size={20} className="relative z-10 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>

            <div className="flex flex-col items-center gap-2">
                <p className="text-slate-400 font-bold italic text-base md:text-lg max-w-md">
                  "Every expert was once a beginner. Your journey starts soon."
                </p>
                <div className="w-12 h-1 bg-slate-100 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Blur Orbs */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-[120px] -z-10" />
    </section>
  );
};

const TimeUnit = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center p-6 sm:p-8 md:p-10 bg-white border border-slate-100 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] transition-all duration-500 group relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-1 bg-transparent group-hover:bg-blue-600 transition-colors" />
    <span className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 tabular-nums tracking-tighter group-hover:scale-110 transition-transform duration-500 block leading-none">
      {value.toString().padStart(2, '0')}
    </span>
    <span className="text-[9px] sm:text-[11px] md:text-[13px] font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] text-slate-400 mt-2 sm:mt-4 group-hover:text-blue-600 transition-colors">
      {label}
    </span>
  </div>
);
