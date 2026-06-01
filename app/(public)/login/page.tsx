"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { notify } from "@/lib/notify";
import { Mail, Loader2, ArrowRight, Lock, Eye, EyeOff } from "lucide-react";
import { studentService } from "@/services/studentService";
import Image from "next/image";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (!email.trim() || !password) {
      notify.warning("Missing Info", "Please enter both your email and password.");
      setLoading(false);
      return;
    }

    try {
      await studentService.login(email.trim(), password);
      notify.success("Login Successful", "Welcome back to your learning dashboard.");
      router.push("/student/dashboard");
    } catch (error: any) {
      notify.error("Login Failed", error.message || "We couldn't sign you in. Please check your email and password and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#2563eb 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />

      <div className="w-full max-w-[440px] relative z-10 pt-20">
        <div className="flex flex-col items-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <div className="relative w-20 h-20 mb-6">
              <Image src="/images/faicom.png" alt="CodeStart Logo" fill className="object-contain" priority />
           </div>
           <div className="text-center space-y-2">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Portal Access</h1>
              <p className="text-slate-500 font-medium text-sm">Verify your credentials to enter the workspace.</p>
           </div>
        </div>

        <div className="bg-white border border-slate-200 p-8 md:p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Registered Email Address</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-6 py-4 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Security Password</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-12 py-4 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="flex justify-end px-1">
                 <Link href="/forgot-password" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">
                    Forgot Password?
                 </Link>
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="group w-full py-5 bg-slate-900 text-white hover:bg-blue-600 disabled:opacity-50 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl shadow-slate-200"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <>Verify & Enter <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-50 text-center space-y-4">
             <p className="text-xs text-slate-400 font-bold">New here? <a href="/register" className="text-blue-600 hover:underline">Apply for 2026 Cohort</a></p>
             <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 text-center">
                <p className="text-[10px] text-blue-600 font-bold leading-relaxed">Admin approval is required for all new accounts.</p>
             </div>
          </div>
        </div>
      </div>
    </main>
  );
}
