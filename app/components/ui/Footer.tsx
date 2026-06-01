"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Linkedin, Github } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Section 1: Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-8 h-8 transition-transform group-hover:scale-110">
                <Image src="/images/faicom.png" alt="CodeStart" fill className="object-contain" />
              </div>
              <span className="font-black text-xl tracking-tighter text-slate-900 uppercase">CodeStart</span>
            </Link>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-relaxed">
              Building future software engineers
            </p>
          </div>

          {/* Section 2: Quick Links */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Navigation</h4>
            <div className="flex flex-col gap-2">
              <FooterLink href="/">Home</FooterLink>
              <FooterLink href="/#curriculum">Curriculum</FooterLink>
              <FooterLink href="/register">Enrollment</FooterLink>
              <FooterLink href="/login">Student Portal</FooterLink>
            </div>
          </div>

          {/* Section 3: Contact (Minimal) */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Direct Contact</h4>
            <div className="flex flex-col gap-3">
              <a href="mailto:favmoms440@gmail.com" className="text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-2">
                <Mail size={14} className="text-blue-600" /> favmoms440@gmail.com
              </a>
              <a href="https://www.linkedin.com/in/philemon-melabah-ba0148317" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-2">
                <Linkedin size={14} className="text-blue-600" /> LinkedIn Profile
              </a>
            </div>
          </div>

          {/* Section 4: Social Icons */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Connect</h4>
            <div className="flex gap-3">
              <SocialIcon href="https://github.com/Philemoncare" icon={<Github size={18} />} />
              <SocialIcon href="https://www.linkedin.com/in/philemon-melabah-ba0148317" icon={<Linkedin size={18} />} />
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            &copy; {currentYear} CodeStart Ghana. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link href={href} className="text-[11px] font-bold text-slate-500 hover:text-blue-600 uppercase tracking-widest transition-colors">
    {children}
  </Link>
);

const SocialIcon = ({ href, icon }: { href: string; icon: any }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all active:scale-95 shadow-sm"
  >
    {icon}
  </a>
);
