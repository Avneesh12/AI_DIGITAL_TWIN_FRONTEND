"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { tokenStore } from "@/lib/api/client";

/**
 * Hydrates auth state on mount from sessionStorage/localStorage.
 * Also sets the cookie hint used by middleware for edge-level redirects.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    const ok = hydrate();
    // Set a plain cookie so Next.js middleware can detect auth state
    if (ok) {
      document.cookie = "adt_auth_hint=1; path=/; SameSite=Lax";
    } else {
      document.cookie = "adt_auth_hint=; path=/; max-age=0";
    }
  }, []);

  return <>{children}</>;
}
