import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./styles/globals.css";
import { Toaster } from "sonner";
import { ScrollManagement } from "@/components/ui/ScrollManagement";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CodeStart | Practical Software Engineering Training",
  description: "Join a practical engineering-focused learning environment designed to help developers grow through projects, mentorship, and consistent technical practice.",
  icons: {
    icon: "/images/faicom.png",
    shortcut: "/images/faicom.png",
    apple: "/images/faicom.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-white text-slate-900 antialiased overflow-x-hidden`}>
        <ScrollManagement />
        <main className="animate-in fade-in duration-1000">
          {children}
        </main>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
