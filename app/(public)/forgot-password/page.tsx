"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/notify";
import { Mail, Loader2, ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { apiFetch } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleRequestReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      await apiFetch('/api/student/auth/reset-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      notify.success("Email Dispatched", "Check your inbox for the security code.");

      // Store email in session storage for the next step
      sessionStorage.setItem('reset_email', email.trim());
      router.push("/reset-password");
    } catch (error: any) {
      notify.error("Request Failed", error.message || "Unable to request password reset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#2563eb 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />

      <div className="w-full max-w-[440px] relative z-10">
        <div className="flex flex-col items-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <div className="relative w-20 h-20 mb-6">
              <Image src="/images/faicom.png" alt="CodeStart Logo" fill className="object-contain" priority />
           </div>
           <div className="text-center space-y-2">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Reset Password</h1>
              <p className="text-slate-500 font-medium text-sm">Enter your email to receive a reset code.</p>
           </div>
        </div>

        <div className="bg-white border border-slate-200 p-8 md:p-10 rounded-[2.5rem] shadow-xl">
          <form onSubmit={handleRequestReset} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
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

            <button
              disabled={loading || !email}
              type="submit"
              className="w-full py-5 bg-slate-900 text-white hover:bg-blue-600 disabled:opacity-50 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl shadow-slate-200"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <>Send Reset Code <Send size={18} /></>}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-50 text-center">
             <Link href="/login" className="inline-flex items-center gap-2 text-xs text-slate-400 font-bold hover:text-blue-600 transition-colors">
                <ArrowLeft size={14} /> Back to Login
             </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
