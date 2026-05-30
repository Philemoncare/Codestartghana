"use client";

import { useState } from "react";
import { Shield, Key, Mail, User, Bell, Save, Loader2, LogOut, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const router = useRouter();

  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      toast.error("New keys do not match.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Security key must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await apiFetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      toast.success("Security key updated. Please log in again.");
      setTimeout(() => {
        router.push("/admin/login");
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || "Failed to update security key.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    setLoading(true);
    try {
      await apiFetch('/api/admin/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      toast.success("Profile information updated.");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Settings</h1>
        <p className="text-slate-500 font-medium">Manage your administrative profile and security protocols.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Navigation */}
        <aside className="w-full md:w-64 space-y-2">
           <TabButton
             active={activeTab === "profile"}
             onClick={() => setActiveTab("profile")}
             icon={<User size={18} />}
             label="Account Profile"
           />
           <TabButton
             active={activeTab === "security"}
             onClick={() => setActiveTab("security")}
             icon={<Shield size={18} />}
             label="Security & Access"
           />
           <TabButton
             active={activeTab === "notifications"}
             onClick={() => setActiveTab("notifications")}
             icon={<Bell size={18} />}
             label="System Alerts"
           />
        </aside>

        {/* Settings Content */}
        <div className="flex-1 bg-white border border-slate-200 rounded-[2rem] p-8 md:p-10 shadow-sm">
          {activeTab === "profile" && (
            <form onSubmit={handleUpdateProfile} className="space-y-8 animate-fade-in">
              <div className="space-y-6">
                <div className="flex items-center gap-6 pb-8 border-b border-slate-100">
                   <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-xl">P</div>
                   <div>
                      <p className="font-black text-slate-900 text-xl tracking-tight">Philemon Melabah</p>
                      <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mt-1">Lead System Administrator</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <SettingsInput name="fullName" label="Full Name" defaultValue="Philemon Melabah" icon={<User size={16} />} />
                   <SettingsInput name="email" label="Official Email" defaultValue="favmoms440@gmail.com" icon={<Mail size={16} />} />
                   <SettingsInput name="phone" label="Phone Number" defaultValue="+233 533 680 823" icon={<Smartphone size={16} />} />
                   <SettingsInput label="System Role" defaultValue="Master Admin" icon={<Shield size={16} />} disabled />
                </div>
              </div>

              <div className="pt-4">
                 <button disabled={loading} className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-3 transition-all hover:bg-black active:scale-95 shadow-xl disabled:opacity-50">
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Update Profile</>}
                 </button>
              </div>
            </form>
          )}

          {activeTab === "security" && (
             <form onSubmit={handleUpdatePassword} className="space-y-8 animate-fade-in">
                <div className="space-y-6">
                   <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-6">Credential Management</h3>
                   <SettingsInput required name="currentPassword" label="Current Security Key" type="password" placeholder="••••••••" icon={<Key size={16} />} />
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <SettingsInput required name="newPassword" label="New Security Key" type="password" placeholder="••••••••" icon={<Key size={16} />} />
                      <SettingsInput required name="confirmPassword" label="Confirm New Key" type="password" placeholder="••••••••" icon={<Key size={16} />} />
                   </div>
                </div>

                <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-2xl">
                   <p className="text-[11px] font-bold text-blue-700 uppercase tracking-widest mb-2 flex items-center gap-2">
                     <Shield size={14} /> Security Protocol
                   </p>
                   <p className="text-xs text-blue-600 leading-relaxed font-medium">Updating your security key will invalidate all active sessions. You will be required to log in again on all devices.</p>
                </div>

                <div className="pt-4">
                  <button disabled={loading} className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-3 transition-all hover:bg-blue-700 active:scale-95 shadow-xl disabled:opacity-50">
                      {loading ? <Loader2 className="animate-spin" size={18} /> : <><Key size={18} /> Change Security Key</>}
                  </button>
                </div>
             </form>
          )}

          {activeTab === "notifications" && (
             <div className="py-20 text-center space-y-4 animate-fade-in">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mx-auto">
                   <Bell size={32} />
                </div>
                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Alert preferences coming soon</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3.5 px-6 py-4 rounded-2xl font-bold text-sm transition-all",
      active ? "bg-white border border-slate-200 text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
    )}
  >
    <span className={cn("shrink-0", active ? "text-blue-600" : "text-slate-400")}>{icon}</span>
    {label}
  </button>
);

const SettingsInput = ({ label, name, defaultValue, type = "text", placeholder, icon, disabled = false, required = false }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative group">
       <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
       <input
         name={name}
         required={required}
         type={type}
         disabled={disabled}
         defaultValue={defaultValue}
         placeholder={placeholder}
         className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
       />
    </div>
  </div>
);
