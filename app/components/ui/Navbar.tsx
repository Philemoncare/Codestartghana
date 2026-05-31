"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu, X, ChevronRight } from "lucide-react";

import Image from "next/image";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isStudent, setIsStudent] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      const cookies = document.cookie.split('; ');
      const hasStudentSession = cookies.some(c => c.startsWith('student_email='));
      setIsStudent(hasStudentSession);
    };

    checkAuth();
    // Listen for changes (e.g. login/logout in other tabs or through state)
    const interval = setInterval(checkAuth, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
        setIsScrolled(window.scrollY > 10);

        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        setScrollProgress(scrolled);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Curriculum", href: "/#curriculum" },
    { name: "About", href: "/#about" },
    { name: "FAQ", href: "/#faq" },
  ];

  if (pathname.startsWith('/portal') || pathname.startsWith('/student/dashboard')) return null;

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] isolate",
          isScrolled
            ? "bg-white/80 backdrop-blur-2xl border-b border-slate-200/50 py-3 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_4px_6px_-2px_rgba(0,0,0,0.05)]"
            : "bg-transparent py-5 md:py-8"
        )}
      >
        {/* Scroll Progress Bar */}
        <div className="absolute bottom-0 left-0 h-[2px] bg-blue-600 transition-all duration-300 ease-out z-[110]" style={{ width: `${scrollProgress}%` }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 group relative z-[110] min-w-0 shrink-0">
            <div className="relative w-10 h-10 md:w-12 md:h-12 transition-transform group-hover:scale-110 active:scale-95 shrink-0">
              <Image
                src="/images/faicom.png"
                alt="CodeStart Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="font-black text-xl md:text-2xl tracking-tighter text-slate-900 uppercase">CodeStart</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8 shrink-0">
            <div className="flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:text-blue-600",
                    pathname === link.href || (link.href.startsWith('/#') && pathname === '/') ? "text-blue-600" : "text-slate-500"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-4">
              {isStudent ? (
                <Link
                  href="/student/dashboard"
                  className="px-6 py-3 bg-blue-600 text-white rounded-full text-[11px] font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-slate-900 hover:shadow-slate-100 transition-all duration-300"
                >
                  Return to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-[11px] font-black uppercase tracking-widest text-slate-600 hover:text-blue-600 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-6 py-3 bg-slate-900 text-white rounded-full text-[11px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-blue-600 hover:shadow-blue-100 hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
                  >
                    Enroll Now
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-1 relative z-[110] lg:hidden shrink-0">
            {isStudent ? (
              <Link
                href="/student/dashboard"
                className="px-3 py-1.5 bg-blue-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/register"
                className="px-3 py-1.5 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all"
              >
                Enroll
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 -mr-1 text-slate-900 active:bg-slate-100 rounded-full transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X size={20} strokeWidth={2.5} /> : <Menu size={20} strokeWidth={2.5} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Premium Mobile Slide-in Menu */}
      <div
        className={cn(
          "fixed inset-0 z-[120] md:hidden transition-all duration-500",
          mobileMenuOpen ? "visible" : "invisible"
        )}
      >
        {/* Backdrop Blur Overlay */}
        <div
          className={cn(
            "absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity duration-500",
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Menu Content Drawer */}
        <div
          className={cn(
            "absolute inset-y-0 right-0 w-[85%] max-w-[320px] bg-white shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col",
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="p-8 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
              <div className="relative w-12 h-12">
                <Image src="/images/faicom.png" alt="CodeStart" fill className="object-contain" />
              </div>
              <span className="font-black text-2xl tracking-tighter text-slate-900 uppercase">CodeStart</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-slate-900 rounded-full transition-colors"
            >
              <X size={20} strokeWidth={3} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 px-8">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between py-5 border-b border-slate-50 transition-all group",
                    pathname === link.href ? "text-blue-600" : "text-slate-600"
                  )}
                >
                  <span className="text-xl font-black uppercase tracking-tight">{link.name}</span>
                  <ChevronRight size={20} className={cn("transition-transform", pathname === link.href ? "translate-x-1" : "group-hover:translate-x-1")} />
                </Link>
              ))}
              <Link
                  href={isStudent ? "/student/dashboard" : "/login"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-5 border-b border-slate-50 text-slate-600 transition-all group"
                >
                  <span className="text-xl font-black uppercase tracking-tight">
                    {isStudent ? "Student Dashboard" : "Student Login"}
                  </span>
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
          </div>

          <div className="p-8 space-y-4">
             <div className="p-6 bg-slate-50 rounded-2xl">
                {isStudent ? (
                  <>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Back to work?</p>
                    <p className="text-sm font-bold text-slate-600 mb-4">You are currently logged into the student portal.</p>
                    <Link
                      href="/student/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center w-full py-4 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-blue-100 active:scale-[0.98] transition-all"
                    >
                      Open Dashboard &rarr;
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Ready to start?</p>
                    <p className="text-sm font-bold text-slate-600 mb-4">Join our engineering-focused learning environment today.</p>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center w-full py-4 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-blue-100 active:scale-[0.98] transition-all"
                    >
                      Get Started &rarr;
                    </Link>
                  </>
                )}
             </div>
          </div>
        </div>
      </div>
    </>
  );
};
