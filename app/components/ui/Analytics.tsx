"use client";

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export const Analytics = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 1. Log Page View
    const logPageView = () => {
      const url = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

      // Simple local logging for demonstration (non-blocking)
      // In a production environment, you would send this to your backend or a tracking service.
      console.log(`[ANALYTICS] Page View: ${url} at ${new Date().toISOString()}`);

      // We could store session count in localStorage for basic conversion tracking
      const sessionCount = parseInt(localStorage.getItem('cs_session_count') || '0');
      localStorage.setItem('cs_session_count', (sessionCount + 1).toString());
    };

    logPageView();
  }, [pathname, searchParams]);

  return null;
};
