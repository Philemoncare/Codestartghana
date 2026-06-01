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
    try {
      localStorage.setItem("codestart_cookie_consent", status);
    } catch (e) {
      console.warn("CookieConsent: Failed to save to localStorage", e);
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[200] p-4 md:p-6 animate-in fade-in slide-in-from-bottom-10 duration-700 ease-out">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-7 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center md:items-start gap-4 text-center md:text-left">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 hidden sm:flex border border-blue-100/50 shadow-sm">
              <Cookie size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900 tracking-tight">Privacy Preferences</h3>
              <p className="text-slate-500 text-[13px] font-medium max-w-xl leading-relaxed">
                We use cookies to optimize your learning experience. By clicking "Accept", you agree to our <Link href="/privacy" className="text-blue-600 hover:underline font-bold">Privacy Policy</Link>.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 w-full md:w-auto">
            <button
              onClick={handleReject}
              className="flex-1 md:flex-none px-6 py-3 bg-white text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 hover:text-slate-600 transition-all flex items-center justify-center gap-2 border border-slate-200 active:scale-95"
            >
              Reject
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 md:flex-none px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 active:scale-95 flex items-center justify-center gap-2"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
