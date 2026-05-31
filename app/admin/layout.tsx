"use client";

import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Calendar,
  LogOut,
  Loader2,
  ShieldCheck,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Settings,
  Bell,
  Search,
  ExternalLink,
  GraduationCap
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";
import Image from "next/image";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Redirect from root /admin to dashboard
  useEffect(() => {
    if (pathname === '/admin') router.push('/admin/dashboard');
  }, [pathname, router]);

  // Auth Protection - strictly handled by middleware, but layout verifies for UI state
  useEffect(() => {
    const checkUser = async () => {
      // If we're on the login or verify page, don't check/redirect
      if (pathname === '/admin/login' || pathname === '/admin/verify') {
        setLoading(false);
        return;
      }

      try {
        const result = await apiFetch('/api/auth/me');
        setUser(result.user);
        setLoading(false);
      } catch (error) {
        // Unauthenticated - middleware should handle this, but let's be safe
        router.push("/admin/login");
      }
    };
    checkUser();
  }, [pathname, router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      router.push("/admin/login");
    } catch (e) {
      router.push("/admin/login");
    }
  };

  // If loading or on login page, render without sidebar
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  if (pathname === '/admin/login' || pathname === '/admin/verify') {
    return <>{children}</>;
  }

  const navItems = [
    { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/registrations", icon: Users, label: "Registrations" },
    { href: "/admin/payments", icon: CreditCard, label: "Payments" },
    { href: "/admin/timetable", icon: Calendar, label: "Timetable" },
    { href: "/admin/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      {/* Sidebar Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[115] lg:hidden transition-opacity duration-500",
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Modern Collapsible Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-[120] bg-white border-r border-slate-200 flex flex-col transition-all duration-500 lg:sticky lg:top-0 lg:h-screen",
        sidebarOpen ? "translate-x-0 w-[80%] max-w-[280px]" : "-translate-x-full lg:translate-x-0",
        isCollapsed ? "w-20" : "w-72"
      )}>
        {/* Header */}
        <div className={cn(
          "h-20 flex items-center px-6 border-b border-slate-100 shrink-0",
          isCollapsed ? "justify-center" : "justify-start"
        )}>
          <Link href="/admin/dashboard" className="flex items-center gap-0 overflow-hidden group">
            <div className={cn(
               "relative transition-all duration-500",
               isCollapsed ? "w-12 h-12" : "w-16 h-16"
            )}>
               <Image src="/images/faicom.png" alt="Logo" fill className="object-contain transition-transform group-hover:scale-110" />
            </div>
            {!isCollapsed && (
              <div className="leading-none whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-500">
                 <span className="font-bold text-2xl block tracking-tighter text-slate-900 uppercase">CodeStart</span>
                 <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest">Admin Control</span>
              </div>
            )}
          </Link>
          {!isCollapsed && (
             <button onClick={() => setIsCollapsed(true)} className="hidden lg:flex ml-auto p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                <ChevronLeft size={18} />
             </button>
          )}
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-slate-900">
            <X size={20} />
          </button>
        </div>

        {/* Nav Items */}
        <div className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
           {isCollapsed && (
             <button onClick={() => setIsCollapsed(false)} className="hidden lg:flex mx-auto mb-6 p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl">
               <ChevronRight size={20} />
             </button>
           )}
           {navItems.map((item) => (
             <Link
               key={item.href}
               href={item.href}
               className={cn(
                 "flex items-center gap-3.5 rounded-xl transition-all group relative",
                 isCollapsed ? "justify-center p-3" : "px-4 py-3.5",
                 pathname === item.href
                   ? "bg-blue-600 text-white shadow-xl shadow-blue-100"
                   : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
               )}
             >
               <item.icon size={20} className={cn("shrink-0", pathname === item.href ? "text-white" : "text-slate-400 group-hover:text-blue-600")} />
               {!isCollapsed && <span className="font-bold text-[13px] tracking-tight">{item.label}</span>}

               {isCollapsed && (
                  <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-x-[-10px] group-hover:translate-x-0 transition-all z-[130] whitespace-nowrap shadow-xl">
                    {item.label}
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                  </div>
               )}
             </Link>
           ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 space-y-2">
           <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 w-full rounded-xl transition-all font-bold text-sm",
              isCollapsed ? "justify-center p-3 text-slate-400 hover:text-red-600 hover:bg-red-50" : "px-5 py-3.5 text-slate-500 hover:text-red-600 hover:bg-red-50"
            )}
           >
             <LogOut size={20} />
             {!isCollapsed && <span>Logout</span>}
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-6 sm:px-10 bg-white/50 backdrop-blur-md border-b border-slate-200 sticky top-0 z-[100]">
           <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                 <Menu size={22} />
              </button>
              <h2 className="font-black text-slate-900 uppercase tracking-tight hidden sm:block">
                {navItems.find(item => item.href === pathname)?.label || "Administrative Area"}
              </h2>
           </div>

           <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 pr-4 border-r border-slate-200 hidden xs:flex">
                 <div className="text-right">
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">
                       {user?.email?.split('@')[0] || 'Admin'}
                    </p>
                    <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">
                       {user?.role || 'Master Admin'}
                    </p>
                 </div>
                 <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                    <ShieldCheck size={20} />
                 </div>
              </div>
              <Link href="/" target="_blank" className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                <ExternalLink size={20} />
              </Link>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 sm:p-10 max-w-7xl mx-auto w-full animate-fade-in">
           {children}
        </div>
      </main>
    </div>
  );
}
