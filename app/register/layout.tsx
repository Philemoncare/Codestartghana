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
      {/* Simple Registration Header */}
      <header className="bg-white border-b border-slate-200 py-4">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-10 h-10 transition-transform group-hover:scale-105 shrink-0">
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
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-sm font-bold transition-colors"
          >
            <ChevronLeft size={16} />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      {/* Simple Footer */}
      <footer className="py-8 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
        &copy; 2026 CodeStart. All rights reserved.
      </footer>
    </div>
  );
}
