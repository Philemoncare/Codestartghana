"use client";

import React from 'react';
import { BookOpen, Clock } from 'lucide-react';
import Link from 'next/link';

export default function LearningSpacePlaceholder() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-20 text-center space-y-8 animate-in fade-in duration-500">
      <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto border border-blue-100 shadow-sm">
        <BookOpen size={40} />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Learning Space</h1>
        <p className="text-slate-500 font-medium max-w-md mx-auto">
          The interactive learning engine is currently being synchronized with the 2026 curriculum modules.
        </p>
      </div>
      <div className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-full w-fit mx-auto text-xs font-black uppercase tracking-widest border border-amber-100">
        <Clock size={14} /> Deployment in Progress
      </div>
      <div className="pt-4">
        <Link href="/student/dashboard" className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl">Return to Dashboard</Link>
      </div>
    </main>
  );
}
