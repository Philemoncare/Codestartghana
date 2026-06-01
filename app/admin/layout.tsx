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
  Settings,
  Mail
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";
import Image from "next/image";
import { SystemAlerts } from "@/components/admin/SystemAlerts";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname === '/admin') router.push('/admin/dashboard');
  }, [pathname, router]);

  useEffect(() => {
    const checkUser = async () => {
      if (pathname === '/admin/login' || pathname === '/admin/verify') {
        setLoading(false);
        return;
      }
      try {
        const result = await apiFetch('/api/auth/me');
        setUser(result.user);
        setLoading(false);
      } catch (error) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
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
    { href: "/admin/message-logs", icon: Mail, label: "Message Logs" },
    { href: "/admin/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[115] lg:hidden transition-opacity duration-300",
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={cn(
        "fixed inset-y-0 left-0 z-[120] bg-white border-r border-slate-200 flex flex-col transition-all duration-300 lg:sticky lg:top-0 lg:h-screen w-64",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="h-20 flex items-center px-6 border-b border-slate-100">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="relative w-10 h-10">
               <Image src="/images/faicom.png" alt="Logo" fill className="object-contain" />
            </div>
            <span className="font-bold text-xl tracking-tighter text-slate-900 uppercase">CodeStart</span>
          </Link>
        </div>

        <div className="flex-1 py-6 px-4 space-y-1">
           {navItems.map((item) => (
             <Link
               key={item.href}
               href={item.href}
               className={cn(
                 "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm",
                 pathname === item.href
                   ? "bg-slate-900 text-white shadow-lg"
                   : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
               )}
             >
               <item.icon size={18} />
               <span>{item.label}</span>
             </Link>
           ))}
        </div>

        <div className="p-4 border-t border-slate-100">
           <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-5 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-bold text-sm"
           >
             <LogOut size={18} />
             <span>Logout</span>
           </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col">
        <header className="h-20 flex items-center justify-between px-6 sm:px-10 bg-white border-b border-slate-200 sticky top-0 z-[100]">
           <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-600">
              <Menu size={22} />
           </button>
           <div className="flex items-center gap-6 ml-auto">
              <SystemAlerts />
              <div className="h-8 w-px bg-slate-200 hidden sm:block" />
              <div className="flex items-center gap-4">
                 <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-black text-slate-900 uppercase">{user?.email?.split('@')[0] || 'Admin'}</p>
                    <p className="text-[8px] font-bold text-blue-600 uppercase tracking-widest">{user?.role || 'Admin'}</p>
                 </div>
                 <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                    <ShieldCheck size={20} />
                 </div>
              </div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 sm:p-10 max-w-7xl mx-auto w-full">
           {children}
        </div>
      </main>
    </div>
  );
}
