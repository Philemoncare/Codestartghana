"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { registerService } from "@/services/registerService";
import { paymentService } from "@/services/paymentService";
import { notify } from "@/lib/notify";
import { isRegistrationOpen, SCHEDULE_DISPLAY } from "@/lib/constants";
import {
  Loader2,
  CheckCircle,
  Smartphone,
  Upload,
  ArrowRight,
  ChevronLeft,
  User,
  BookOpen,
  CreditCard,
  ShieldCheck,
  Eye,
  EyeOff
} from "lucide-react";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3 | 4;

export const EnrollmentWizard = () => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [registrationId, setRegistrationId] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Safety timeout for loading state
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading) {
      timer = setTimeout(() => {
        setLoading(false);
        notify.error("Connection Slow", "The request is taking longer than expected. Please check your connection.");
      }, 30000); // 30 second safety limit
    }
    return () => clearTimeout(timer);
  }, [loading]);

  // Master Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    whatsapp: "",
    age: "",
    school: "",
    experience: "beginner",
    motivation: ""
  });

  // Persist State to Session Storage to prevent loss on refresh
  useEffect(() => {
    const savedData = sessionStorage.getItem('enrollment_form');
    const savedStep = sessionStorage.getItem('enrollment_step');
    const savedRegId = sessionStorage.getItem('enrollment_reg_id');

    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(prev => ({ ...prev, ...parsed, password: "" })); // Don't persist password
      } catch (e) {}
    }
    if (savedStep) setStep(parseInt(savedStep) as Step);
    if (savedRegId) setRegistrationId(parseInt(savedRegId));
  }, []);

  useEffect(() => {
    sessionStorage.setItem('enrollment_form', JSON.stringify({ ...formData, password: "" }));
    sessionStorage.setItem('enrollment_step', step.toString());
    if (registrationId) sessionStorage.setItem('enrollment_reg_id', registrationId.toString());
  }, [formData, step, registrationId]);

  const clearSession = () => {
    sessionStorage.removeItem('enrollment_form');
    sessionStorage.removeItem('enrollment_step');
    sessionStorage.removeItem('enrollment_reg_id');
    window.location.reload();
  };

  const [passwordStrength, setPasswordStrength] = useState(0);
  const [motivationCount, setMotivationCount] = useState(0);
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [paymentData, setPaymentData] = useState({
    senderNumber: "",
    transactionId: ""
  });

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  if (!isRegistrationOpen()) {
    return (
      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-12 shadow-premium text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
        <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto border border-rose-100 shadow-inner">
          <ShieldCheck size={48} />
        </div>
        <div className="space-y-4">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Registration Closed</h2>
          <p className="text-slate-500 font-medium text-lg max-w-md mx-auto">
            Registration for this cohort ended on <span className="text-slate-900 font-bold">{SCHEDULE_DISPLAY.registrationDeadline}</span>.
          </p>
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 inline-block text-left">
             <p className="text-xs font-black uppercase tracking-widest text-blue-600 mb-2">Next Steps</p>
             <p className="text-sm text-slate-600 font-medium">Please follow our social channels or contact support to be notified when the next cohort opens.</p>
          </div>
        </div>
        <div className="pt-6">
          <button
            onClick={() => router.push("/")}
            className="px-10 py-4 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (!isMounted) return (
     <div className="bg-white border border-slate-200 rounded-[2.5rem] p-12 shadow-premium animate-pulse flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-slate-200" size={40} />
     </div>
  );

  const calculatePasswordStrength = (pass: string) => {
    let strength = 0;
    if (pass.length > 5) strength++;
    if (pass.length > 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    return strength;
  };

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const validateWhatsApp = (num: string) => {
    return /^[0-9]{10,15}$/.test(num.replace(/\s/g, ''));
  };

  // Handle Input Changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
    if (name === 'motivation') {
      setMotivationCount(value.length);
    }
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    if (selected) {
      if (!selected.type.startsWith('image/')) {
        notify.error("Invalid Format", "Please upload a valid image file.");
        return;
      }
      if (selected.size > 2 * 1024 * 1024) {
        notify.warning("File Too Large", "Screenshots must be under 2MB.");
        return;
      }
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selected);
    }
  };

  // Step Transitions
  const nextStep = () => {
    setStep(prev => (prev < 4 ? (prev + 1) as Step : prev));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const prevStep = () => {
    setStep(prev => (prev > 1 ? (prev - 1) as Step : prev));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleIdentitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (honeypot) return; // Anti-spam

    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required";
    if (!formData.email.trim() || !validateEmail(formData.email)) newErrors.email = "Valid Email is required";
    if (!formData.password || formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (passwordStrength < 2) newErrors.password = "Password is too weak. Use numbers or special chars.";
    if (!formData.whatsapp.trim() || !validateWhatsApp(formData.whatsapp)) newErrors.whatsapp = "Enter a valid 10-digit WhatsApp number";
    if (!formData.age || parseInt(formData.age) < 10 || parseInt(formData.age) > 70) newErrors.age = "Valid age (10-70) is required";
    if (!formData.school.trim()) newErrors.school = "Institution is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      notify.warning("Validation Error", "Please correct the highlighted fields to proceed.");
      return;
    }

    setErrors({});
    nextStep();
  };

  const handleLearningSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (honeypot) return;

    if (!formData.motivation.trim() || formData.motivation.length < 20) {
      setErrors({ motivation: "Please share more about your motivation (min 20 chars)." });
      notify.warning("Insufficient Motivation", "Please provide a more detailed answer about your goals (min 20 chars).");
      return;
    }

    setErrors({});
    setLoading(true);
    const loadingToast = notify.loading("Your technical profile is being encrypted...");
    try {
      const result = await registerService.register(formData);
      setRegistrationId(result.id);
      nextStep();
      notify.success("Information Synchronized", "Your learning profile has been recorded successfully.");
      notify.dismiss(loadingToast);
    } catch (error: any) {
      console.error("Registration Error:", error);

      // Handle "Email already registered"
      // Note: The system now allows re-registration if the previous attempt was 'rejected'
      if (error.message?.includes('already registered')) {
         notify.error("Active Account Found", "An application with this email is already in progress or approved.");
         notify.dismiss(loadingToast);
         return;
      }

      const errorMessage = error.message || (typeof error === 'string' ? error : "An error occurred while saving your data.");
      notify.error("Synchronization Failed", errorMessage);
      notify.dismiss(loadingToast);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!registrationId) return notify.error("Session Expired", "Please restart the enrollment process.");

    if (!paymentData.senderNumber || !paymentData.transactionId || !file) {
      notify.warning("Incomplete Info", "MoMo number, Ref ID, and screenshot are required.");
      return;
    }

    setLoading(true);
    const loadingToast = notify.loading("Verifying transaction records...");
    try {
      await paymentService.submitPayment({
        registrationId: registrationId.toString(),
        studentName: formData.fullName,
        transactionId: paymentData.transactionId,
        senderNumber: paymentData.senderNumber,
        file
      });
      nextStep();
      notify.success("Enrollment Finalized", "Welcome to CodeStart. Your journey begins soon.");
      notify.dismiss(loadingToast);
    } catch (error: any) {
      notify.error("Payment Verification Failed", error.message || "We couldn't verify your transaction.");
      notify.dismiss(loadingToast);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Progress Stepper */}
      {step < 4 && (
        <div className="flex items-center justify-between max-w-sm sm:max-w-md mx-auto mb-8 sm:mb-12 px-2">
          <StepIcon active={step === 1} completed={step > 1} icon={<User size={16} />} label="Identity" />
          <div className={cn("h-px flex-1 mx-2 sm:mx-4 transition-colors duration-500", step > 1 ? "bg-blue-600" : "bg-slate-200")} />
          <StepIcon active={step === 2} completed={step > 2} icon={<BookOpen size={16} />} label="Learning" />
          <div className={cn("h-px flex-1 mx-2 sm:mx-4 transition-colors duration-500", step > 2 ? "bg-blue-600" : "bg-slate-200")} />
          <StepIcon active={step === 3} completed={step > 3} icon={<CreditCard size={16} />} label="Payment" />
        </div>
      )}

      <div className={cn(
        "bg-white border border-slate-200 rounded-[1.5rem] md:rounded-[2.5rem] p-5 md:p-12 shadow-premium transition-all duration-500 min-h-[400px] relative overflow-hidden",
        loading && "opacity-60 pointer-events-none"
      )}>
        {loading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-[2px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-blue-600" size={40} />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Processing Request...</p>
            </div>
          </div>
        )}
        {step === 1 && (
          <form key="step1" onSubmit={handleIdentitySubmit} className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="space-y-1.5 sm:space-y-2">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Personal Details</h2>
              <p className="text-xs sm:text-sm md:text-base text-slate-500 font-medium">Let&apos;s start with your basic information.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput label="Full Name" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Veronica Amissah" error={errors.fullName} required />
              <FormInput label="Email Address" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="amissah@example.com" error={errors.email} required />
              <div className="space-y-2">
                 <FormInput
                    label="Secure Password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    error={errors.password}
                    required
                    suffix={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    }
                 />
                 <div className="flex gap-1 h-1 px-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                       <div key={s} className={cn("flex-1 rounded-full transition-all duration-500", passwordStrength >= s ? (passwordStrength <= 2 ? "bg-red-400" : passwordStrength <= 4 ? "bg-amber-400" : "bg-emerald-500") : "bg-slate-100")} />
                    ))}
                 </div>
              </div>
              <FormInput label="WhatsApp Number" name="whatsapp" value={formData.whatsapp} onChange={handleInputChange} placeholder="050 000 0000" error={errors.whatsapp} required />
              <FormInput label="Age" name="age" type="number" value={formData.age} onChange={handleInputChange} placeholder="22" error={errors.age} required />
              <FormInput label="Current Institution / Occupation" name="school" value={formData.school} onChange={handleInputChange} placeholder="e.g. University of Ghana" error={errors.school} required />
            </div>

            {/* Honeypot Field */}
            <input type="text" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} className="hidden" aria-hidden="true" />

            <div className="pt-4">
              <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all hover:bg-blue-700 shadow-xl shadow-blue-100">
                Next Step <ArrowRight size={20} />
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form key="step2" onSubmit={handleLearningSubmit} className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="flex justify-between items-start">
               <div className="space-y-1.5 sm:space-y-2">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Learning Profile</h2>
                <p className="text-xs sm:text-sm md:text-base text-slate-500 font-medium">Your technical background and motivation.</p>
              </div>
              <button onClick={prevStep} type="button" className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                <ChevronLeft size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Current Experience</label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all appearance-none font-bold text-slate-900 cursor-pointer"
                >
                  <option value="beginner">Absolute Beginner</option>
                  <option value="some-knowledge">Intermediate (Knows HTML/CSS)</option>
                  <option value="advanced">Advanced (Built web apps)</option>
                </select>
              </div>

              <div className="space-y-2 relative">
                <div className="flex justify-between items-end mb-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Why CodeStart?</label>
                  <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md", motivationCount < 20 ? "text-rose-500 bg-rose-50" : "text-emerald-500 bg-emerald-50")}>
                    {motivationCount} / 20 Min
                  </span>
                </div>
                <textarea
                  required
                  name="motivation"
                  rows={4}
                  value={formData.motivation}
                  onChange={handleInputChange}
                  placeholder="Tell us about your technical goals..."
                  className={cn(
                    "w-full bg-slate-50 border rounded-2xl px-5 py-4 focus:ring-4 outline-none transition-all resize-none font-bold text-slate-900 placeholder:text-slate-400",
                    errors.motivation ? "border-red-500 focus:ring-red-50" : "border-slate-200 focus:ring-blue-50 focus:border-blue-500"
                  )}
                />
                {errors.motivation && <p className="text-[10px] text-red-500 font-bold ml-2">{errors.motivation}</p>}
              </div>
            </div>

            <div className="pt-4">
              <button disabled={loading} type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all hover:bg-blue-700 shadow-xl shadow-blue-100">
                {loading ? <Loader2 className="animate-spin" /> : <>Save & Continue <ArrowRight size={20} /></>}
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form key="step3" onSubmit={handlePaymentSubmit} className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="flex justify-between items-start">
               <div className="space-y-1.5 sm:space-y-2">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Tuition Payment</h2>
                <p className="text-xs sm:text-sm md:text-base text-slate-500 font-medium">Finalize your enrollment via Mobile Money.</p>
              </div>
              <button onClick={prevStep} type="button" className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                <ChevronLeft size={24} />
              </button>
            </div>

            <div className="bg-slate-900 p-6 sm:p-8 rounded-2xl sm:rounded-3xl text-white space-y-6 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                  <CreditCard size={120} />
               </div>
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">MTN Mobile Money</p>
                     <p className="text-2xl sm:text-3xl font-black tracking-tighter">0533680823</p>
                     <p className="text-[10px] font-bold text-blue-400 mt-1 uppercase tracking-widest">Name: Philemon Melabah</p>
                  </div>
                  <div className="text-left sm:text-right">
                     <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mb-1">Tuition Fee</p>
                     <p className="text-3xl sm:text-4xl font-black italic tracking-tighter">GHS 450</p>
                  </div>
               </div>
               <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-[11px] font-medium leading-relaxed text-slate-300">
                 Step 1: Send GHS 450 to the number above.<br/>
                 Step 2: Enter your transaction details below for verification.
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput label="Your MoMo Number" name="senderNumber" value={paymentData.senderNumber} onChange={handlePaymentChange} placeholder="Number paid from" required />
              <FormInput label="Transaction ID" name="transactionId" value={paymentData.transactionId} onChange={handlePaymentChange} placeholder="MoMo Reference" required />
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Transfer Screenshot</label>
              <div className="relative border-2 border-dashed border-slate-200 hover:border-blue-600 rounded-[2rem] p-4 transition-all group bg-slate-50/50">
                <input type="file" required accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                {preview ? (
                  <div className="relative h-56 rounded-2xl overflow-hidden border border-slate-200">
                    <img src={preview} alt="Receipt preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="bg-white text-slate-900 font-bold text-[10px] uppercase tracking-widest px-4 py-2 rounded-full">Change Photo</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 flex flex-col items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                       <Upload size={24} />
                    </div>
                    <p className="text-xs text-slate-500 font-black uppercase tracking-widest">Upload transaction screenshot</p>
                  </div>
                )}
              </div>
            </div>

            <button disabled={loading} type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all hover:bg-blue-700 shadow-xl shadow-blue-100">
              {loading ? <Loader2 className="animate-spin" /> : "Complete Enrollment"}
            </button>
          </form>
        )}

        {step === 4 && (
          <div className="text-center py-8 space-y-8 animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto border border-emerald-100 shadow-inner">
              <CheckCircle size={48} />
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Application Pending</h2>
              <div className="max-w-md mx-auto space-y-4 text-slate-600 font-medium leading-relaxed">
                <p>Excellent work, <span className="text-slate-900 font-bold">{formData.fullName.split(' ')[0]}</span>. Your application has been successfully submitted for review.</p>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-left space-y-2">
                   <div className="flex justify-between"><span>Email</span><span className="font-bold text-slate-900">{formData.email}</span></div>
                   <div className="flex justify-between"><span>MoMo Ref</span><span className="font-bold text-slate-900">{paymentData.transactionId}</span></div>
                   <div className="flex justify-between"><span>Status</span><span className="text-blue-600 font-bold uppercase tracking-widest">Verification In Progress</span></div>
                </div>
                <p className="text-sm">We will verify your transaction and establish contact via WhatsApp within 24 hours.</p>
              </div>
            </div>

            <div className="pt-6">
               <button
                onClick={() => router.push("/")}
                className="px-10 py-4 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-xl"
              >
                Return to Homepage
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Security Badge */}
      <div className="flex flex-col items-center gap-4">
         <div className="flex items-center justify-center gap-2 text-slate-400">
            <ShieldCheck size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">End-to-End Encrypted Enrollment</span>
         </div>

         {step > 1 && step < 4 && (
            <button
               onClick={clearSession}
               className="text-[10px] font-bold uppercase tracking-widest text-slate-300 hover:text-rose-500 transition-colors"
            >
               Reset & Start Over
            </button>
         )}
      </div>
    </div>
  );
};

