"use client";

import React from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, FolderKanban, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

export const StudentBottomNav = () => {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/student/dashboard", icon: Home },
    { label: "Learn", href: "/student/learning-space", icon: BookOpen },
    { label: "Projects", href: "/student/projects", icon: FolderKanban },
    { label: "Notifications", href: "/student/notifications", icon: Bell },
    { label: "Profile", href: "/student/profile", icon: User },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-xl border-t border-slate-100 pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-full h-full transition-all active:scale-90",
                isActive ? "text-blue-600" : "text-slate-400"
              )}
            >
              <item.icon size={20} className={cn(isActive && "fill-blue-50")} />
              <span className="text-[10px] font-black uppercase tracking-tighter">
                {item.label}
              </span>
              {isActive && (
                <div className="absolute top-0 w-10 h-1 bg-blue-600 rounded-b-full" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
