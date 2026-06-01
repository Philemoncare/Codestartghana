"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { studentService } from "@/services/studentService";
import {
  LogOut, Calendar, Bell, CheckCircle2,
  Clock, User, Download, Play, ShieldCheck,
  ChevronRight, ExternalLink, Zap, Award,
  BookOpen, FolderKanban, History, Mail, Phone, School,
  Camera, Map, FileText, MessageSquare, Info
} from "lucide-react";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { TRAINING_START_DATE, SCHEDULE_DISPLAY } from "@/lib/constants";

export default function StudentDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timetableImage, setTimetableImage] = useState<string | null>(null);
  const [cohortDate, setCohortDate] = useState<Date>(TRAINING_START_DATE);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await studentService.getDashboardData();
      setData(result);

      try {
        const [timetableRes, cohortRes] = await Promise.all([
          fetch('/api/admin/settings?key=timetable_image'),
          fetch('/api/admin/settings?key=cohort_start_date')
        ]);

        if (timetableRes.ok) {
           const settings = await timetableRes.json();
           if (settings && settings.value) setTimetableImage(settings.value);
        }

        if (cohortRes.ok) {
           const settings = await cohortRes.json();
           if (settings && settings.value) setCohortDate(new Date(settings.value));
        }
      } catch (e) {
        console.warn("Non-critical: Failed to fetch settings", e);
      }
    } catch (err: any) {
      console.error("Dashboard Fetch Error:", err);
      setError(err.message || "Failed to load dashboard");
      if (err.status === 403 || err.status === 401) {
        notify.error("Session Expired", "Please log in again.");
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [fetchData]);

  const {
    student = {},
    announcements = [],
    schedule = [],
    progress = { percentage: 0, completedModules: 0, totalModules: 0, currentModule: 'Not Started' },
    projects = [],
    badges = [],
    attendanceCount = 0,
    attendanceHistory = [],
    isApproved = false
  } = data || {};

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return notify.error("Image too large (max 2MB)");

    setUploadingPhoto(true);
    try {
      const res = await studentService.updateProfilePhoto(file);
      if (res.success) {
        notify.success("Profile photo updated");
        setData((prev: any) => ({
          ...prev,
          student: { ...prev.student, profile_photo_url: res.url }
        }));
      }
    } catch (err) {
      notify.error("Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const cohortStartDate = cohortDate;
  const countdown = useMemo(() => {
    const diff = cohortStartDate.getTime() - currentTime.getTime();
    if (diff <= 0) return null;
    return {
      d: Math.floor(diff / (1000 * 60 * 60 * 24)),
      h: Math.floor((diff / (1000 * 60 * 60)) % 24),
      m: Math.floor((diff / 1000 / 60) % 60),
      s: Math.floor((diff / 1000) % 60)
    };
  }, [currentTime]);

  if (loading) return <DashboardSkeleton />;

  if (error || !data) return <ErrorState onRetry={fetchData} />;

  return (
    <main className="min-h-screen bg-[#FBFBFE] pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 md:pt-8 space-y-4 md:space-y-6">

        {/* 1. COMPACT PREMIUM PROFILE SECTION */}
        <section className="bg-white border border-slate-200 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/40 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-blue-100/40 transition-colors duration-700" />

          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-5 md:gap-8 relative z-10">
            <div className="relative group/avatar shrink-0">
               <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-slate-900 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center transition-transform duration-500 group-hover/avatar:scale-[1.02]">
                  {student.profile_photo_url ? (
                    <img src={student.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-black text-white">{student.fullName?.charAt(0) || 'S'}</span>
                  )}
                  {uploadingPhoto && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                       <Clock className="animate-spin text-white" size={20} />
                    </div>
                  )}
               </div>
               <button
                 onClick={() => fileInputRef.current?.click()}
                 className="absolute bottom-0 right-0 w-8 h-8 md:w-9 md:h-9 bg-blue-600 text-white rounded-full border-2 border-white shadow-lg flex items-center justify-center hover:bg-blue-700 active:scale-90 transition-all"
               >
                  <Camera size={14} />
               </button>
               <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
            </div>

            <div className="flex-1 space-y-4 text-center lg:text-left w-full">
               <div className="space-y-1">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                    <ShieldCheck size={10} /> Verified Engineering Student
                 </div>
                 <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter leading-tight">
                   {student.fullName}
                 </h1>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 border-t border-slate-100 pt-4">
                  <InfoItem label="Student ID" value={`#CS-${student.id?.toString().padStart(4, '0') || '0000'}`} icon={<Zap size={12} />} />
                  <InfoItem label="Institution" value={student.school || 'Private Student'} icon={<School size={12} />} />
                  <InfoItem label="Learning Level" value={student.experience} icon={<Award size={12} />} />
                  <InfoItem label="Email Address" value={student.email} icon={<Mail size={12} />} />
                  <InfoItem label="Enrollment Date" value={new Date(student.created_at).toLocaleDateString()} icon={<Calendar size={12} />} />
               </div>
            </div>
          </div>
        </section>

        {/* 2. PROGRESS & COHORT SYNC */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
           <div className="lg:col-span-2 space-y-4 md:space-y-6">

             {/* Dynamic Progress Card */}
             <section className="bg-white border border-slate-200 rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 shadow-sm relative overflow-hidden group">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                   <div className="space-y-3 text-center md:text-left">
                      {progress.percentage === 0 ? (
                        <>
                          <h3 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight leading-tight">Your learning journey is ready to begin.</h3>
                          <p className="text-slate-500 text-sm font-medium max-w-sm">Complete your first lesson to unlock progress tracking.</p>
                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                            <Link href="/student/learning-space" className="inline-flex items-center gap-3 px-6 py-3.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-100 active:scale-95 transition-all">
                               Start Learning <Play size={14} fill="currentColor" />
                            </Link>
                            <Link href="/student/learning-space" className="inline-flex items-center gap-3 px-6 py-3.5 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 border border-slate-100 transition-all">
                               Continue Learning <ChevronRight size={14} />
                            </Link>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="space-y-1">
                             <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Active Curriculum</span>
                             <h3 className="text-2xl font-black text-slate-900 tracking-tight">{progress.currentModule}</h3>
                          </div>
                          <p className="text-slate-500 text-sm font-medium">{progress.completedModules} of {progress.totalModules} modules completed.</p>
                          <Link href="/student/learning-space" className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
                             Continue Learning <ChevronRight size={14} />
                          </Link>
                        </>
                      )}
                   </div>

                   <div className="relative w-28 h-28 md:w-36 md:h-36 shrink-0">
                      <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                         <circle cx="50" cy="50" r="45" fill="transparent" stroke="#f1f5f9" strokeWidth="8" />
                         <circle
                           cx="50" cy="50" r="45" fill="transparent"
                           stroke="url(#progress-grad)" strokeWidth="8"
                           strokeDasharray="282.7"
                           strokeDashoffset={282.7 - (282.7 * (progress.percentage || 0)) / 100}
                           strokeLinecap="round"
                           className="transition-all duration-1000 ease-out"
                         />
                         <defs>
                           <linearGradient id="progress-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                             <stop offset="0%" stopColor="#2563eb" />
                             <stop offset="100%" stopColor="#4f46e5" />
                           </linearGradient>
                         </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                         <span className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter">{progress.percentage}%</span>
                         <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Overall</span>
                      </div>
                   </div>
                </div>
             </section>

             {/* Quick Access Learning Cards */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LearningCard
                  href="/student/learning-space"
                  title="Learning Space"
                  description="Access active lessons, labs and interactive sandboxes."
                  icon={<BookOpen size={24} />}
                  color="blue"
                />
                <LearningCard
                  href="/student/curriculum"
                  title="Curriculum"
                  description="View the complete roadmap from HTML to Fullstack React."
                  icon={<Map size={24} />}
                  color="emerald"
                />
                <LearningCard
                  href="/student/projects"
                  title="Projects"
                  description="Submit and track your weekly practical assignments."
                  icon={<FolderKanban size={24} />}
                  color="indigo"
                />
                <LearningCard
                  href="/student/resources"
                  title="Resources"
                  description="Hand-picked PDFs, guides, and professional tools."
                  icon={<FileText size={24} />}
                  color="amber"
                />
                <LearningCard
                  href={process.env.NEXT_PUBLIC_WHATSAPP_LINK || "#"}
                  title="Support"
                  description="Contact the student success team for assistance."
                  icon={<MessageSquare size={24} />}
                  color="blue"
                />
             </div>
           </div>

           {/* 3. SIDEBAR: NOTIFICATIONS & COUNTDOWN */}
           <aside className="space-y-4 md:space-y-6">

              {/* Enhanced Countdown Timer */}
              {countdown && (
                <section className="bg-slate-900 rounded-[1.5rem] md:rounded-[2rem] p-6 text-white relative overflow-hidden shadow-2xl">
                   <div className="absolute top-0 right-0 p-8 opacity-5">
                      <Clock size={100} />
                   </div>
                   <div className="relative z-10 space-y-5">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Next Cohort Sync</span>
                        <h4 className="text-xl font-black italic tracking-tighter">Live Session Starts In</h4>
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                         <TimeBlock label="Days" value={countdown.d} />
                         <TimeBlock label="Hrs" value={countdown.h} />
                         <TimeBlock label="Min" value={countdown.m} />
                         <TimeBlock label="Sec" value={countdown.s} isLast />
                      </div>

                      <div className="pt-4 border-t border-white/10">
                         <p className="text-[10px] text-slate-400 font-medium leading-relaxed">System pulls real-time synchronization from central node configuration.</p>
                      </div>
                   </div>
                </section>
              )}

              {/* Notification Center */}
              <section className="bg-white border border-slate-200 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-sm flex flex-col h-[380px]">
                 <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                    <h3 className="font-black text-slate-900 text-sm uppercase tracking-tight flex items-center gap-2">
                       <Bell size={16} className="text-blue-600" /> Notifications
                    </h3>
                    <span className="px-2 py-0.5 bg-blue-600 text-white text-[9px] font-black rounded-full flex items-center justify-center">2 NEW</span>
                 </div>
                 <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                    <NotificationItem
                       title="Cohort Schedule Confirmed"
                       time="Just now"
                       content={`Training starts on ${SCHEDULE_DISPLAY.trainingStart}. Registration ends ${SCHEDULE_DISPLAY.registrationDeadline}. Please prepare for onboarding.`}
                       isUnread
                    />
                    <NotificationItem
                       title="Orientation Package Available"
                       time="2 hours ago"
                       content="Download your 2026 Welcome Kit from the Resources section."
                       isUnread
                    />
                    <NotificationItem
                       title="Assignment Deadline"
                       time="6 hours ago"
                       content="Your 'Responsive Landing Page' project is due tomorrow at 11:59 PM."
                       isUnread
                    />
                    <NotificationItem
                       title="Session Starts Tomorrow"
                       time="1 day ago"
                       content="Tomorrow's Practical Lab will start at 2:00 PM GMT instead of 1:00 PM."
                    />
                    <NotificationItem
                       title="New Resource Uploaded"
                       time="3 days ago"
                       content="Philemon uploaded a new guide: 'Mastering Git for Solo Developers'."
                    />
                 </div>
                 <div className="p-4 border-t border-slate-50 bg-slate-50/20">
                    <Link href="/student/notifications" className="text-[10px] font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest text-center block w-full">View All Alerts</Link>
                 </div>
              </section>
           </aside>
        </div>
      </div>
    </main>
  );
}

function InfoItem({ label, value, icon }: any) {
  return (
    <div className="space-y-1">
       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center lg:justify-start gap-1.5">
          {icon} {label}
       </p>
       <p className="text-xs md:text-sm font-bold text-slate-700 truncate">{value}</p>
    </div>
  );
}

function TimeBlock({ label, value, isLast }: any) {
  return (
    <div className={cn("flex flex-col items-center", !isLast && "border-r border-white/5")}>
       <span className="text-2xl font-black tracking-tighter tabular-nums">{value.toString().padStart(2, '0')}</span>
       <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
    </div>
  );
}

function LearningCard({ href, title, description, icon, color }: any) {
  const colors = {
    blue: "bg-blue-50 text-blue-600 hover:bg-blue-600 group-hover:text-white",
    emerald: "bg-emerald-50 text-emerald-600 hover:bg-emerald-600 group-hover:text-white",
    indigo: "bg-indigo-50 text-indigo-600 hover:bg-indigo-600 group-hover:text-white",
    amber: "bg-amber-50 text-amber-600 hover:bg-amber-600 group-hover:text-white"
  };

  return (
    <Link href={href} className="bg-white border border-slate-200 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 hover:shadow-xl hover:shadow-slate-100 hover:-translate-y-1 transition-all duration-300 group flex flex-col gap-6">
       <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300", colors[color as keyof typeof colors])}>
          {icon}
       </div>
       <div className="space-y-2">
          <h4 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{title}</h4>
          <p className="text-slate-500 text-xs font-medium leading-relaxed">{description}</p>
       </div>
       <div className="pt-2 flex justify-end">
          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
             <ChevronRight size={16} />
          </div>
       </div>
    </Link>
  );
}

function NotificationItem({ title, time, content, isUnread = false }: any) {
  return (
    <div className={cn("p-4 hover:bg-slate-50/80 transition-all cursor-pointer group relative", isUnread && "bg-blue-50/30")}>
       {isUnread && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />}
       <div className="flex justify-between items-start mb-1">
          <h4 className={cn("text-[11px] font-black uppercase tracking-tight", isUnread ? "text-slate-900" : "text-slate-600")}>{title}</h4>
          <span className="text-[9px] font-bold text-slate-400">{time}</span>
       </div>
       <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-2 mb-2">{content}</p>
       <button className="text-[9px] font-black text-blue-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Mark as read</button>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 md:pt-8 space-y-4 md:space-y-6">
       <Skeleton className="h-48 md:h-56 rounded-[1.5rem] md:rounded-[2rem]" />
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
             <Skeleton className="h-40 md:h-48 rounded-[1.5rem] md:rounded-[2rem]" />
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Skeleton className="h-32 md:h-40 rounded-[1.5rem] md:rounded-[2rem]" />
                <Skeleton className="h-32 md:h-40 rounded-[1.5rem] md:rounded-[2rem]" />
                <Skeleton className="h-32 md:h-40 rounded-[1.5rem] md:rounded-[2rem]" />
                <Skeleton className="h-32 md:h-40 rounded-[1.5rem] md:rounded-[2rem]" />
                <Skeleton className="h-32 md:h-40 rounded-[1.5rem] md:rounded-[2rem]" />
             </div>
          </div>
          <div className="space-y-4 md:space-y-6">
             <Skeleton className="h-48 md:h-56 rounded-[1.5rem] md:rounded-[2rem]" />
             <Skeleton className="h-[380px] rounded-[1.5rem] md:rounded-[2rem]" />
          </div>
       </div>
    </div>
  );
}

function ErrorState({ onRetry }: any) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
       <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center border border-rose-100">
          <Bell size={40} className="animate-bounce" />
       </div>
       <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Sync Failure</h2>
          <p className="text-slate-500 text-sm font-medium max-w-sm">We couldn't connect to your engineering profile. Please check your connection and try again.</p>
       </div>
       <button onClick={onRetry} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">Retry Synchronization</button>
    </div>
  );
}
