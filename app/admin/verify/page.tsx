"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { notify } from "@/lib/notify";
import { ShieldCheck, Loader2, ArrowRight, RefreshCw, Mail } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function AdminVerifyPage() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(600); // 10 minutes
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      notify.warning("Invalid Code", "Please enter the complete 6-digit code");
      return;
    }

    setLoading(true);
    try {
      await apiFetch('/api/admin/confirm-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: fullCode })
      });

      notify.success("Identity Verified", "Access granted to the administrative dashboard.");
      router.push("/admin/dashboard");
    } catch (error: any) {
      notify.error("Verification Failed", error.message || "The code entered is invalid or has expired.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resending) return;
    setResending(true);
    const resendToast = notify.loading("Requesting new verification code...");
    try {
      await apiFetch('/api/admin/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      notify.success("New Code Sent", "Check your inbox for the fresh verification key.");
      setTimer(600);
      setCode(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } catch (error: any) {
      notify.error("Transmission Error", "Unable to send a new code at this time.");
    } finally {
      setResending(false);
      notify.dismiss(resendToast);
    }
  };

  // Auto-submit when all boxes are filled
  useEffect(() => {
    if (code.every(digit => digit !== "") && code.length === 6) {
      handleVerify();
    }
  }, [code]);

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-[#0B0F1A] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(37,99,235,0.1),_transparent_70%)]" />

      <div className="w-full max-w-[480px] relative z-10 animate-slide-up">
        <div className="text-center mb-10 space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] mb-4">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">Two-Step Verification</h2>
          <div className="flex flex-col items-center gap-2">
            <p className="text-slate-400 font-medium">We've sent a 6-digit code to</p>
            <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full flex items-center gap-2">
              <Mail size={14} className="text-blue-400" />
              <span className="text-blue-400 font-bold text-sm">{email || "your email"}</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 lg:p-10 rounded-[2.5rem] shadow-2xl">
          <form onSubmit={handleVerify} className="space-y-8">
            <div className="flex justify-between gap-2 md:gap-4">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputs.current[index] = el; }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-full aspect-square bg-white/5 border border-white/10 rounded-xl md:rounded-2xl text-center text-2xl font-black text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white/10 outline-none transition-all"
                />
              ))}
            </div>

            <div className="space-y-4">
              <button
                disabled={loading || code.some(d => !d)}
                type="submit"
                className="w-full py-5 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-[0_20px_40px_-10px_rgba(37,99,235,0.3)] active:scale-[0.98]"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <>Verify Code <ArrowRight size={20} /></>}
              </button>

              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2 text-slate-500 text-sm font-bold">
                  <span>Expires in:</span>
                  <span className={timer < 60 ? "text-red-400" : "text-white"}>{formatTime(timer)}</span>
                </div>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending || timer > 540}
                  className="text-sm font-bold text-blue-500 hover:text-blue-400 disabled:opacity-50 flex items-center gap-2 transition-colors"
                >
                  {resending ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                  Resend Code
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="mt-12 text-center">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">CodeStart Administrative System &copy; 2026</p>
        </div>
      </div>
    </main>
  );
}
