"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu, X, ChevronRight, Mail, LayoutDashboard, Info } from "lucide-react";
import { SCHEDULE_DISPLAY } from "@/lib/constants";

import Image from "next/image";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isStudent, setIsStudent] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      const cookies = document.cookie.split('; ');
      const hasStudentSession = cookies.some(c => c.startsWith('student_email='));
      setIsStudent(hasStudentSession);
    };

    checkAuth();
    const interval = setInterval(checkAuth, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
        setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Curriculum", href: "/#curriculum" },
    { name: "About", href: "/#about" },
    { name: "Student Portal", href: "/login" },
  ];

  if (pathname.startsWith('/portal') || pathname.startsWith('/admin') || pathname.startsWith('/student/dashboard')) return null;

  return (
    <>
      {/* Platform-wide Training Schedule Banner */}
      <div className="fixed top-0 left-0 right-0 z-[110] bg-blue-600 text-white py-2.5 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
          <Info size={14} className="animate-pulse hidden sm:block" />
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-center">
            Training begins <span className="text-blue-100">{SCHEDULE_DISPLAY.trainingStart}</span> ({SCHEDULE_DISPLAY.mode}).
            <span className="hidden md:inline ml-1 opacity-80 italic">Registration closes {SCHEDULE_DISPLAY.registrationDeadline}.</span>
          </p>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" style={{ width: '200%' }} />
      </div>

      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-[100] transition-all duration-500 isolate",
          "mt-9 sm:mt-10", // Offset for banner
          isScrolled
            ? "bg-white/90 backdrop-blur-xl border-b border-slate-200/60 py-4 shadow-sm"
            : "bg-transparent py-6 md:py-8"
        )}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="relative w-8 h-8 md:w-10 md:h-10 transition-transform group-hover:scale-110 active:scale-95">
              <Image
                src="/images/faicom.png"
                alt="CodeStart"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="font-black text-xl tracking-tighter text-slate-900 uppercase">CodeStart</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-10">
            <div className="flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:text-blue-600",
                    pathname === link.href ? "text-blue-600" : "text-slate-500"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="h-4 w-px bg-slate-200" />

            <div className="flex items-center gap-6">
              {isStudent ? (
                <Link
                  href="/student/dashboard"
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-slate-900 transition-all flex items-center gap-2"
                >
                  Dashboard <ChevronRight size={14} />
                </Link>
              ) : (
                <Link
                  href="/register"
                  className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-blue-600 transition-all"
                >
                  Join Cohort
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <div className={cn(
        "fixed inset-0 z-[150] lg:hidden transition-all duration-500",
        mobileMenuOpen ? "visible" : "invisible"
      )}>
        <div
          className={cn(
            "absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-500",
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setMobileMenuOpen(false)}
        />
        <div className={cn(
          "absolute right-0 top-0 bottom-0 w-[80%] max-w-[360px] bg-white shadow-2xl transition-transform duration-500 ease-out flex flex-col",
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}>
           <div className="p-8 flex items-center justify-between border-b border-slate-50">
              <span className="font-black text-xl tracking-tighter uppercase">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-slate-50 text-slate-400 rounded-xl">
                 <X size={20} />
              </button>
           </div>

           <div className="flex-1 p-8 space-y-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-2xl font-black text-slate-900 uppercase tracking-tight hover:text-blue-600 transition-colors"
                >
                   {link.name}
                </Link>
              ))}
           </div>

           <div className="p-8">
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-blue-100 active:scale-95 transition-all"
              >
                 Join Cohort &rarr;
              </Link>
           </div>
        </div>
      </div>
    </>
  );
};
