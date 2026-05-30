"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

export const useNavigation = () => {
  const router = useRouter();

  const goBack = useCallback(() => {
    // In a real SaaS, you might want to track history in a context
    // For now, we use the standard browser history which router.back() utilizes.
    // We check if there's history to avoid closing the app if it's the only tab.
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }, [router]);

  return { goBack, router };
};
