"use client";

import { useEffect, useState } from "react";
import { adminService } from "@/services/adminService";
import { Users, CheckCircle, Clock, DollarSign, Loader2, ExternalLink, Check, X, ArrowRight, TrendingUp, CreditCard, Mail, RefreshCw, Download, Upload, FileText, ShieldCheck, Trash2 } from "lucide-react";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRef } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { Skeleton } from "@/components/ui/Skeleton";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { SCHEDULE_DISPLAY } from "@/lib/constants";

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCleanupModalOpen, setIsCleanupModalOpen] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await adminService.getDashboardData();
      if (result.error) {
        notify.error("System Notice", result.error);
      }
      setData(result);
    } catch (error: any) {
      notify.error("Data Fetch Failed", error.message || "Unable to sync with dashboard services.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    const tid = notify.loading("Assembling professional student registry...");
    try {
      const registrations = await adminService.getRegistrations();
      const doc = new jsPDF();

      // 1. Professional Header Background
      doc.setFillColor(15, 23, 42); // slate-950
      doc.rect(0, 0, 210, 50, 'F');

      // 2. Load and Add Logo
      try {
          const response = await fetch('/images/faicom.png');
          const blob = await response.blob();
          const base64 = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
          });
          doc.addImage(base64, 'PNG', 15, 12, 12, 12);
      } catch (e) {
          doc.setFillColor(37, 99, 235);
          doc.roundedRect(15, 12, 12, 12, 2, 2, 'F');
      }

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("CODESTART", 32, 21);

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139); // slate-400
      doc.text("PRACTICAL SOFTWARE ENGINEERING ACADEMY", 32, 26);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("OFFICIAL STUDENT REGISTRY", 15, 42);

      doc.setTextColor(148, 163, 184);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`GENERATED ON: ${new Date().toLocaleString().toUpperCase()}`, 130, 42);

      // 3. Registry Table
      const tableData = registrations.map((reg: any) => [
        reg.id,
        reg.full_name.toUpperCase(),
        reg.email,
        reg.whatsapp,
        reg.school.substring(0, 30),
        reg.status.toUpperCase()
      ]);

      autoTable(doc, {
        startY: 55,
        head: [['ID', 'FULL NAME', 'EMAIL IDENTIFIER', 'WHATSAPP', 'INSTITUTION', 'STATUS']],
        body: tableData,
        headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold', fontSize: 7 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        styles: { fontSize: 7, cellPadding: 4, font: 'helvetica' },
        margin: { left: 15, right: 15 },
        columnStyles: {
           0: { cellWidth: 10 },
           5: { fontStyle: 'bold', textColor: [37, 99, 235] }
        }
      });

      // 4. Verification Text
      const finalY = (doc as any).lastAutoTable.finalY + 15;
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("ADMINISTRATIVE VERIFICATION", 15, finalY);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text("This document serves as an official record of students currently registered within the CodeStart Infrastructure.", 15, finalY + 5);
      doc.text("All payment data listed has been cross-referenced with bank and mobile money records.", 15, finalY + 9);

      // 5. Footer
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text("CODESTART INFRASTRUCTURE SYSTEM - CONFIDENTIAL", 15, 285);
        doc.text(`PAGE ${i} OF ${pageCount}`, 180, 285);
      }

      doc.save(`CodeStart_Official_Registry_${new Date().getTime()}.pdf`);
      notify.success("Export Complete", "Registry document has been downloaded.");
      notify.dismiss(tid);
    } catch (error) {
      console.error("PDF Export Error:", error);
      notify.error("Export Failed", "Unable to generate PDF document.");
      notify.dismiss(tid);
    }
  };

  const handleExportJSON = () => {
    window.location.href = '/api/admin/data/export';
    notify.info("Backup Initialized", "Preparing system registry snapshot...");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const tid = notify.loading("Parsing registry backup file...");
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const jsonData = JSON.parse(event.target?.result as string);
          const res = await fetch('/api/admin/data/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jsonData)
          });
          const result = await res.json();
          if (result.success) {
            notify.success("System Restored", result.message);
            fetchData();
          } else {
            notify.error("Import Conflict", result.error);
          }
        } catch (parseError) {
          notify.error("Invalid File", "Backup format is corrupted or invalid.");
        } finally {
          notify.dismiss(tid);
        }
      };
      reader.readAsText(file);
    } catch (error) {
      notify.error("Operation Failed", "Critical error during data restoration.");
      notify.dismiss(tid);
    }
    // Clear input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    const tid = notify.loading("Updating system ledger...");
    try {
      await adminService.updatePaymentStatus(id, status);
      notify.success("Registry Updated", "Application status synchronized.");
      fetchData();
    } catch (error: any) {
      notify.error("Sync Failed", "Unable to update database.");
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

  const handleResendWelcome = async (regId: number) => {
    const tid = notify.loading("Resending onboarding instructions...");
    try {
      await adminService.resendWelcomeEmail(regId);
      notify.success("Email Transmitted", "Student has been notified successfully.");
    } catch (error: any) {
      notify.error("Mail Server Error", "Unable to dispatch welcome email.");
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

  const handleRunMigration = async () => {
    const tid = notify.loading("Upgrading database schema for LMS...");
    try {
      const res = await fetch('/api/admin/setup');
      const result = await res.json();
      if (result.success) {
        notify.success("Migration Success", "LMS infrastructure is now fully active.");
        fetchData();
      } else {
        notify.error("Migration Failed", result.error);
      }
    } catch (e: any) {
      notify.error("Network Error", "Critical failure during system migration.");
    } finally {
      notify.dismiss(tid);
    }
  };

  const stats = data?.stats || { totalApplications: 0, pendingPayments: 0, approvedStudents: 0, totalRevenue: 0 };

  const openScreenshot = (url: string) => {
    if (url.startsWith('data:')) {
      setSelectedImage(url);
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="space-y-8 md:space-y-10">
      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 md:p-10"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl w-full h-full flex items-center justify-center">
            <button
              className="absolute top-0 right-0 m-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
              onClick={() => setSelectedImage(null)}
            >
              <X size={24} />
            </button>
            <img
              src={selectedImage}
              alt="Payment Proof"
              className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

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
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">System Overview</h1>
          <div className="flex items-center gap-2 mt-1">
             <p className="text-slate-500 font-medium text-xs">Monitoring cohort metrics and registration flow.</p>
          </div>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={() => setIsCleanupModalOpen(true)}
            className="px-6 py-3 bg-red-50 text-red-600 border border-red-100 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm"
          >
            Clear All Data
          </button>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex-1 sm:flex-none px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Refresh Data"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <StatCard title="Total Registry" value={loading ? <Skeleton className="h-9 w-12" /> : stats.totalApplications} icon={<Users className="text-blue-600" />} />
        <StatCard title="Pending Review" value={loading ? <Skeleton className="h-9 w-12" /> : stats.pendingPayments} icon={<Clock className="text-yellow-600" />} />
        <StatCard title="Verified Builders" value={loading ? <Skeleton className="h-9 w-12" /> : stats.approvedStudents} icon={<CheckCircle className="text-green-600" />} />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-sm">
          <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
            <h3 className="font-bold text-slate-900 text-sm md:text-base">Recent Verification Requests</h3>
            <Link href="/admin/payments" className="text-xs md:text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
              Ledger <ArrowRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-50/50 border-b border-slate-100 hidden sm:table-header-group">
                <tr>
                  <th className="px-8 py-4 font-bold text-slate-700 uppercase tracking-wider text-[10px]">Student Details</th>
                  <th className="px-8 py-4 font-bold text-slate-700 uppercase tracking-wider text-[10px]">Transaction</th>
                  <th className="px-8 py-4 font-bold text-slate-700 uppercase tracking-wider text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i} className="flex flex-col sm:table-row">
                      <td className="px-8 py-6"><Skeleton className="h-10 w-32" /></td>
                      <td className="px-8 py-6"><Skeleton className="h-10 w-48" /></td>
                      <td className="px-8 py-6 text-right"><Skeleton className="h-10 w-24 ml-auto" /></td>
                    </tr>
                  ))
                ) : (!data?.payments || data.payments.filter((p: any) => p.payment_status !== 'rejected').length === 0) ? (
                  <tr>
                    <td colSpan={3} className="px-8 py-12 text-center text-slate-400 font-medium">No pending payments found.</td>
                  </tr>
                ) : (
                  data.payments.filter((p: any) => p.payment_status !== 'rejected').slice(0, 5).map((pay: any) => (
                    <tr key={pay.registration_id} className="hover:bg-slate-50/50 transition-colors group flex flex-col sm:table-row border-b border-slate-50 sm:border-none">
                      <td className="px-6 sm:px-8 py-4 sm:py-6">
                        <div className="sm:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Student</div>
                        <div className="font-bold text-slate-900">{pay.student_name}</div>
                        <div className="text-xs text-slate-500">{pay.sender_number}</div>
                        <div className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tight">Joined: {new Date(pay.signup_date).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 sm:px-8 py-4 sm:py-6">
                        <div className="sm:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Transaction</div>
                        {pay.transaction_id ? (
                          <div className="flex flex-col gap-2">
                            <div className="font-mono text-[10px] md:text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded inline-block w-fit">{pay.transaction_id}</div>
                            <span className={cn(
                                "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border w-fit",
                                pay.payment_status === "approved" ? "border-green-200 text-green-600 bg-green-50" :
                                pay.payment_status === "rejected" ? "border-red-200 text-red-600 bg-red-50" :
                                "border-yellow-200 text-yellow-600 bg-yellow-50"
                              )}>
                                {pay.payment_status}
                            </span>
                          </div>
                        ) : (
                          <div className="text-amber-500 text-[10px] font-black uppercase tracking-widest bg-amber-50 px-2 py-1 rounded border border-amber-100 inline-block">
                             Awaiting Payment Info
                          </div>
                        )}
                      </td>
                      <td className="px-6 sm:px-8 py-4 sm:py-6">
                        <div className="sm:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Actions</div>
                        <div className="flex justify-start sm:justify-end items-center gap-3">
                          {pay.payment_status === 'pending' && pay.payment_id ? (
                            <>
                              <button onClick={() => handleStatusUpdate(pay.payment_id, 'approved')} className="p-2.5 sm:p-2 text-green-600 hover:bg-green-100 border border-green-100 sm:border-transparent rounded-lg transition-colors bg-white sm:bg-transparent shadow-sm sm:shadow-none" title="Approve & Send Welcome Email"><Check size={18} /></button>
                              <button onClick={() => handleStatusUpdate(pay.payment_id, 'rejected')} className="p-2.5 sm:p-2 text-rose-600 hover:bg-rose-100 border border-rose-100 sm:border-transparent rounded-lg transition-colors bg-white sm:bg-transparent shadow-sm sm:shadow-none" title="Reject Application"><X size={18} /></button>
                            </>
                          ) : pay.payment_status === 'approved' ? (
                             <div className="flex items-center gap-2">
                                {pay.approval_email_sent ? (
                                   <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100" title={`Sent at: ${pay.approval_email_sent_at ? new Date(pay.approval_email_sent_at).toLocaleString() : 'N/A'}`}>
                                      <Mail size={12} /> Sent
                                   </div>
                                ) : (
                                   <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
                                      <Mail size={12} /> Not Sent
                                   </div>
                                )}
                                <button
                                  onClick={() => handleResendWelcome(pay.registration_id)}
                                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                                  title="Resend Onboarding Email"
                                >
                                   <RefreshCw size={12} />
                                </button>
                             </div>
                          ) : !pay.transaction_id ? (
                             <Link href="/admin/registrations" className="text-[10px] font-bold text-blue-600 hover:underline">
                                View Profile
                             </Link>
                          ) : null}
                          {pay.screenshot_url && (
                            <button
                              onClick={() => openScreenshot(pay.screenshot_url)}
                              className="p-2.5 sm:p-2 text-slate-400 hover:bg-slate-200 border border-slate-100 sm:border-transparent rounded-lg transition-colors bg-white sm:bg-transparent shadow-sm sm:shadow-none"
                              title="Open Screenshot"
                            >
                              <ExternalLink size={18} />
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
        </div>

        {data?.payments?.some((p: any) => p.payment_status === 'rejected') && (
           <div className="lg:col-span-2 bg-white border border-slate-200 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-sm mt-8">
             <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-rose-50/30">
               <h3 className="font-bold text-rose-900 text-sm md:text-base flex items-center gap-2">
                  <X size={18} className="text-rose-600" /> Rejected Applications
               </h3>
               <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest bg-rose-100 px-2 py-1 rounded">
                  {data.payments.filter((p: any) => p.payment_status === 'rejected').length} Flagged
               </span>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left text-sm border-collapse">
                 <tbody className="divide-y divide-slate-50">
                   {data.payments.filter((p: any) => p.payment_status === 'rejected').slice(0, 5).map((pay: any) => (
                     <tr key={pay.registration_id} className="hover:bg-rose-50/30 transition-colors group flex flex-col sm:table-row border-b border-slate-50 sm:border-none p-4 sm:p-0 opacity-75 grayscale hover:grayscale-0 transition-all">
                       <td className="px-6 sm:px-8 py-4 sm:py-6 pb-2 sm:pb-6">
                         <div className="sm:hidden text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Student</div>
                         <div className="font-bold text-slate-900">{pay.student_name}</div>
                         <div className="text-xs text-slate-500">{pay.sender_number}</div>
                       </td>
                       <td className="px-6 sm:px-8 py-4 sm:py-6 pb-4 sm:pb-6">
                         <div className="sm:hidden text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Ref ID</div>
                         <div className="font-mono text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded inline-block mb-2 w-fit">{pay.transaction_id}</div>
                         <div>
                           <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-red-200 text-red-600 bg-red-50 w-fit">
                             {pay.payment_status}
                           </span>
                         </div>
                       </td>
                       <td className="px-6 sm:px-8 py-4 sm:py-6 text-left sm:text-right">
                         <div className="sm:hidden text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2">Actions</div>
                         <div className="flex justify-start sm:justify-end items-center gap-3">
                           {pay.payment_id && (
                             <button
                               onClick={() => handleStatusUpdate(pay.payment_id, 'pending')}
                               className="p-2.5 sm:p-2 text-blue-600 hover:bg-blue-50 border border-blue-100 sm:border-transparent rounded-lg transition-colors bg-white sm:bg-transparent shadow-sm sm:shadow-none"
                               title="Return to Pending"
                             >
                                <RefreshCw size={18} />
                             </button>
                           )}
                           <button
                             onClick={() => handleDeleteRegistration(pay.registration_id)}
                             className="p-2.5 sm:p-2 text-rose-600 hover:bg-rose-100 border border-rose-100 sm:border-transparent rounded-lg transition-colors bg-white sm:bg-transparent shadow-sm sm:shadow-none"
                             title="Permanently Delete"
                           >
                             <Trash2 size={18} />
                           </button>
                           {pay.screenshot_url && (
                             <button
                               onClick={() => openScreenshot(pay.screenshot_url)}
                               className="p-2.5 sm:p-2 text-slate-400 hover:bg-slate-200 border border-slate-100 sm:border-transparent rounded-lg transition-colors bg-white sm:bg-transparent shadow-sm sm:shadow-none"
                             >
                               <ExternalLink size={18} />
                             </button>
                           )}
                         </div>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>
        )}

        <div className="space-y-6">
           <div className="bg-slate-900 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-[0.05]">
                 <TrendingUp size={100} />
              </div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 relative z-10">Enrollment Progress</h4>
              <div className="space-y-3 relative z-10">
                 <div className="flex justify-between items-end">
                    <span className="text-3xl font-black italic tracking-tighter">{loading ? "..." : Math.round((stats.approvedStudents / 25) * 100)}%</span>
                    <span className="text-[10px] font-bold text-blue-400 uppercase">Target: 25 Seats</span>
                 </div>
                 <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                       className="h-full bg-blue-500 transition-all duration-1000 ease-out"
                       style={{ width: `${loading ? 0 : (stats.approvedStudents / 25) * 100}%` }}
                    />
                 </div>
                 <p className="text-[11px] text-slate-400 font-medium leading-relaxed">The cohort is currently being filled. All approved payments are tracked here.</p>
              </div>
           </div>

           <div className="bg-white border border-slate-200 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-sm">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Official Schedule</h4>
              <div className="space-y-4 mb-6">
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                    <div className="space-y-1">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Training Start</p>
                       <p className="text-xs font-bold text-slate-900">{SCHEDULE_DISPLAY.trainingStart}</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Registration Deadline</p>
                       <p className="text-xs font-bold text-slate-900">{SCHEDULE_DISPLAY.registrationDeadline}</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mode</p>
                       <p className="text-xs font-bold text-slate-900">{SCHEDULE_DISPLAY.mode}</p>
                    </div>
                 </div>
              </div>

              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Management Tools</h4>
              <div className="grid grid-cols-1 gap-3">
                 <Link href="/admin/registrations" className="flex items-center justify-center gap-2 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 hover:bg-slate-100 transition-all active:scale-[0.98]">
                    <Users size={16} /> Registry
                 </Link>
                 <Link href="/admin/payments" className="flex items-center justify-center gap-2 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 hover:bg-slate-100 transition-all active:scale-[0.98]">
                    <CreditCard size={16} /> Financial Ledger
                 </Link>
                 <div className="h-px bg-slate-100 my-2" />
                 <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={handleExportPDF}
                      className="flex items-center justify-center gap-2 py-4 bg-slate-900 text-white border border-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:border-blue-600 transition-all active:scale-[0.98]"
                    >
                       <FileText size={14} /> Export Registry (PDF)
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={handleExportJSON}
                          className="flex items-center justify-center gap-2 py-3 bg-blue-50 border border-blue-100 rounded-2xl text-[9px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-600 hover:text-white transition-all active:scale-[0.98]"
                        >
                           <Download size={14} /> Backup
                        </button>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center justify-center gap-2 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-[9px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all active:scale-[0.98]"
                        >
                           <Upload size={14} /> Restore
                        </button>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".json"
                      onChange={handleImport}
                    />
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: any) {
  return (
    <div className="p-8 bg-white/60 backdrop-blur-xl border border-slate-200 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-blue-50/50 hover:border-blue-500 hover:-translate-y-1 transition-all duration-300 group overflow-hidden relative">
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-full -mr-12 -mt-12 blur-2xl group-hover:scale-150 transition-transform duration-700" />
      <div className="flex items-center gap-4 mb-6 relative z-10">
        <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 group-hover:shadow-lg group-hover:shadow-blue-100 transition-all duration-500">
          {icon}
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</p>
      </div>
      <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter relative z-10">{value || 0}</h3>
    </div>
  );
}
