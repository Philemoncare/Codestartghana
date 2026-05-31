import React from 'react';
import { Layout, Shield, Zap, Globe, Cpu, Layers } from "lucide-react";

const technologies = [
  { name: "React", icon: <Layout size={20} />, description: "Frontend" },
  { name: "Next.js", icon: <Layers size={20} />, description: "Framework" },
  { name: "TypeScript", icon: <Shield size={20} />, description: "Type Safety" },
  { name: "Tailwind", icon: <Zap size={20} />, description: "Styling" },
  { name: "PostgreSQL", icon: <Globe size={20} />, description: "Database" },
  { name: "Node.js", icon: <Cpu size={20} />, description: "Runtime" },
];

export const TechStack = () => {
  return (
    <section className="py-12 bg-white border-b border-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
          <div className="shrink-0 text-center md:text-left">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Modern Stack</p>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Industry Standard Tools</h3>
          </div>

          <div className="flex flex-wrap justify-center md:justify-end gap-6 md:gap-10 lg:gap-16 opacity-50 hover:opacity-100 transition-opacity duration-500">
            {technologies.map((tech) => (
              <div key={tech.name} className="flex items-center gap-2.5 group grayscale hover:grayscale-0 transition-all duration-300">
                <div className="text-slate-400 group-hover:text-blue-600 transition-colors">
                  {tech.icon}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-slate-900 tracking-tight leading-none mb-0.5">{tech.name}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">{tech.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
