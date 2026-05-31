import { Suspense } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./styles/globals.css";
import { Toaster } from "sonner";
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";
import { ScrollManagement } from "@/components/ui/ScrollManagement";
import { CookieConsent } from "@/components/ui/CookieConsent";
import { BackToTop } from "@/components/ui/BackToTop";
import { Analytics } from "@/components/ui/Analytics";

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
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
        <ScrollManagement />
        <main className="animate-in fade-in duration-1000">
          {children}
        </main>
        <BackToTop />
        <CookieConsent />
        <Toaster
          position="top-right"
          expand={true}
          closeButton
          duration={5000}
          visibleToasts={5}
          theme="dark"
          className="pointer-events-auto"
          toastOptions={{
            style: {
              background: 'rgba(2, 6, 23, 0.9)',
              backdropFilter: 'blur(24px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 1px 0 rgba(255, 255, 255, 0.05)',
              color: '#f8fafc',
            },
          }}
        />
      </body>
    </html>
  );
}
