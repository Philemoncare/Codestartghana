"use client";

import { NotificationCenter } from "@/components/admin/notifications/NotificationCenter";
import { Bell, ShieldAlert, CheckCircle2, Info, AlertTriangle } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-100">
              <Bell size={24} />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase">System Alerts</h1>
          </div>
          <p className="text-slate-500 font-medium max-w-xl">
            Monitor system health, registration activity, payment confirmations, and security events in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3 p-2 bg-white border border-slate-100 rounded-2xl shadow-sm">
           <div className="px-4 py-2 flex items-center gap-2 border-r border-slate-50">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live</span>
           </div>
           <div className="px-4 py-2 flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Health: Excellent</span>
           </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
         <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-3">
            <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
               <ShieldAlert size={20} />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Security</p>
               <p className="text-xl font-black text-slate-900">Stable</p>
            </div>
         </div>
         <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-3">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
               <CheckCircle2 size={20} />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payments</p>
               <p className="text-xl font-black text-slate-900">Verified</p>
            </div>
         </div>
         <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-3">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
               <Info size={20} />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System</p>
               <p className="text-xl font-black text-slate-900">Online</p>
            </div>
         </div>
         <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-3">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
               <AlertTriangle size={20} />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sync</p>
               <p className="text-xl font-black text-slate-900">Active</p>
            </div>
         </div>
      </div>

      <NotificationCenter />
    </div>
  );
}
