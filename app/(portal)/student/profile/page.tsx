"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { studentService } from "@/services/studentService";
import {
  User, Mail, Phone, School, ShieldCheck,
  Save, Loader2, Camera, Lock, Eye, EyeOff, Calendar, Award, Zap, ChevronRight
} from "lucide-react";
import { notify } from "@/lib/notify";
import { Skeleton } from "@/components/ui/Skeleton";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [student, setStudent] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    whatsapp: "",
    school: "",
    current_password: "",
    new_password: "",
    confirm_password: ""
  });

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await studentService.getProfile();
      if (!data || data.error) throw new Error(data.error || "Failed to load profile");
      setStudent(data);
      setFormData(prev => ({
        ...prev,
        whatsapp: data.whatsapp || "",
        school: data.school || ""
      }));
    } catch (err: any) {
      console.error("Profile Fetch Error:", err);
      setError(err.message || "Failed to load profile data.");
      notify.error("Sync Error", "We couldn't retrieve your profile information.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return notify.error("Image too large (max 2MB)");

    setUploadingPhoto(true);
    try {
      const res = await studentService.updateProfilePhoto(file);
      if (res.success) {
        notify.success("Profile photo updated");
        setStudent((prev: any) => ({ ...prev, profile_photo_url: res.url }));
      }
    } catch (err) {
      notify.error("Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.new_password && formData.new_password !== formData.confirm_password) {
      return notify.warning("Security Conflict", "New passwords do not match.");
    }

    setSubmitting(true);
    const tid = notify.loading("Updating profile details...");
    try {
      // Note: full_name is locked in UI and shouldn't be sent to API if it's meant to be immutable
      // But for completeness, we just send what's editable
      await studentService.updateProfile(formData);
      notify.success("Identity Updated", "Your profile details have been synchronized.");
      setFormData(prev => ({ ...prev, current_password: "", new_password: "", confirm_password: "" }));
      fetchProfile();
    } catch (error: any) {
      notify.error("Update Failed", error.message || "Unable to save profile changes.");
    } finally {
      setSubmitting(false);
      notify.dismiss(tid);
    }
  };

  if (loading) return <ProfileSkeleton />;

  if (error || !student) return <ErrorState onRetry={fetchProfile} />;

  return (
    <main className="min-h-screen bg-[#FBFBFE] pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 md:pt-10 space-y-6 md:space-y-8 animate-in fade-in duration-500">

        <div className="flex items-center justify-between">
           <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Account Profile</h1>
           <Link href="/student/dashboard" className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-slate-900 flex items-center gap-1">
              Dashboard <ChevronRight size={14} />
           </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
           {/* Compact Profile Card */}
           <section className="bg-white border border-slate-200 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-8 text-center shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-24 bg-slate-900" />
              <div className="relative pt-6">
                <div className="relative w-32 h-32 mx-auto mb-6 group/avatar">
                   <div className="w-full h-full rounded-full bg-slate-100 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center text-slate-400 relative">
                      {student.profile_photo_url ? (
                        <img src={student.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl font-black text-slate-300">{student.full_name?.charAt(0)}</span>
                      )}
                      {uploadingPhoto && (
                         <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white backdrop-blur-sm">
                            <Loader2 size={24} className="animate-spin" />
                         </div>
                      )}
                   </div>
                   <button
                     onClick={() => fileInputRef.current?.click()}
                     className="absolute bottom-0 right-0 p-3 bg-blue-600 text-white rounded-full border-2 border-white shadow-lg hover:bg-slate-900 active:scale-90 transition-all z-10"
                   >
                      <Camera size={18} />
                   </button>
                   <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                </div>

                <div className="space-y-1">
                   <h2 className="text-2xl font-black text-slate-900 leading-tight">{student.full_name}</h2>
                   <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                      <ShieldCheck size={10} /> Verified Student
                   </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-1 gap-4 text-left">
                  <CompactInfoItem label="Student ID" value={`#CS-${student.id?.toString().padStart(4, '0')}`} icon={<Zap size={12} />} />
                  <CompactInfoItem label="Learning Level" value={student.experience} icon={<Award size={12} />} />
                  <CompactInfoItem label="Official Email" value={student.email} icon={<Mail size={12} />} />
                  <CompactInfoItem label="Registration" value={new Date(student.created_at).toLocaleDateString()} icon={<Calendar size={12} />} />
              </div>
           </section>

           {/* Tabs and Form */}
           <div className="lg:col-span-2 space-y-6">
              <div className="flex p-1 bg-slate-100 rounded-2xl w-fit">
                 {["general", "security"].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        activeTab === tab ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
                      )}
                    >
                       {tab} Information
                    </button>
                 ))}
              </div>

              <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
                 <div className="p-6 md:p-10 space-y-8">
                    {activeTab === "general" ? (
                       <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                             <User size={20} className="text-blue-600" /> General Profile
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-2 opacity-60">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Legal Name (Locked)</label>
                                <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-500 flex items-center justify-between cursor-not-allowed">
                                   {student.full_name} <Lock size={14} />
                                </div>
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">WhatsApp Number</label>
                                <input
                                  required
                                  value={formData.whatsapp}
                                  onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                                />
                             </div>
                             <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Current Institution / Occupation</label>
                                <input
                                  required
                                  value={formData.school}
                                  onChange={e => setFormData({...formData, school: e.target.value})}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                                />
                             </div>
                          </div>
                       </div>
                    ) : (
                       <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                             <Lock size={20} className="text-blue-600" /> Security Credentials
                          </h3>
                          <div className="space-y-6">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Current Password</label>
                                <div className="relative">
                                  <input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.current_password}
                                    onChange={e => setFormData({...formData, current_password: e.target.value})}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400"
                                  >
                                     {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                  </button>
                                </div>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">New Password</label>
                                   <input
                                     type="password"
                                     value={formData.new_password}
                                     onChange={e => setFormData({...formData, new_password: e.target.value})}
                                     placeholder="Min. 8 characters"
                                     className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                                   />
                                </div>
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Confirm New Password</label>
                                   <input
                                     type="password"
                                     value={formData.confirm_password}
                                     onChange={e => setFormData({...formData, confirm_password: e.target.value})}
                                     className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                                   />
                                </div>
                             </div>
                          </div>
                       </div>
                    )}
                 </div>

                 <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-blue-600 shadow-xl transition-all disabled:opacity-50 active:scale-95"
                    >
                       {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                       Synchronize Profile
                    </button>
                 </div>
              </form>
           </div>
        </div>
      </div>
    </main>
  );
}

function CompactInfoItem({ label, value, icon }: any) {
  return (
    <div className="flex items-center gap-4">
       <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
          {icon}
       </div>
       <div className="min-w-0">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
          <p className="text-xs font-bold text-slate-700 truncate">{value}</p>
       </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-6 pt-10 space-y-10">
       <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-32 rounded-full" />
       </div>
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <Skeleton className="h-[400px] rounded-[2.5rem]" />
          <div className="lg:col-span-2">
             <Skeleton className="h-[600px] rounded-[2.5rem]" />
          </div>
       </div>
    </div>
  );
}

function ErrorState({ onRetry }: any) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
       <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center border border-rose-100">
          <User size={40} />
       </div>
       <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Sync failure</h2>
          <p className="text-slate-500 text-sm font-medium max-w-sm">We couldn't connect to your profile. Please check your network.</p>
       </div>
       <button onClick={onRetry} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">Retry Sync</button>
    </div>
  );
}
