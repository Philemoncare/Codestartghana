"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { X, Cookie, Check } from "lucide-react";

export const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("codestart_cookie_consent");
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    saveConsent("accepted");
  };

  const handleReject = () => {
    saveConsent("rejected");
  };

  const saveConsent = (status: "accepted" | "rejected") => {
    localStorage.setItem("codestart_cookie_consent", status);
    setIsVisible(false);
    // You can trigger your analytics initialization here if status === 'accepted'
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[200] p-4 md:p-6 animate-in fade-in slide-in-from-bottom-10 duration-700">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200 shadow-[0_-20px_80px_-20px_rgba(0,0,0,0.15)] rounded-2xl md:rounded-[2rem] p-5 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4 text-center md:text-left">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 hidden sm:flex border border-blue-100/50">
              <Cookie size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Cookie Consent</h3>
              <p className="text-slate-500 text-sm font-medium max-w-2xl leading-relaxed">
                We use cookies to improve your experience, analyze traffic, and enhance our services.
                Learn more in our <Link href="/privacy" className="text-blue-600 hover:underline font-bold">Privacy Policy</Link>.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 w-full md:w-auto">
            <button
              onClick={handleReject}
              className="flex-1 md:flex-none px-6 py-3.5 bg-white text-slate-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2 border border-slate-200 active:scale-95"
            >
              <X size={14} /> Reject
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 md:flex-none px-10 py-3.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 active:scale-95 flex items-center justify-center gap-2"
            >
              <Check size={14} /> Accept Cookies
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
