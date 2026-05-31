"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Github, Linkedin, Twitter, Mail, MapPin } from "lucide-react";

import Image from "next/image";

export const Footer = () => {
  const [isStudent, setIsStudent] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const cookies = document.cookie.split('; ');
      const hasStudentSession = cookies.some(c => c.startsWith('student_email='));
      setIsStudent(hasStudentSession);
    };

    checkAuth();
    const interval = setInterval(checkAuth, 5000);
    return () => clearInterval(interval);
  }, []);
  return (
    <footer className="bg-white border-t border-slate-100 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* Brand Column */}
          <div className="space-y-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-12 h-12 transition-transform group-hover:scale-105">
                <Image src="/images/faicom.png" alt="CodeStart Logo" fill className="object-contain" />
              </div>
              <span className="font-black text-2xl tracking-tighter text-slate-900 uppercase">CodeStart</span>
            </Link>
            <p className="text-slate-500 font-medium leading-relaxed max-w-xs text-sm">
              Premium software engineering training. We bridge the gap between academic theory and industry practice through hands-on project building.
            </p>
            <div className="flex items-center gap-4">
               <SocialLink href="https://github.com/Philemoncare" icon={<Github size={18} />} />
               <SocialLink href="https://www.linkedin.com/in/philemon-melabah-ba0148317" icon={<Linkedin size={18} />} />
               <SocialLink href="https://x.com/braphilemon1?s=21" icon={<Twitter size={18} />} />
               <SocialLink href="mailto:favmoms440@gmail.com" icon={<Mail size={18} />} />
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Explore</h4>
            <ul className="space-y-4">
              <FooterLink href="/" label="Home" />
              <FooterLink href={isStudent ? "/student/dashboard" : "/login"} label={isStudent ? "Dashboard" : "Student Login"} />
              <FooterLink href="/#curriculum" label="Curriculum" />
              <FooterLink href="/#faq" label="FAQ" />
              {!isStudent && <FooterLink href="/register" label="Enrollment" />}
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                 <Mail size={18} className="text-blue-600 shrink-0 mt-0.5" />
                 <span className="text-slate-600 font-bold text-sm">favmoms440@gmail.com</span>
              </li>
              <li className="flex items-start gap-3">
                 <MapPin size={18} className="text-blue-600 shrink-0 mt-0.5" />
                 <span className="text-slate-600 font-bold text-sm">Takoradi, Ghana</span>
              </li>
            </ul>
          </div>

          {/* Founder Section */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Founder</h4>
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
               <p className="text-slate-900 font-black text-sm mb-1">Philemon Melabah</p>
               <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-3">Lead Engineer</p>
               <a
                 href="https://www.linkedin.com/in/philemon-melabah-ba0148317"
                 target="_blank"
                 className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                >
                  View Profile &rarr;
               </a>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            &copy; 2026 CodeStart Ghana. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link>
            <span className="hidden sm:inline text-slate-200">|</span>
            <span className="flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
               System Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({ href, label }: { href: string; label: string }) => (
  <li>
    <Link href={href} className="text-slate-600 hover:text-blue-600 font-bold text-sm transition-colors">{label}</Link>
  </li>
);

const SocialLink = ({ href, icon }: { href: string; icon: any }) => (
  <a
    href={href}
    target="_blank"
    className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-slate-100"
  >
    {icon}
  </a>
);
