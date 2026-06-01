"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { studentService } from "@/services/studentService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const StudentNavbar = () => {
  const pathname = usePathname();
  const router = useRouter();

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

  return (
    <nav className="sticky top-0 z-[60] bg-white/90 backdrop-blur-xl border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              <Image src="/images/faicom.png" alt="Logo" fill className="object-contain" />
            </div>
            <span className="font-black text-lg tracking-tighter text-slate-900 uppercase">CodeStart</span>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            <NavLink href="/student/dashboard" active={pathname === "/student/dashboard"}>Learning Space</NavLink>
            <NavLink href="/student/profile" active={pathname === "/student/profile"}>Account Settings</NavLink>
            <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 cursor-not-allowed">Archives</button>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 transition-all border border-slate-100"
        >
          <LogOut size={14} /> Logout
        </button>
      </div>
    </nav>
  );
};

function NavLink({ href, children, active = false }: any) {
  return (
    <Link
      href={href}
      className={cn(
        "text-[10px] font-black uppercase tracking-widest transition-colors",
        active ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
      )}
    >
      {children}
    </Link>
  );
}
