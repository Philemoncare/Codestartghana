"use client";

import { useEffect, useState, useCallback } from "react";
import { studentService } from "@/services/studentService";
import {
  User, Mail, Phone, School, ShieldCheck,
  Save, Loader2, Camera, Lock, Eye, EyeOff, Calendar, LayoutGrid
} from "lucide-react";
import { notify } from "@/lib/notify";
import { Skeleton } from "@/components/ui/Skeleton";
import Image from "next/image";
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

  // Form State
  const [formData, setFormData] = useState({
    full_name: "",
    whatsapp: "",
    school: "",
    current_password: "",
    new_password: "",
    confirm_password: "",
    profile_photo_url: ""
  });

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await studentService.getProfile();
      if (!data || data.error) {
        throw new Error(data.error || "Failed to load profile");
      }
      setStudent(data);
      setFormData(prev => ({
        ...prev,
        full_name: data.full_name || "",
        whatsapp: data.whatsapp || "",
        school: data.school || "",
        profile_photo_url: data.profile_photo_url || ""
      }));
    } catch (err: any) {
      console.error("Profile Fetch Error:", err);
      setError(err.message || "Failed to load profile data.");
      notify.error("Sync Error", "We couldn't retrieve your profile information.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      notify.warning("Image Too Large", "Please keep it under 1MB.");
      return;
    }

    setUploadingPhoto(true);
    const tid = notify.loading("Uploading profile photo...");

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        try {
          await studentService.updateProfile({ ...formData, profile_photo_url: base64 });
          setFormData(prev => ({ ...prev, profile_photo_url: base64 }));
          notify.success("Profile Updated", "Your profile photo has been synchronized.");
          fetchProfile();
        } catch (error) {
          notify.error("Update Failed", "Failed to save the new photo.");
        } finally {
          setUploadingPhoto(false);
          notify.dismiss(tid);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      notify.error("Process Fault", "An error occurred while reading the file.");
      setUploadingPhoto(false);
      notify.dismiss(tid);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.new_password && formData.new_password !== formData.confirm_password) {
      return notify.warning("Security Conflict", "New passwords do not match.");
    }

    setSubmitting(true);
    const tid = notify.loading("Updating profile details...");

    try {
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

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-6 space-y-10">
        <div className="flex justify-between items-center">
           <Skeleton className="h-10 w-48 rounded-xl" />
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

  if (error || !student) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
         <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mb-6 border border-rose-100 shadow-sm">
            <User size={40} />
         </div>
         <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase mb-2">Sync Error</h1>
         <p className="text-slate-500 font-medium max-w-md mb-8">
           We encountered a problem while retrieving your engineering profile.
         </p>
         <button
           onClick={() => fetchProfile()}
           className="px-8 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
         >
            Retry Synchronization
         </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 pb-24 space-y-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
         <h1 className="text-4xl font-black text-slate-900 tracking-tight">Account Settings</h1>
         <Link href="/student/dashboard" className="text-xs font-black uppercase tracking-widest text-blue-600 hover:underline">Back to Learning Space</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Profile Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 text-center space-y-6 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-24 bg-slate-900" />
            <div className="relative pt-6">
              <div className="relative w-32 h-32 mx-auto mb-4 group">
                 <div className="w-full h-full rounded-[2rem] bg-slate-200 border-4 border-white overflow-hidden flex items-center justify-center text-slate-400 relative">
                    {formData.profile_photo_url ? (
                      <Image src={formData.profile_photo_url} alt="Profile" fill className="object-cover" />
                    ) : (
                      <User size={48} />
                    )}
                    {uploadingPhoto && (
                       <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                          <Loader2 size={24} className="animate-spin" />
                       </div>
                    )}
                 </div>
                 <label className="absolute bottom-0 right-0 p-2.5 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-slate-900 transition-all cursor-pointer">
                    <Camera size={16} />
                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
                 </label>
              </div>
              <h2 className="text-2xl font-black text-slate-900">{student.full_name}</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Engineering Student</p>
            </div>

            <div className="pt-6 border-t border-slate-50 flex flex-col gap-3">
               <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                  <Mail size={16} className="text-slate-400" />
                  <span>{student.email}</span>
               </div>
               <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                  <Phone size={16} className="text-slate-400" />
                  <span>{student.whatsapp}</span>
               </div>
               <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                  <School size={16} className="text-slate-400" />
                  <span className="truncate">{student.school || "No School Added"}</span>
               </div>
               <div className="flex items-center gap-3 text-sm font-bold text-slate-600 border-t border-slate-50 pt-3">
                  <Calendar size={16} className="text-slate-400" />
                  <span>Enrolled: {new Date(student.created_at).toLocaleDateString()}</span>
               </div>
               <div className="flex items-center gap-3 text-sm font-bold text-blue-600">
                  <ShieldCheck size={16} className="text-blue-400" />
                  <span>2026 Cohort</span>
               </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest">
               <ShieldCheck size={12} /> Account Verified
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2 space-y-8">
           <div className="flex items-center gap-2 mb-4 bg-slate-100 p-1.5 rounded-2xl w-fit">
              <button
                onClick={() => setActiveTab("general")}
                className={cn(
                  "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  activeTab === "general" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
                )}
              >
                 General Info
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={cn(
                  "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  activeTab === "security" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
                )}
              >
                 Security & Password
              </button>
           </div>

           <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
              <div className="p-8 md:p-10">
                 {activeTab === "general" ? (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                       <div className="space-y-6">
                          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                             <User size={20} className="text-blue-600" /> Profile Information
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Legal Name</label>
                                <input
                                  value={formData.full_name}
                                  onChange={e => setFormData({...formData, full_name: e.target.value})}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                                />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">WhatsApp Number</label>
                                <input
                                  value={formData.whatsapp}
                                  onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                                />
                             </div>
                             <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Educational Institution</label>
                                <input
                                  value={formData.school}
                                  onChange={e => setFormData({...formData, school: e.target.value})}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                                />
                             </div>
                          </div>
                       </div>
                    </div>
                 ) : (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                       <div className="space-y-6">
                          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                             <Lock size={20} className="text-blue-600" /> Security & Access
                          </h3>
                          <div className="space-y-6">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Current Password (Required for changes)</label>
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
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
                    </div>
                 )}
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
                 <button
                   type="submit"
                   disabled={submitting}
                   className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-slate-900 shadow-xl shadow-blue-100 transition-all disabled:opacity-50"
                 >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {activeTab === "security" ? "Update Security Key" : "Apply Account Changes"}
                 </button>
              </div>
           </form>
        </div>
      </div>
    </div>
  );
}
