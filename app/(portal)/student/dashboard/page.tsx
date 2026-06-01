"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { studentService } from "@/services/studentService";
import {
  LogOut, Calendar, Bell, CheckCircle2,
  Clock, User, Download, Play, ShieldCheck,
  ChevronRight, ExternalLink, Zap, Award,
  BookOpen, FolderKanban, History, Mail, Phone, School
} from "lucide-react";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";

export default function StudentDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timetableImage, setTimetableImage] = useState<string | null>(null);
  const router = useRouter();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch dashboard data
      const result = await studentService.getDashboardData();
      setData(result);

      // Fetch settings separately so it doesn't block the main data
      try {
        const settingsRes = await fetch('/api/admin/settings?key=timetable_image');
        if (settingsRes.ok) {
           const settings = await settingsRes.json();
           if (settings && settings.value) {
             setTimetableImage(settings.value);
           }
        }
      } catch (e) {
        console.warn("Non-critical: Failed to fetch timetable image", e);
      }
    } catch (err: any) {
      console.error("Dashboard Fetch Error:", err);
      setError(err.message || "Failed to load dashboard");

      if (err.status === 403 || err.status === 401) {
        notify.error("Session Expired", "Please log in again to continue.");
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000 * 60);
    return () => clearInterval(timer);
  }, [fetchData]);

  // 1. Destructure data safely with defaults at the top level
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

  // 2. Computed values using hooks at the top level
  const attendanceRate = useMemo(() => {
    if (!schedule.length || attendanceCount === 0) return "0%";
    const rate = Math.round((attendanceCount / schedule.length) * 100);
    return `${Math.min(100, rate)}%`;
  }, [schedule.length, attendanceCount]);

  const activeClass = useMemo(() => {
    if (!schedule || schedule.length === 0) return null;

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const currentDay = dayNames[currentTime.getDay()];

    return schedule.find((session: any) => {
      if (!session.time || !session.time.includes("-")) return false;
      if (session.day !== currentDay) return false;

      try {
        const parts = session.time.split("-");
        const startPart = parts[0].trim();
        const [time, ampm] = startPart.split(" ");
        let [hours, minutes] = time.split(":").map(Number);
        if (isNaN(minutes)) minutes = 0;

        if (ampm === "PM" && hours !== 12) hours += 12;
        if (ampm === "AM" && hours === 12) hours = 0;

        const startTime = new Date(currentTime);
        startTime.setHours(hours, minutes, 0, 0);

        const activationTime = new Date(startTime.getTime() - 15 * 60000);
        const endTime = new Date(startTime.getTime() + 120 * 60000);

        return currentTime >= activationTime && currentTime <= endTime;
      } catch (e) {
        return false;
      }
    });
  }, [schedule, currentTime]);

  const firstName = student?.fullName ? student.fullName.split(' ')[0] : 'Student';

  const handleLogout = async () => {
    try {
      await fetch('/api/logout');
      router.push('/login');
    } catch (e) {
      router.push('/login');
    }
  };

  // 3. Handle Loading State
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 mt-12 space-y-10">
         <section className="bg-white border border-slate-200 rounded-[2.5rem] p-12 shadow-sm">
            <div className="flex flex-col md:flex-row items-center gap-8">
               <Skeleton className="w-32 h-32 rounded-[2rem]" />
               <div className="space-y-4 flex-1">
                  <Skeleton className="h-4 w-32 rounded-full" />
                  <Skeleton className="h-12 w-64 rounded-xl" />
                  <Skeleton className="h-4 w-96 rounded-full" />
               </div>
            </div>
         </section>
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-10">
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Skeleton className="h-32 rounded-[2rem]" />
                  <Skeleton className="h-32 rounded-[2rem]" />
                  <Skeleton className="h-32 rounded-[2rem]" />
                  <Skeleton className="h-32 rounded-[2rem]" />
               </div>
               <Skeleton className="h-96 rounded-[2.5rem]" />
            </div>
            <div className="space-y-10">
               <Skeleton className="h-64 rounded-[2.5rem]" />
               <Skeleton className="h-64 rounded-[2.5rem]" />
            </div>
         </div>
      </div>
    );
  }

  // 4. Handle Error or Missing Data State
  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
         <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mb-6 border border-rose-100 shadow-sm">
            <Bell size={40} className="animate-bounce" />
         </div>
         <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase mb-2">Sync Error</h1>
         <p className="text-slate-500 font-medium max-w-md mb-8">
           We encountered a problem while retrieving your engineering profile. This usually happens during database maintenance.
         </p>
         <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => fetchData()}
              className="px-8 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
            >
               Retry Synchronization
            </button>
            <button
              onClick={handleLogout}
              className="px-8 py-4 bg-white text-slate-600 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
               Sign Out
            </button>
         </div>
      </div>
    );
  }

  return (
    <main className="pb-24">
      <div className="max-w-6xl mx-auto px-6 mt-12 space-y-10 animate-in fade-in duration-700">

        <section className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-32 -mt-32" />

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
               <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-[2rem] bg-slate-900 flex items-center justify-center text-white overflow-hidden shadow-xl shrink-0">
                  {(student.profile_photo_url || student.profilePhotoUrl) ? (
                    <img
                      src={student.profile_photo_url || student.profilePhotoUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <User size={48} className="opacity-20 absolute" />
                      <span className="text-4xl font-black relative z-10">{student.fullName?.charAt(0) || student.full_name?.charAt(0) || 'S'}</span>
                    </>
                  )}
               </div>

               <div className="space-y-3">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                    {isApproved ? <ShieldCheck size={12} /> : <Clock size={12} />}
                    {isApproved ? 'Verified Engineering Student' : 'Identity Verification Pending'}
                 </div>
                 <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
                   {student.fullName}
                 </h1>
                 <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-slate-500 font-bold text-xs uppercase tracking-widest">
                    <span className="flex items-center gap-2"><Mail size={14} /> {student.email}</span>
                    <span className="flex items-center gap-2"><School size={14} /> {student.school || 'N/A'}</span>
                    <span className="flex items-center gap-2"><Zap size={14} /> {student.experience}</span>
                    <span className="flex items-center gap-2"><Clock size={14} /> ID: #CS-2026-{student.id?.toString().padStart(4, '0') || '0000'}</span>
                 </div>
               </div>
            </div>

            {isApproved && (
               <div className="w-full md:w-80 space-y-4 bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                  <div className="flex justify-between items-end">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Progress</span>
                     <span className="text-2xl font-black text-slate-900">{progress.percentage}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                     <div
                       className="h-full bg-blue-600 transition-all duration-1000"
                       style={{ width: `${progress.percentage}%` }}
                     />
                  </div>
                  <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest">
                     <span>{progress.completedModules} Modules Done</span>
                     <span>{progress.percentage === 0 ? "Course Not Started" : `${progress.percentage}% Accuracy`}</span>
                  </div>
               </div>
            )}
          </div>
        </section>

        {!isApproved ? (
          <div className={cn(
            "rounded-[2.5rem] p-16 text-center space-y-6",
            student.status === 'rejected' ? "bg-rose-50 border border-rose-200" : "bg-amber-50/50 border border-amber-200 animate-pulse"
          )}>
             <div className={cn(
               "w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-sm border",
               student.status === 'rejected' ? "text-rose-500 border-rose-100" : "text-amber-500 border-amber-100"
             )}>
                {student.status === 'rejected' ? <ShieldCheck size={40} className="rotate-180" /> : <Clock size={40} />}
             </div>
             <div className="max-w-md mx-auto space-y-3">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                  {student.status === 'rejected' ? "Application Declined" : "Awaiting Activation"}
                </h3>
                <p className="text-slate-600 font-medium">
                  {student.status === 'rejected'
                    ? "Unfortunately, your application for this cohort has been declined. Please contact support for more details."
                    : "Your account is currently in the verification queue. Full portal access will be granted once your tuition is verified."}
                </p>
             </div>
             <div className="pt-4">
                <a
                  href={process.env.NEXT_PUBLIC_WHATSAPP_LINK || "#"}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200"
                >
                   Contact Engineering Support <ChevronRight size={14} />
                </a>
             </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            <div className="lg:col-span-2 space-y-10">
               <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatBox label="Modules Done" value={progress.completedModules} icon={<CheckCircle2 className="text-emerald-500" />} />
                  <StatBox label="Attendance Rate" value={attendanceRate} icon={<Calendar className="text-blue-500" />} />
                  <StatBox label="Badges Earned" value={badges.length} icon={<Award className="text-amber-500" />} />
                  <StatBox label="Submissions" value={projects.length} icon={<FolderKanban className="text-purple-500" />} />
               </section>

               <section className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                  <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                     <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                        <Bell size={20} className="text-blue-600" /> Administrative Briefing
                     </h3>
                  </div>
                  <div className="divide-y divide-slate-50">
                     {announcements.length === 0 ? (
                       <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                          No announcements published yet
                       </div>
                     ) : (
                       announcements.map((ann: any) => (
                         <div key={ann.id} className="p-8 hover:bg-slate-50/50 transition-colors group">
                            <div className="flex justify-between items-center mb-3">
                               <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors">{ann.title}</h4>
                               {ann.priority === 'high' && <span className="px-2 py-0.5 bg-rose-500 text-white text-[8px] font-black uppercase rounded tracking-widest">Priority</span>}
                            </div>
                            <p className="text-slate-600 font-medium leading-relaxed mb-4 text-sm">{ann.content}</p>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(ann.created_at).toLocaleDateString()}</span>
                         </div>
                       ))
                     )}
                  </div>
               </section>

               <section className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                  <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                     <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                        <History size={20} className="text-blue-600" /> Attendance History
                     </h3>
                     <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{attendanceCount} Sessions Verified</span>
                  </div>
                  <div className="p-8">
                     {attendanceHistory.length === 0 ? (
                       <p className="text-center text-slate-400 font-bold uppercase tracking-widest text-[10px] py-10">No attendance records found.</p>
                     ) : (
                       <div className="space-y-4">
                          {attendanceHistory.map((record: any) => (
                             <div key={record.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-4">
                                   <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                                      <CheckCircle2 size={18} />
                                   </div>
                                   <div>
                                      <p className="text-sm font-black text-slate-900">{record.topic}</p>
                                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{record.day} • {record.time}</p>
                                   </div>
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(record.attended_at).toLocaleDateString()}</span>
                             </div>
                          ))}
                       </div>
                     )}
                  </div>
               </section>

               {timetableImage && (
                  <section className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                     <div className="p-8 border-b border-slate-50">
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                           <Calendar size={20} className="text-blue-600" /> Weekly Schedule Graphic
                        </h3>
                     </div>
                     <div className="p-4 md:p-8 bg-slate-50">
                        <div className="bg-white p-2 rounded-3xl border border-slate-200 shadow-inner overflow-hidden">
                           <img
                             src={timetableImage}
                             alt="Weekly Timetable"
                             className="w-full h-auto rounded-2xl"
                           />
                        </div>
                     </div>
                  </section>
               )}

               <section className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Engineering Portfolio</h3>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{projects.length} Submissions</span>
                  </div>

                  {projects.length === 0 ? (
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-16 text-center">
                       <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No projects submitted yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Real projects mapping would go here */}
                    </div>
                  )}
               </section>
            </div>

            <div className="space-y-8">
               <section className={cn(
                  "bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl transition-all duration-700 relative overflow-hidden group",
                  activeClass ? "ring-4 ring-blue-500 ring-offset-4 ring-offset-[#FBFBFE]" : "opacity-95"
               )}>
                  <div className="relative z-10 space-y-10">
                     <div className="flex justify-between items-start">
                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-blue-400 border border-white/10">
                           <Play size={24} />
                        </div>
                        {activeClass && (
                           <div className="px-3 py-1 bg-emerald-500 text-white rounded-full text-[8px] font-black uppercase tracking-widest animate-pulse">
                              Class is Live
                           </div>
                        )}
                     </div>

                     <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                           {activeClass ? "Classroom is Active" : "Next Scheduled Session"}
                        </p>
                        {schedule[0] ? (
                           <>
                             <h4 className="text-2xl font-black text-white italic tracking-tighter leading-tight">{schedule[0].topic}</h4>
                             <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">{schedule[0].day} • {schedule[0].time}</p>
                           </>
                        ) : (
                           <p className="text-xl font-black text-white italic tracking-tighter">No upcoming sessions</p>
                        )}
                     </div>

                     <button
                        disabled={!activeClass}
                        className={cn(
                           "w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95",
                           activeClass
                              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-900/40"
                              : "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"
                        )}
                     >
                        {activeClass ? "Enter Classroom" : "Classroom opens 15 mins before session"}
                     </button>
                  </div>
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
               </section>

               <section className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                     <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">Achievements</h4>
                     <Award size={20} className="text-amber-500" />
                  </div>

                  {badges.length === 0 ? (
                    <div className="py-12 bg-slate-50 rounded-[1.5rem] text-center">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No achievements recorded yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-4">
                      {/* Real badges mapping */}
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-50">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">Program Certificates</p>
                     <p className="text-sm font-bold text-slate-400 text-center">No Certificates Available Yet</p>
                  </div>
               </section>

               <section className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm space-y-6">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                     <Phone size={20} />
                  </div>
                  <div className="space-y-2">
                     <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-tight">Student Support</h4>
                     <p className="text-sm text-slate-500 font-medium leading-relaxed">Need technical help? Launch a chat with our engineering success team.</p>
                  </div>
                  <a
                    href={process.env.NEXT_PUBLIC_WHATSAPP_LINK || "#"}
                    className="flex items-center justify-center gap-3 w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-600 transition-all shadow-lg shadow-blue-100"
                  >
                    Open WhatsApp Chat
                  </a>
               </section>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function StatBox({ label, value, icon }: { label: string, value: any, icon: any }) {
  return (
    <div className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow group">
       <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center transition-colors group-hover:bg-slate-100">
             {icon}
          </div>
       </div>
       <div>
          <p className="text-2xl font-black text-slate-900">{value}</p>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{label}</p>
       </div>
    </div>
  );
}
