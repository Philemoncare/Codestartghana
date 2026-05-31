import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "../styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.className} min-h-screen bg-[#F8FAFC]`}>
      {children}
      <Toaster
        position="top-right"
        theme="dark"
        toastOptions={{
          style: {
            background: 'rgba(2, 6, 23, 0.9)',
            backdropFilter: 'blur(24px)',
            borderRadius: '24px',
            padding: '24px',
            color: '#f8fafc',
          },
        }}
      />
    </div>
  );
}
