"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export const ScrollManagement = () => {
  const pathname = usePathname();

  useEffect(() => {
    // 1. Handle Homepage Refresh Logic
    // If we are on the homepage, always force a scroll to the top on initial load (refresh)
    if (pathname === "/") {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }

      // Immediate scroll for refresh
      window.scrollTo(0, 0);

      // Delayed scroll to catch any late hydration adjustments
      const timer = setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }, 50);

      return () => clearTimeout(timer);
    } else {
      // For other pages, allow normal restoration
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto';
      }
    }
  }, [pathname]);

  return null;
};
