"use client";

import { useState, useEffect } from "react";
import { Hero } from "@/components/landing/Hero";
import { Curriculum } from "@/components/landing/Curriculum";
import { FAQ } from "@/components/landing/FAQ";
import { AboutFounder } from "@/components/landing/AboutFounder";
import { Countdown } from "@/components/landing/Countdown";
import {
  Globe, Laptop, Zap, ArrowUpRight, LayoutDashboard,
  ShieldCheck, Users, GraduationCap, Code2,
  MessageSquare, Layout, Smartphone, Settings, BarChart3,
  CheckCircle2, Rocket, Search, Terminal
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  const [isStudent, setIsStudent] = useState(false);

  useEffect(() => {
    const hasStudentSession = document.cookie.split('; ').some(c => c.startsWith('student_email='));
    setIsStudent(hasStudentSession);
  }, []);

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Hero />

      {/* Learning Impact Highlights - Premium Compact Cards */}
      <section className="py-12 bg-white relative z-20 -mt-16 mx-auto w-[92%] max-w-6xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

          {/* Card 1: Live Learning */}
          <div className="group relative bg-white border border-slate-100 rounded-[2rem] p-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_40px_-20px_rgba(37,99,235,0.15)] transition-all duration-500 hover:-translate-y-1">
            <div className="flex flex-col gap-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Globe size={20} className="relative z-10 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.15em] mb-1.5">Live Environment</h4>
                <p className="text-slate-400 text-[9px] font-bold leading-relaxed uppercase tracking-widest">Real-time interactive sessions with feedback.</p>
              </div>
            </div>
          </div>

          {/* Card 2: Project-Based */}
          <div className="group relative bg-slate-950 rounded-[2rem] p-6 shadow-xl transition-all duration-500 hover:-translate-y-1 overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 blur-2xl rounded-full -mr-12 -mt-12" />
             <div className="flex flex-col gap-4 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-blue-400 border border-white/10 group-hover:bg-blue-600 group-hover:text-white transition-all">
                   <Code2 size={20} />
                </div>
                <div>
                   <h4 className="text-[11px] font-black text-white uppercase tracking-[0.15em] mb-1.5">Build Reality</h4>
                   <p className="text-slate-500 text-[9px] font-bold leading-relaxed uppercase tracking-widest">Mastery through production-grade delivery.</p>
                </div>
             </div>
          </div>

          {/* Card 3: Cohort System */}
          <div className="group bg-white border border-slate-100 rounded-[2rem] p-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_40px_-20px_rgba(99,102,241,0.15)] transition-all duration-500 hover:-translate-y-1">
             <div className="flex flex-col gap-4">
                <div className="flex items-center gap-1.5 h-10">
                   <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                   <div className="h-px w-4 bg-slate-100" />
                   <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-indigo-300 transition-colors" />
                   <div className="h-px w-4 bg-slate-100" />
                   <div className="w-1.5 h-1.5 rounded-full bg-slate-100 group-hover:bg-indigo-200 transition-colors" />
                </div>
                <div>
                   <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.15em] mb-1.5">Structured Path</h4>
                   <p className="text-slate-400 text-[9px] font-bold leading-relaxed uppercase tracking-widest">Beginner to advanced mastery pathways.</p>
                </div>
             </div>
          </div>

          {/* Card 4: Industry Focus */}
          <div className="group relative bg-white border border-slate-100 rounded-[2rem] p-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_40px_-20px_rgba(16,185,129,0.15)] transition-all duration-500 hover:-translate-y-1">
             <div className="flex flex-col gap-4 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:rotate-12 transition-transform">
                   <Search size={20} />
                </div>
                <div>
                   <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.15em] mb-1.5">Market Ready</h4>
                   <p className="text-slate-400 text-[9px] font-bold leading-relaxed uppercase tracking-widest">Strict alignment with professional roles.</p>
                </div>
             </div>
          </div>

        </div>
      </section>

      <Countdown />

      {/* Program Preview Section - Structured Card Grid */}
      <section id="curriculum" className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight uppercase">Program Architecture</h2>
            <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">A structured engineering path designed for practical mastery.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ModuleCard
              index={1}
              title="Modern Web Core"
              description="Master HTML5, CSS3, and modern layouts with a focus on semantic structure and accessibility."
              tags={["HTML", "CSS", "UI/UX"]}
            />
            <ModuleCard
              index={2}
              title="Advanced Logic"
              description="Deep dive into JavaScript fundamentals, asynchronous patterns, and engineering problem-solving."
              tags={["JS", "ES6+", "API"]}
            />
            <ModuleCard
              index={3}
              title="Frontend Systems"
              description="Building scalable interfaces with React, Next.js, and efficient state management patterns."
              tags={["React", "Next.js"]}
            />
            <ModuleCard
              index={4}
              title="Database Design"
              description="Implementing persistent data layers with PostgreSQL and secure backend architectures."
              tags={["Postgres", "SQL"]}
            />
            <ModuleCard
              index={5}
              title="Product Deployment"
              description="Learning industry-standard CI/CD pipelines, version control, and production hosting."
              tags={["Git", "Vercel"]}
            />
            <ModuleCard
              index={6}
              title="Final Capstone"
              description="Develop and deploy a production-grade application to solidify your engineering portfolio."
              tags={["Project", "Live"]}
            />
          </div>
        </div>
      </section>

      {/* How it Works - Timeline Flow */}
      <section id="onboarding" className="py-24 md:py-32 bg-slate-50/50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight uppercase">The Onboarding Flow</h2>
            <p className="text-slate-500 font-medium text-lg max-w-xl mx-auto">From registration to graduation, we've optimized your learning journey.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
             <FlowStep number="01" icon={<Search size={18} />} title="Register" description="Apply for the 2026 cohort online." />
             <FlowStep number="02" icon={<ShieldCheck size={18} />} title="Approved" description="Our team verifies your application." />
             <FlowStep number="03" icon={<Rocket size={18} />} title="Access" description="Gain entry to the student portal." />
             <FlowStep number="04" icon={<Terminal size={18} />} title="Build" description="Work on real industry projects." />
             <FlowStep number="05" icon={<GraduationCap size={18} />} title="Graduate" description="Earn your engineering certificate." />
          </div>
        </div>
      </section>

      <AboutFounder />

      {/* Feature Grid Section - Premium Features */}
      <section className="py-24 md:py-32 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-end gap-8 mb-20">
             <div className="space-y-4 text-center lg:text-left">
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight uppercase">Infrastructure</h2>
                <p className="text-slate-500 font-medium text-lg max-w-xl">A complete custom ecosystem built to manage your progress and learning.</p>
             </div>
             <Link href="/register" className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-blue-100">
                Join Now
             </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             <FeatureCard
               icon={<Layout size={24} />}
               title="Student Portal"
               description="A central hub for all your projects, resources, and progress tracking."
             />
             <FeatureCard
               icon={<Smartphone size={24} />}
               title="Live Timetable"
               description="Real-time updates on session schedules and classroom links."
             />
             <FeatureCard
               icon={<MessageSquare size={24} />}
               title="Smart Alerts"
               description="Automated SMS and email notifications for important cohort updates."
             />
             <FeatureCard
               icon={<BarChart3 size={24} />}
               title="Skill Tracking"
               description="Visual metrics showing your growth across different technical modules."
             />
          </div>
        </div>
      </section>

      <FAQ />

      {/* Final CTA Section */}
      <section id="registration" className="py-24 md:py-40 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(37,99,235,0.1),_transparent_70%)]" />
        <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center space-y-10 relative z-10">
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-white tracking-tight leading-none uppercase">
            Bridge the gap. <br/> <span className="text-blue-500">Build for reality.</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
            The June 2026 cohort is limited to 25 seats to ensure high-quality mentorship. Secure your engineering spot today.
          </p>
          <div className="pt-4">
            {isStudent ? (
              <Link
                href="/student/dashboard"
                className="group inline-flex items-center justify-center gap-3 px-12 py-6 bg-white text-slate-900 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-2xl active:scale-95"
              >
                Enter Portal Dashboard
                <LayoutDashboard size={20} />
              </Link>
            ) : (
              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-3 px-12 py-6 bg-blue-600 text-white rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-2xl shadow-blue-900/50 active:scale-95"
              >
                Start Enrollment
                <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

const ModuleCard = ({ index, title, description, tags }: any) => (
  <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:border-blue-500/10 transition-all group relative overflow-hidden">
    <div className="absolute top-0 right-0 p-6">
       <span className="text-4xl font-black text-slate-50 group-hover:text-blue-50 transition-colors">0{index}</span>
    </div>
    <div className="space-y-4 relative z-10">
      <div className="flex gap-2">
         {tags.map((t: string) => (
           <span key={t} className="px-2 py-0.5 bg-slate-50 text-slate-400 text-[8px] font-black uppercase tracking-widest rounded-md border border-slate-100">{t}</span>
         ))}
      </div>
      <h3 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">{title}</h3>
      <p className="text-slate-500 font-medium leading-relaxed text-sm">{description}</p>
    </div>
  </div>
);

const FlowStep = ({ number, icon, title, description }: any) => (
  <div className="p-10 bg-white border border-slate-200 rounded-[2.5rem] space-y-5 relative hover:border-blue-600 transition-colors group">
    <div className="flex justify-between items-start">
       <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 group-hover:text-blue-600 transition-colors">{number}</span>
       <div className="text-slate-400 group-hover:text-blue-600 transition-colors">
          {icon}
       </div>
    </div>
    <div className="space-y-2">
       <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">{title}</h4>
       <p className="text-slate-500 text-[11px] font-bold leading-relaxed">{description}</p>
    </div>
  </div>
);

const FeatureCard = ({ icon, title, description }: any) => (
  <div className="p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] hover:bg-white hover:shadow-xl transition-all group">
    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:shadow-lg group-hover:shadow-blue-100 transition-all mb-6 border border-slate-100">
      {icon}
    </div>
    <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">{title}</h4>
    <p className="text-slate-500 text-xs font-medium leading-relaxed">{description}</p>
  </div>
);
