"use client";

import { useEffect, useState, useMemo } from "react";
import { adminService } from "@/services/adminService";
import { Mail, Smartphone, Search, GraduationCap, Check, X, ShieldCheck, Clock, RefreshCw, Trash2, AlertCircle } from "lucide-react";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";

import { Skeleton } from "@/components/ui/Skeleton";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [selectedTimetableId, setSelectedTimetableId] = useState<string>("");
  const [isCleanupModalOpen, setIsCleanupModalOpen] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);

  const fetchData = async () => {
    try {
      const [regData, timetableData] = await Promise.all([
        adminService.getRegistrations(),
        adminService.getTimetable()
      ]);
      setRegistrations(Array.isArray(regData) ? regData : []);
      setTimetable(Array.isArray(timetableData) ? timetableData : []);
    } catch (error: any) {
      notify.error("Data Sync Failed", "Failed to load registrations or timetable");
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleManualStatusUpdate = async (regId: number, status: string) => {
    const tid = notify.loading("Updating student record...");
    try {
      await apiFetch('/api/admin/student-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: regId, status }),
      });

      notify.success("Status Modified", `The student is now ${status}.`);
      fetchData();
    } catch (error: any) {
      notify.error("Operation Failed", "Unable to update account status.");
    } finally {
      notify.dismiss(tid);
    }
  };

  const handleMarkAttendance = async (regId: number) => {
    if (!selectedTimetableId) {
      return notify.error("Session Missing", "Select a timetable session first");
    }

    const tid = notify.loading("Marking attendance...");
    try {
      await adminService.markAttendance({
        registrationId: regId,
        timetableId: parseInt(selectedTimetableId)
      });
      notify.success("Attendance verified!");
    } catch (error: any) {
      notify.error("Verification Failed", error.message || "Failed to mark attendance");
    } finally {
      notify.dismiss(tid);
    }
  };

  const handleDeleteRegistration = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this registration record? This action cannot be undone.")) return;

    const tid = notify.loading("Removing from persistent storage...");
    try {
      await adminService.deleteRegistration(id);
      notify.success("Record Erased", "Registration data has been permanently removed.");
      fetchData();
    } catch (error: any) {
      notify.error("Deletion Failed", "Unable to erase record from database.");
    } finally {
      notify.dismiss(tid);
    }
  };

  const handleFullCleanup = async () => {
    setIsCleaning(true);
    const tid = notify.loading("Wiping system registry...");
    try {
      const res = await fetch('/api/admin/data', { method: 'POST' });
      const result = await res.json();
      if (result.success) {
        notify.success("Database Wiped", "All student records cleared.");
        setIsCleanupModalOpen(false);
        fetchData();
      } else {
        notify.error("Cleanup Halted", result.error);
      }
    } catch (e: any) {
      notify.error("Network Fault", "Unable to connect to the main node.");
    } finally {
      setIsCleaning(false);
      notify.dismiss(tid);
    }
  };

  const filteredRegistrations = useMemo(() => {
    if (!Array.isArray(registrations)) return [];

    return registrations.filter(r => {
      if (!r) return false;

      const matchesSearch =
        String(r.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(r.email || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || r.status === statusFilter;

      const matchesPayment = paymentFilter === "all" ||
        (paymentFilter === "paid" && r.payment_status === "approved") ||
        (paymentFilter === "unpaid" && (!r.payment_status || r.payment_status !== "approved"));

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [registrations, searchTerm, statusFilter, paymentFilter]);

  return (
    <div className="space-y-6 md:space-y-10">
      <ConfirmationModal
        isOpen={isCleanupModalOpen}
        onClose={() => setIsCleanupModalOpen(false)}
        onConfirm={handleFullCleanup}
        isLoading={isCleaning}
        title="Critical System Purge"
        description="This action will permanently delete all registration and payment data from the system. This cannot be undone and will affect all students. Are you absolutely certain?"
        confirmText="Yes, Purge Everything"
        variant="danger"
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Student Registry</h1>
          <p className="text-slate-500 font-medium">Manage all cohort applications and profiles.</p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button
            onClick={() => setIsCleanupModalOpen(true)}
            className="px-6 py-3 bg-red-50 text-red-600 border border-red-100 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm"
          >
            Clear All Data
          </button>
          <div className="bg-white border border-slate-200 px-6 py-3 rounded-2xl shadow-sm hidden sm:block">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Applicants</p>
             <p className="text-2xl font-black text-slate-900">{loading ? "..." : registrations.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-card">
        <div className="p-5 md:p-8 border-b border-slate-100 flex flex-col xl:flex-row md:items-center justify-between gap-6 bg-slate-50/30">
           <div className="relative w-full xl:max-w-md">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input
               type="text"
               placeholder="Search name or email..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm font-medium focus:ring-4 focus:ring-blue-50/50 focus:border-blue-500 outline-none transition-all"
             />
           </div>

           <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">Filter Status</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  <option value="all">All Profiles</option>
                  <option value="pending">Pending Only</option>
                  <option value="approved">Approved Only</option>
                  <option value="rejected">Rejected Only</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">Payment</span>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  <option value="all">Any Status</option>
                  <option value="paid">Verified Paid</option>
                  <option value="unpaid">Unpaid / Processing</option>
                </select>
              </div>

              <div className="hidden xl:block h-6 w-px bg-slate-200 mx-2" />

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest whitespace-nowrap">Active Session</span>
                <select
                  value={selectedTimetableId}
                  onChange={(e) => setSelectedTimetableId(e.target.value)}
                  className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-xs font-bold text-blue-600 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  <option value="">Select Class...</option>
                  {timetable.map(t => (
                    <option key={t.id} value={t.id}>{t.day}: {t.topic}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1 xl:flex-none text-center xl:text-left py-3 px-4 bg-slate-900 text-white rounded-xl text-xs font-bold whitespace-nowrap">
                {loading ? "..." : filteredRegistrations.length} Matching
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
                <th className="px-8 py-5 font-bold text-slate-400 uppercase tracking-widest text-[9px]">System Status</th>
                <th className="px-8 py-5 font-bold text-slate-400 uppercase tracking-widest text-[9px] text-right">Administrative Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-8 py-6"><Skeleton className="h-10 w-32" /></td>
                    <td className="px-8 py-6"><Skeleton className="h-10 w-48" /></td>
                    <td className="px-8 py-6"><Skeleton className="h-10 w-32" /></td>
                    <td className="px-8 py-6 text-right"><Skeleton className="h-10 w-24 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-2">
                       <Search size={32} className="text-slate-200" />
                       <p className="text-slate-400 font-medium">No registrations found matching your filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((reg) => (
                  <tr key={reg?.id || Math.random()} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{reg?.full_name || "N/A"}</div>
                      <div className="text-[11px] text-slate-500 font-semibold mt-0.5">{reg?.age || "?"} years old • {reg?.experience || "No info"}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2.5 text-slate-600 mb-1.5">
                        <Mail size={14} className="text-slate-300" />
                        <span className="font-medium text-[13px]">{reg?.email || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-slate-600">
                        <Smartphone size={14} className="text-slate-300" />
                        <span className="font-medium text-[13px]">{reg?.whatsapp || "N/A"}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1.5">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 w-fit",
                          reg?.status === "approved" ? "border-emerald-200 text-emerald-600 bg-emerald-50" :
                          reg?.status === "rejected" ? "border-rose-200 text-rose-600 bg-rose-50" :
                          "border-amber-200 text-amber-600 bg-amber-50"
                        )}>
                          {reg?.status === 'approved' ? <ShieldCheck size={10} /> : <Clock size={10} />}
                          {reg?.status || 'pending'}
                        </span>
                        {reg?.payment_status && (
                          <div className={cn(
                            "text-[9px] font-black uppercase tracking-tight ml-1",
                            reg.payment_status === "approved" ? "text-emerald-500" : "text-amber-500"
                          )}>
                            Payment: {reg.payment_status}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => handleDeleteRegistration(reg.id)}
                            className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition-all"
                            title="Delete Permanently"
                          >
                             <Trash2 size={18} />
                          </button>
                          {reg?.status !== 'rejected' ? (
                            <>
                              <button
                                onClick={() => handleMarkAttendance(reg.id)}
                                className="p-2 text-blue-600 hover:bg-blue-50 border border-blue-100 rounded-lg transition-all"
                                title="Mark Attendance"
                              >
                                 <ShieldCheck size={18} />
                              </button>
                              {reg?.status !== 'approved' && (
                                <button
                                  onClick={() => handleManualStatusUpdate(reg.id, 'approved')}
                                  className="p-2 text-emerald-600 hover:bg-emerald-50 border border-emerald-100 rounded-lg transition-all"
                                  title="Approve Account"
                                >
                                   <Check size={18} />
                                </button>
                              )}
                              <button
                                onClick={() => handleManualStatusUpdate(reg.id, 'rejected')}
                                className="p-2 text-rose-600 hover:bg-rose-50 border border-rose-100 rounded-lg transition-all"
                                title="Reject Account"
                              >
                                 <X size={18} />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleManualStatusUpdate(reg.id, 'pending')}
                              className="p-2 text-blue-600 hover:bg-blue-50 border border-blue-100 rounded-lg transition-all"
                              title="Restore to Pending"
                            >
                               <RefreshCw size={18} />
                            </button>
                          )}
                       </div>
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
            <div className="p-16 text-center text-slate-400 font-medium">No registrations found matching your filters.</div>
          ) : (
            filteredRegistrations.map((reg) => (
              <div key={reg?.id || Math.random()} className="p-6 space-y-6 bg-white active:bg-slate-50 transition-all">
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-lg leading-tight truncate">{reg?.full_name || "N/A"}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{reg?.age || "?"} YRS</span>
                       <span className="w-1 h-1 bg-slate-300 rounded-full" />
                       <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{reg?.experience || "No info"}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shrink-0 shadow-sm border border-blue-100">
                    <GraduationCap size={20} />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 w-fit",
                    reg?.status === "approved" ? "border-emerald-200 text-emerald-600 bg-emerald-50" :
                    reg?.status === "rejected" ? "border-rose-200 text-rose-600 bg-rose-50" :
                    "border-amber-200 text-amber-600 bg-amber-50"
                  )}>
                    {reg?.status || 'pending'}
                  </span>
                  {reg?.payment_status && (
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border w-fit",
                      reg.payment_status === "approved" ? "border-emerald-200 text-emerald-600" : "border-amber-200 text-amber-600"
                    )}>
                      Paid: {reg.payment_status}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4">
                   <div className="flex items-center gap-4 text-sm text-slate-600">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                         <Mail size={16} className="text-slate-400" />
                      </div>
                      <span className="truncate font-medium">{reg?.email || "N/A"}</span>
                   </div>
                   <div className="flex items-center gap-4 text-sm text-slate-600">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                         <Smartphone size={16} className="text-slate-400" />
                      </div>
                      <span className="font-medium">{reg?.whatsapp || "N/A"}</span>
                   </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                   <button
                     onClick={() => handleDeleteRegistration(reg?.id)}
                     className="p-3 bg-slate-50 text-slate-400 rounded-xl border border-slate-100"
                   >
                      <Trash2 size={18} />
                   </button>
                   {reg?.status !== 'rejected' ? (
                     <>
                        <button
                          onClick={() => handleMarkAttendance(reg?.id)}
                          className="px-4 py-3 bg-blue-50 text-blue-600 rounded-xl text-xs font-black uppercase tracking-widest border border-blue-100"
                        >
                          Attend
                        </button>
                        <button
                          onClick={() => handleManualStatusUpdate(reg?.id, 'approved')}
                          disabled={reg?.status === 'approved'}
                          className="flex-1 py-3 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black uppercase tracking-widest border border-emerald-100 disabled:opacity-30"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleManualStatusUpdate(reg?.id, 'rejected')}
                          className="flex-1 py-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-black uppercase tracking-widest border border-rose-100"
                        >
                          Reject
                        </button>
                     </>
                   ) : (
                     <button
                        onClick={() => handleManualStatusUpdate(reg?.id, 'pending')}
                        className="w-full py-3 bg-blue-50 text-blue-600 rounded-xl text-xs font-black uppercase tracking-widest border border-blue-100"
                     >
                        Restore Profile
                     </button>
                   )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
