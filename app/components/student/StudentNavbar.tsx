"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, X, Home, BookOpen, Map, FolderKanban, FileText, Bell, Settings, ChevronRight } from "lucide-react";
import { studentService } from "@/services/studentService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AnnouncementBanner } from "../ui/AnnouncementBanner";

export const StudentNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const dismissed = localStorage.getItem("training_announcement_dismissed");
    if (dismissed === "true") setBannerVisible(false);

    const handleDismiss = () => setBannerVisible(false);
    window.addEventListener("announcement_dismissed", handleDismiss);
    return () => window.removeEventListener("announcement_dismissed", handleDismiss);
  }, []);

  // Close sidebar on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await studentService.logout();
      router.push("/");
      toast.success(
        <div className="flex flex-col gap-1">
          <span className="font-black text-white text-sm tracking-tight">Logout Successful</span>
          <span className="text-slate-400 text-xs font-medium">See you again soon! 👋</span>
        </div>
      );
    } catch (e) {
      router.push("/");
    }
  };

  const menuItems = [
    { label: "Dashboard", href: "/student/dashboard", icon: Home },
    { label: "Learning Space", href: "/student/learning-space", icon: BookOpen },
    { label: "Curriculum", href: "/student/curriculum", icon: Map },
    { label: "Projects", href: "/student/projects", icon: FolderKanban },
    { label: "Resources", href: "/student/resources", icon: FileText },
    { label: "Notifications", href: "/student/notifications", icon: Bell },
    { label: "Account Settings", href: "/student/profile", icon: Settings },
  ];

  return (
    <>
      <AnnouncementBanner />
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-[110] bg-white/90 backdrop-blur-xl border-b border-slate-100 h-16 md:h-20 transition-all duration-500",
        (isScrolled || !bannerVisible) ? "mt-0" : "mt-14"
      )}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-10">
            <Link href="/student/dashboard" className="flex items-center gap-2 group">
              <div className="relative w-8 h-8 md:w-9 md:h-9 transition-transform group-hover:scale-105">
                <Image src="/images/faicom.png" alt="Logo" fill className="object-contain" priority />
              </div>
              <span className="font-black text-lg md:text-xl tracking-tighter text-slate-900 uppercase">CodeStart</span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden lg:flex items-center gap-8">
              <NavLink href="/student/dashboard" active={pathname === "/student/dashboard"}>Dashboard</NavLink>
              <NavLink href="/student/learning-space" active={pathname === "/student/learning-space"}>Learn</NavLink>
              <NavLink href="/student/profile" active={pathname === "/student/profile"}>Profile</NavLink>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <button
               onClick={handleLogout}
               className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 transition-all border border-slate-100"
             >
               <LogOut size={14} /> Logout
             </button>

             {/* Hamburger Toggle */}
             <button
               onClick={() => setIsOpen(true)}
               className="p-2.5 bg-slate-900 text-white rounded-xl lg:hidden shadow-lg shadow-slate-900/10 active:scale-95 transition-all"
             >
               <Menu size={20} />
             </button>
          </div>
        </div>
      </nav>

      {/* Sidebar Navigation */}
      <div className={cn(
        "fixed inset-0 z-[150] lg:hidden transition-all duration-500",
        isOpen ? "visible" : "invisible"
      )}>
        <div
          className={cn(
            "absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-500",
            isOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setIsOpen(false)}
        />
        <aside className={cn(
          "absolute right-0 top-0 bottom-0 w-full max-w-[320px] bg-white shadow-2xl transition-transform duration-500 ease-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}>
           <div className="p-6 h-20 flex items-center justify-between border-b border-slate-50">
              <span className="font-black text-xl tracking-tighter uppercase text-slate-900">Portal Menu</span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-slate-900 transition-colors"
              >
                 <X size={20} />
              </button>
           </div>

           <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-2xl transition-all group",
                    pathname === item.href
                      ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                   <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                        pathname === item.href ? "bg-white/20" : "bg-slate-50 group-hover:bg-white"
                      )}>
                         <item.icon size={20} />
                      </div>
                      <span className="font-bold text-sm uppercase tracking-tight">{item.label}</span>
                   </div>
                   <ChevronRight size={16} className={cn("opacity-40", pathname === item.href && "opacity-100")} />
                </Link>
              ))}
           </div>

           <div className="p-6 border-t border-slate-50">
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-3 w-full py-4 bg-rose-50 text-rose-600 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-rose-600 hover:text-white transition-all active:scale-95 shadow-sm"
              >
                 <LogOut size={16} /> Sign Out of Portal
              </button>
           </div>
        </aside>
      </div>
    </>
  );
};

function NavLink({ href, children, active = false }: any) {
  return (
    <Link
      href={href}
      className={cn(
        "text-[10px] font-black uppercase tracking-widest transition-all relative py-2",
        active ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
      )}
    >
      {children}
      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full" />
      )}
    </Link>
  );
}

