"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/notify";
import { Lock, Loader2, ArrowLeft, CheckCircle2, ShieldCheck, Eye, EyeOff, RefreshCw, Inbox, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const savedEmail = sessionStorage.getItem('reset_email');
    if (savedEmail) {
      setEmail(savedEmail);
    } else {
      router.push("/forgot-password");
    }
  }, [router]);

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const fullCode = code.join("");

  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return notify.error("Passwords do not match.");
    }

    if (password.length < 6) {
      return notify.error("Password must be at least 6 characters.");
    }

    setLoading(true);
    try {
      await apiFetch('/api/student/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: fullCode, newPassword: password }),
      });

      notify.success("Access Restored", "Your security credentials have been updated.");

      sessionStorage.removeItem('reset_email');
      router.push("/login");
    } catch (error: any) {
      notify.error(error.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) return;
    setResending(true);
    try {
      await apiFetch('/api/student/auth/reset-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      notify.success("Code Resent", "A new security code has been sent to " + email);
    } catch (error: any) {
      notify.error(error.message || "Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-[#fafbfc] relative overflow-hidden">
      {/* Premium Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="w-full max-w-[420px] relative z-10 py-10">
        <div className="flex flex-col items-center mb-8">
           <div className="relative w-12 h-12 mb-6 grayscale opacity-80">
              <Image src="/images/faicom.png" alt="Logo" fill className="object-contain" priority />
           </div>
           <div className="text-center space-y-1">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Security Verification</h1>
              <p className="text-slate-500 text-xs font-medium">Reset code sent to <span className="text-slate-900 font-bold">{email}</span></p>
           </div>
        </div>

        <div className="bg-white border border-slate-200/60 p-8 rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)]">
          <form onSubmit={handleReset} className="space-y-6">

            {/* Elegant OTP Input */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verification Code</label>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resending}
                  className="text-[10px] font-bold text-blue-600 hover:text-slate-900 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {resending ? <Loader2 className="animate-spin" size={10} /> : <RefreshCw size={10} />}
                  Resend
                </button>
              </div>

              <div className="flex gap-2 justify-between">
                {code.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-12 h-14 bg-slate-50 border border-slate-200 rounded-xl text-center text-xl font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all"
                    placeholder="-"
                  />
                ))}
              </div>
            </div>

            <div className="h-px bg-slate-100/60 mx-2" />

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-12 py-3.5 text-sm focus:border-blue-500 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <CheckCircle2 size={16} />
                  </div>
                  <input
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-6 py-3.5 text-sm focus:border-blue-500 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300"
                  />
                </div>
              </div>
            </div>

            <button
              disabled={loading || fullCode.length < 6 || !password}
              type="submit"
              className="w-full py-4 bg-slate-900 text-white hover:bg-blue-600 disabled:bg-slate-200 disabled:text-slate-400 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <>Update Password <ChevronRight size={16} /></>}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-50 flex flex-col gap-3">
             <Link href="/forgot-password" disable-prefetch className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hover:text-blue-600 transition-colors text-center">
                ← Use a different email
             </Link>
          </div>
        </div>

        {/* Subtle Help Info */}
        <div className="mt-8 px-4 flex gap-4 items-center justify-center opacity-60">
           <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <ShieldCheck size={12} /> Secure
           </div>
           <div className="w-1 h-1 bg-slate-300 rounded-full" />
           <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <Inbox size={12} /> Check Spam
           </div>
        </div>
      </div>
    </main>
  );
}
