import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import Image from "next/image";

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-[1000]">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 py-4 shadow-sm">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-9 h-9 md:w-10 md:h-10 transition-transform group-hover:scale-105 shrink-0">
                <Image
                  src="/images/faicom.png"
                  alt="CodeStart Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="font-black text-xl tracking-tighter text-slate-900 uppercase">CodeStart</span>
            </Link>

            <Link
              href="/"
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
            >
              <ChevronLeft size={14} />
              Back
            </Link>
          </div>
        </header>
      </div>

      <main className="flex-1 mt-20 md:mt-24">
        {children}
      </main>

      {/* Simple Footer */}
      <footer className="py-12 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest border-t border-slate-200 bg-white mt-20">
        &copy; 2026 CodeStart Ghana. All rights reserved.
      </footer>
    </div>
  );
}
