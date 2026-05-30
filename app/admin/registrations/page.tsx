"use client";

import { useEffect, useState } from "react";
import { adminService } from "@/services/adminService";
import { Loader2, Mail, Smartphone, Search, Filter, Calendar, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { Skeleton } from "@/components/ui/Skeleton";

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await adminService.getRegistrations();
        setRegistrations(Array.isArray(data) ? data : []);
      } catch (error: any) {
        toast.error(error.message || "Failed to load registrations");
        setRegistrations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredRegistrations = registrations.filter(r =>
    r.full_name?.toLowerCase().includes(filter.toLowerCase()) ||
    r.email?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6 md:space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Student Registry</h1>
          <p className="text-slate-500 font-medium">Manage all cohort applications and profiles.</p>
        </div>
        <div className="bg-white border border-slate-200 px-6 py-3 rounded-2xl shadow-sm hidden sm:block">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Applicants</p>
           <p className="text-2xl font-black text-slate-900">{loading ? "..." : registrations.length}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-card">
        <div className="p-5 md:p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/30">
           <div className="relative w-full md:max-w-sm">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input
               type="text"
               placeholder="Search applicants..."
               value={filter}
               onChange={(e) => setFilter(e.target.value)}
               className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm font-medium focus:ring-4 focus:ring-blue-50/50 focus:border-blue-500 outline-none transition-all"
             />
           </div>
           <div className="flex items-center gap-3">
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-[0.98]">
                 <Filter size={14} /> Filter
              </button>
              <div className="sm:hidden flex-1 text-center py-3 bg-slate-900 text-white rounded-xl text-xs font-bold">
                {loading ? "..." : registrations.length} Total
              </div>
           </div>
        </div>

        {/* Desktop View Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-100">
                <th className="px-8 py-5 font-bold text-slate-400 uppercase tracking-widest text-[9px]">Student Details</th>
                <th className="px-8 py-5 font-bold text-slate-400 uppercase tracking-widest text-[9px]">Contact Info</th>
                <th className="px-8 py-5 font-bold text-slate-400 uppercase tracking-widest text-[9px]">Background</th>
                <th className="px-8 py-5 font-bold text-slate-400 uppercase tracking-widest text-[9px]">Application Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-8 py-6"><Skeleton className="h-10 w-32" /></td>
                    <td className="px-8 py-6"><Skeleton className="h-10 w-48" /></td>
                    <td className="px-8 py-6"><Skeleton className="h-10 w-32" /></td>
                    <td className="px-8 py-6"><Skeleton className="h-10 w-24" /></td>
                  </tr>
                ))
              ) : filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-2">
                       <Search size={32} className="text-slate-200" />
                       <p className="text-slate-400 font-medium">No registrations found matching your search.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{reg.full_name}</div>
                      <div className="text-[11px] text-slate-500 font-semibold mt-0.5">{reg.age} years old</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2.5 text-slate-600 mb-1.5">
                        <Mail size={14} className="text-slate-300 group-hover:text-blue-400 transition-colors" />
                        <span className="font-medium text-[13px]">{reg.email}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-slate-600">
                        <Smartphone size={14} className="text-slate-300 group-hover:text-blue-400 transition-colors" />
                        <span className="font-medium text-[13px]">{reg.whatsapp}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-bold text-slate-900 text-[13px] truncate max-w-[180px]">{reg.school}</div>
                      <div className="inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest rounded-md mt-1.5 border border-blue-100/50">
                        {reg.experience}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-slate-600 font-bold text-[13px]">{new Date(reg.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{new Date(reg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View Cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredRegistrations.length === 0 ? (
            <div className="p-16 text-center text-slate-400 font-medium">No registrations found.</div>
          ) : (
            filteredRegistrations.map((reg) => (
              <div key={reg.id} className="p-6 space-y-6 bg-white active:bg-slate-50 transition-all">
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-lg leading-tight truncate">{reg.full_name}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{reg.age} YRS</span>
                       <span className="w-1 h-1 bg-slate-300 rounded-full" />
                       <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{reg.experience}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shrink-0 shadow-sm border border-blue-100">
                    <GraduationCap size={20} />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                   <div className="flex items-center gap-4 text-sm text-slate-600">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                         <Mail size={16} className="text-slate-400" />
                      </div>
                      <span className="truncate font-medium">{reg.email}</span>
                   </div>
                   <div className="flex items-center gap-4 text-sm text-slate-600">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                         <Smartphone size={16} className="text-slate-400" />
                      </div>
                      <span className="font-medium">{reg.whatsapp}</span>
                   </div>
                   <div className="flex items-center gap-4 text-sm text-slate-600">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                         <Calendar size={16} className="text-slate-400" />
                      </div>
                      <span className="font-medium">Applied {new Date(reg.created_at).toLocaleDateString()}</span>
                   </div>
                </div>

                <div className="pt-2">
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Institution / Experience</div>
                   <div className="px-5 py-4 bg-slate-50 rounded-[1.25rem] text-[13px] font-bold text-slate-700 border border-slate-100 leading-snug">
                      {reg.school}
                   </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
