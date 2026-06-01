"use client";

import { useState, useEffect } from "react";
import { ArrowUpRight, LayoutDashboard, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const Hero = () => {
  const [isStudent, setIsStudent] = useState(false);
  const [subtitleIndex, setSubtitleIndex] = useState(0);

  const subtitles = [
    "Premium, project-based software engineering training designed to bridge the gap between academic theory and industry reality",
    "Learn by building real-world projects, not just theory",
    "Industry-focused training designed for future software engineers",
    "Build practical skills that prepare you for real development jobs",
    "Master modern software engineering through hands-on learning"
  ];

  useEffect(() => {
    // Randomize initial subtitle on page refresh
    setSubtitleIndex(Math.floor(Math.random() * subtitles.length));

    // Setup automatic rotation
    const interval = setInterval(() => {
      setSubtitleIndex((prev) => (prev + 1) % subtitles.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const hasStudentSession = document.cookie.split('; ').some(c => c.startsWith('student_email='));
    setIsStudent(hasStudentSession);
  }, []);

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-white isolate">
      {/* ATMOSPHERIC BACKGROUND LAYER */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <Image
          src="/images/her.jpg"
          alt="Engineering Background"
          fill
          priority
          sizes="100vw"
          quality={90}
          className="object-cover opacity-[0.2] scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_20%,_rgba(255,255,255,0.9)_100%)]" />

        {/* Subtle Tech Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(to right, #2563eb 1px, transparent 1px), linear-gradient(to bottom, #2563eb 1px, transparent 1px)`,
          backgroundSize: '3rem 3rem',
        }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 w-full pt-32 pb-10 flex flex-col items-center text-center">
        <div className="space-y-10">

          {/* Single-Line Powerful Heading */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-slate-900 tracking-[-0.04em] uppercase leading-none animate-in fade-in slide-in-from-bottom-6 duration-1000">
            Build the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">Future.</span>
          </h1>

          {/* Dynamic Rotating Subheading */}
          <div className="min-h-[3rem] md:min-h-[4rem] flex items-center justify-center overflow-hidden max-w-3xl mx-auto px-4">
            <p
              key={subtitleIndex}
              className="text-xs sm:text-sm md:text-xl text-slate-500 font-medium tracking-tight animate-in fade-in slide-in-from-bottom-2 duration-700 leading-relaxed"
            >
              {subtitles[subtitleIndex]}
            </p>
          </div>

          {/* Action Set (Limited to Two) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            {isStudent ? (
              <Link
                href="/student/dashboard"
                className="group w-full sm:w-auto px-10 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 transition-all hover:bg-slate-900 hover:shadow-2xl hover:shadow-blue-200 active:scale-95"
              >
                Go to Dashboard
                <LayoutDashboard size={18} className="transition-transform group-hover:scale-110" />
              </Link>
            ) : (
              <Link
                href="/register"
                className="group w-full sm:w-auto px-10 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 transition-all hover:bg-blue-600 hover:shadow-2xl hover:shadow-slate-200 active:scale-95"
              >
                Start Enrollment
                <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>
            )}
            <Link
              href="#curriculum"
              className="group w-full sm:w-auto px-10 py-5 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 transition-all hover:bg-slate-50 active:scale-95 shadow-sm"
            >
              View Curriculum
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
