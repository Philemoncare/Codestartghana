"use client";

import { useState } from "react";
import { Shield, Key, Mail, User, Bell, Save, Loader2, LogOut, Smartphone, Github, Linkedin } from "lucide-react";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";

import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { adminService } from "@/services/adminService";
import { useEffect } from "react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [alertPrefs, setAlertPrefs] = useState({
    critical: true,
    warning: true,
    info: true,
    email: true,
    whatsapp: false,
    whatsappNumber: ""
  });
  const router = useRouter();

  useEffect(() => {
    if (activeTab === "notifications") {
      loadAlertPrefs();
    }
  }, [activeTab]);

  const loadAlertPrefs = async () => {
    try {
      const res = await adminService.getSetting('alert_preferences');
      if (res.value) {
        setAlertPrefs(JSON.parse(res.value));
      }
    } catch (error) {
      console.error("Failed to load alert preferences", error);
    }
  };

  const handleSaveAlertPrefs = async () => {
    setLoading(true);
    const alertToast = notify.loading("Saving alert preferences...");
    try {
      await adminService.updateSetting('alert_preferences', JSON.stringify(alertPrefs));
      notify.success("Preferences saved", "System monitoring rules have been updated.");
    } catch (error: any) {
      notify.error("Save failed", error.message || "Unable to save alert configuration.");
    } finally {
      setLoading(false);
      notify.dismiss(alertToast);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      notify.warning("Passwords Mismatch", "Please ensure both entries are identical.");
      return;
    }

    if (newPassword.length < 8) {
      notify.warning("Security Risk", "For maximum protection, use at least 8 characters.");
      return;
    }

    setLoading(true);
    const securityToast = notify.loading("Updating security protocol...");
    try {
      await apiFetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      notify.success("Security Updated", "Access keys refreshed. Re-authenticating...");
      setTimeout(() => {
        router.push("/admin/login");
      }, 2000);
    } catch (error: any) {
      notify.error("Update Failed", error.message || "Unable to update security credentials.");
    } finally {
      setLoading(false);
      notify.dismiss(securityToast);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    setLoading(true);
    const profileToast = notify.loading("Saving profile changes...");
    try {
      await apiFetch('/api/admin/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      notify.success("Profile Updated", "Your administrative details have been synchronized.");
    } catch (error: any) {
      notify.error("Update Failed", "Failed to synchronize profile information.");
    } finally {
      setLoading(false);
      notify.dismiss(profileToast);
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
                      <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mt-1">Founder & System Administrator</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <SettingsInput name="fullName" label="Full Name" defaultValue="Philemon Melabah" icon={<User size={16} />} />
                   <SettingsInput name="email" label="Official Email" defaultValue="favmoms440@gmail.com" icon={<Mail size={16} />} />
                   <SettingsInput name="phone" label="Phone Number" defaultValue="+233 533 680 823" icon={<Smartphone size={16} />} />
                   <SettingsInput label="System Role" defaultValue="Owner / Master Admin" icon={<Shield size={16} />} disabled />
                </div>

                <div className="pt-4 space-y-4">
                   <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px] mb-4">Ownership Links</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <SettingsInput name="github" label="GitHub Profile" defaultValue="https://github.com/Philemoncare" icon={<Github size={16} />} />
                      <SettingsInput name="linkedin" label="LinkedIn Profile" defaultValue="https://www.linkedin.com/in/philemon-melabah-ba0148317" icon={<Linkedin size={16} />} />
                   </div>
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
             <div className="space-y-10 animate-fade-in">
                <div className="space-y-6">
                   <div className="flex items-center justify-between">
                      <div>
                         <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Alert Configuration</h3>
                         <p className="text-[11px] text-slate-500 font-medium mt-1">Select which system events should trigger administrative alerts.</p>
                      </div>
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest rounded-md border border-blue-100">Live Monitoring Active</span>
                   </div>

                   <div className="space-y-3">
                      <PreferenceToggle
                        title="Critical Security Events"
                        description="Unauthorized access attempts, failed logins, and system errors."
                        checked={alertPrefs.critical}
                        onChange={(val: boolean) => setAlertPrefs({ ...alertPrefs, critical: val })}
                      />
                      <PreferenceToggle
                        title="Important Activity"
                        description="New registrations, payment submissions, and status changes."
                        checked={alertPrefs.warning}
                        onChange={(val: boolean) => setAlertPrefs({ ...alertPrefs, warning: val })}
                      />
                      <PreferenceToggle
                        title="Informational Logs"
                        description="Admin login events and successful system routine actions."
                        checked={alertPrefs.info}
                        onChange={(val: boolean) => setAlertPrefs({ ...alertPrefs, info: val })}
                      />
                   </div>
                </div>

                <div className="space-y-6">
                   <div>
                      <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Notification Channels</h3>
                      <p className="text-[11px] text-slate-500 font-medium mt-1">Configure how you receive alerts outside the dashboard.</p>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ChannelCard
                        icon={<Mail className="text-blue-600" size={20} />}
                        title="Email Notifications"
                        status={alertPrefs.email ? "Active" : "Disabled"}
                        description="Alerts sent to favmoms440@gmail.com"
                        checked={alertPrefs.email}
                        onToggle={() => setAlertPrefs({ ...alertPrefs, email: !alertPrefs.email })}
                      />
                      <div className="space-y-4">
                        <ChannelCard
                          icon={<Smartphone className="text-emerald-600" size={20} />}
                          title="WhatsApp Bridge"
                          status={alertPrefs.whatsapp ? "Active" : "Ready"}
                          description="Direct alerts to your registered number"
                          checked={alertPrefs.whatsapp}
                          onToggle={() => setAlertPrefs({ ...alertPrefs, whatsapp: !alertPrefs.whatsapp })}
                        />
                        {alertPrefs.whatsapp && (
                          <div className="animate-in slide-in-from-top-2 duration-300">
                            <SettingsInput
                              label="WhatsApp Number"
                              placeholder="+233..."
                              icon={<Smartphone size={16} />}
                              value={alertPrefs.whatsappNumber}
                              onChange={(e: any) => setAlertPrefs({ ...alertPrefs, whatsappNumber: e.target.value })}
                            />
                          </div>
                        )}
                      </div>
                   </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                   <button
                     onClick={handleSaveAlertPrefs}
                     disabled={loading}
                     className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-3 transition-all hover:bg-black active:scale-95 shadow-xl disabled:opacity-50"
                   >
                      {loading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Save Preferences</>}
                   </button>
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

const PreferenceToggle = ({ title, description, checked, onChange }: any) => {
  return (
    <div className="flex items-center justify-between p-5 bg-slate-50 border border-slate-200 rounded-2xl transition-all hover:border-slate-300">
       <div className="space-y-1">
          <p className="text-sm font-bold text-slate-900">{title}</p>
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed max-w-md">{description}</p>
       </div>
       <button
         type="button"
         onClick={() => onChange(!checked)}
         className={cn(
           "w-12 h-6 rounded-full transition-all relative",
           checked ? "bg-blue-600" : "bg-slate-300"
         )}
       >
          <div className={cn(
            "absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
            checked ? "left-7" : "left-1"
          )} />
       </button>
    </div>
  );
};

const ChannelCard = ({ icon, title, status, description, disabled = false, checked, onToggle }: any) => (
  <div className={cn(
    "p-6 border rounded-2xl transition-all space-y-4 cursor-pointer",
    disabled ? "bg-slate-50/50 border-slate-100 opacity-60 cursor-not-allowed" : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md",
    !disabled && checked && "border-blue-500 bg-blue-50/10"
  )}
  onClick={() => !disabled && onToggle && onToggle()}
  >
    <div className="flex justify-between items-start">
       <div className={cn("p-3 rounded-xl bg-white border border-slate-100 shadow-sm", disabled && "grayscale")}>
          {icon}
       </div>
       <span className={cn(
         "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
         status === "Active" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-100 text-slate-500 border border-slate-200"
       )}>
          {status}
       </span>
    </div>
    <div>
       <p className="text-xs font-bold text-slate-900">{title}</p>
       <p className="text-[10px] text-slate-500 font-medium mt-1 leading-relaxed">{description}</p>
    </div>
  </div>
);

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

const SettingsInput = ({ label, name, defaultValue, value, onChange, type = "text", placeholder, icon, disabled = false, required = false }: any) => (
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
         value={value}
         onChange={onChange}
         placeholder={placeholder}
         className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
       />
    </div>
  </div>
);