const StepIcon = ({ active, completed, icon, label }: { active: boolean; completed: boolean; icon: any; label: string }) => (
  <div className="flex flex-col items-center gap-2 sm:gap-3">
    <div className={cn(
      "w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-500",
      active ? "bg-blue-600 text-white shadow-xl shadow-blue-100 scale-110" :
      completed ? "bg-emerald-500 text-white" : "bg-white border border-slate-200 text-slate-400"
    )}>
      {completed ? <CheckCircle size={18} /> : icon}
    </div>
    <span className={cn(
      "text-[8px] sm:text-[9px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em]",
      active ? "text-slate-900" : "text-slate-400"
    )}>{label}</span>
  </div>
);

const FormInput = ({ label, name, type = "text", value, onChange, placeholder, required = false, error, suffix }: any) => (
  <div className="space-y-1.5 sm:space-y-2">
    <label className="text-[10px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">{label}</label>
    <div className="relative">
      <input
        required={required}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={cn(
          "w-full bg-slate-50 border rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3.5 sm:py-4 focus:ring-4 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300 text-sm sm:text-base",
          error ? "border-red-500 focus:ring-red-50" : "border-slate-200 focus:ring-blue-50 focus:border-blue-500",
          suffix && "pr-12"
        )}
      />
      {suffix && suffix}
    </div>
    {error && <p className="text-[10px] text-red-500 font-bold ml-2">{error}</p>}
  </div>
);
