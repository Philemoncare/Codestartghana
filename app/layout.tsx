import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./styles/globals.css";
import { Toaster } from "sonner";
import { ScrollManagement } from "@/components/ui/ScrollManagement";
import { CookieConsent } from "@/components/ui/CookieConsent";
import { Footer } from "@/components/ui/Footer";
import { BackToTop } from "@/components/ui/BackToTop";
import { Suspense } from "react";
import { Analytics } from "@/components/ui/Analytics";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

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
      <body className={`${inter.variable} font-sans bg-white text-slate-900 antialiased overflow-x-hidden min-h-screen`}>
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
        <ScrollManagement />
        <main>
          {children}
        </main>
        <Footer />
        <BackToTop />
        <CookieConsent />
        <Toaster
          position="bottom-right"
          expand={false}
          richColors
          closeButton
          duration={4000}
          visibleToasts={3}
          theme="light"
          toastOptions={{
            style: {
              borderRadius: '1.25rem',
              padding: '12px 16px',
              border: '1px solid #f1f5f9',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
            className: 'font-sans font-medium',
          }}
        />
      </body>
    </html>
  );
}
