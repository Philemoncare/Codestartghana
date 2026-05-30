import { ArrowUpRight, Play } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50 isolate">
      {/*
        ATMOSPHERIC BACKGROUND LAYER
        Advanced UI: Subtle image blending with deep focus.
      */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <Image
          src="/images/her.jpg"
          alt="Engineering Background"
          fill
          priority
          sizes="100vw"
          quality={90}
          className="object-cover opacity-[0.35] scale-105 will-change-transform"
        />
        {/* Advanced Blend Overlays */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white via-white/40 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_transparent_20%,_rgba(255,255,255,0.8)_100%)]" />
        <div className="absolute inset-0 backdrop-blur-[1px]" />

        {/* Dynamic Light Blobs for Depth */}
        <div className="absolute top-[10%] right-[5%] w-[400px] h-[400px] bg-blue-100/20 rounded-full blur-[100px] will-change-[opacity]" />
        <div className="absolute bottom-[20%] left-[10%] w-[300px] h-[300px] bg-slate-200/30 rounded-full blur-[80px] will-change-[opacity]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 w-full py-16 sm:py-32 md:py-40 flex flex-col items-center lg:items-start text-center lg:text-left">
        <div className="max-w-4xl space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black text-slate-900 leading-[0.9] tracking-[-0.05em] uppercase">
            Build The <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-700 via-blue-600 to-blue-400">Future.</span>
          </h1>
          <p className="text-lg md:text-2xl text-slate-600 max-w-3xl leading-relaxed font-bold tracking-tight px-2 sm:px-0">
            Premium, project-based software engineering training designed to bridge the gap between academic theory and industry reality.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 pt-6 w-full sm:w-auto px-4 sm:px-0">
            <Link
              href="/register"
              className="group w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[12px] sm:text-[13px] flex items-center justify-center gap-3 transition-all hover:bg-blue-600 hover:shadow-2xl hover:shadow-blue-200 active:scale-95"
            >
              Start Enrollment
              <ArrowUpRight size={20} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
            <Link
              href="#curriculum"
              className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[12px] sm:text-[13px] flex items-center justify-center gap-3 transition-all hover:border-slate-400 active:scale-95 shadow-sm"
            >
              Explore Syllabus
            </Link>
          </div>
        </div>

        {/* Cinematic Stats Section */}
        <div className="pt-20 sm:pt-24 grid grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-8 md:gap-20 animate-in fade-in slide-in-from-bottom-4 delay-500 duration-1000 w-full lg:w-auto">
           <StatItem label="Intensive Training" value="4 Weeks" />
           <StatItem label="Hands-on Work" value="10+ Projects" />
           <StatItem label="Max Enrollment" value="25 Seats" />
           <StatItem label="Focus" value="Practical" />
        </div>
      </div>
    </section>
  );
};

const StatItem = ({ label, value }: { label: string, value: string }) => (
  <div className="flex flex-col items-center lg:items-start">
    <p className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">{value}</p>
    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-0.5">{label}</p>
  </div>
);
