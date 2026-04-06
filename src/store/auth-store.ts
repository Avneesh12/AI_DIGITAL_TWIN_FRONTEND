/**
 * src/store/auth-store.ts
 * ────────────────────────
 * Global auth state. Single source of truth for authentication.
 * Uses Zustand with immer for clean mutations.
 */
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { authApi } from "@/lib/api/auth";
import { tokenStore } from "@/lib/api/client";
import type { LoginRequest, RegisterRequest, User } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  clearError: () => void;
  hydrate: () => boolean; // Restore from sessionStorage on page load
}

export const useAuthStore = create<AuthState>()(
  immer((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    login: async (data) => {
      set((s) => { s.isLoading = true; s.error = null; });
      try {
        const tokens = await authApi.login(data);
        authApi.persistTokens(tokens);
        // Decode user from token payload (or fetch /me endpoint)
        const payload = parseJwt(tokens.access_token);
        set((s) => {
          s.isAuthenticated = true;
          s.isLoading = false;
          // User details will be hydrated from /personality or a /me endpoint
          s.user = { id: payload.sub, email: data.email, username: "", is_active: true };
        });
      } catch (err: any) {
        set((s) => { s.isLoading = false; s.error = err.message; });
        throw err;
      }
    },

    register: async (data) => {
      set((s) => { s.isLoading = true; s.error = null; });
      try {
        const tokens = await authApi.register(data);
        authApi.persistTokens(tokens);
        const payload = parseJwt(tokens.access_token);
        set((s) => {
          s.isAuthenticated = true;
          s.isLoading = false;
          s.user = { id: payload.sub, email: data.email, username: data.username, is_active: true };
        });
      } catch (err: any) {
        set((s) => { s.isLoading = false; s.error = err.message; });
        throw err;
      }
    },

    logout: async () => {
      try {
        await authApi.logout(); // 👈 await the API call
      } catch {
        // proceed with local logout even if API call fails
      }
      set((s) => { s.user = null; s.isAuthenticated = false; s.error = null; });
    },

    setUser: (user) => {
      set((s) => { s.user = user; });
    },

    clearError: () => {
      set((s) => { s.error = null; });
    },

    hydrate: () => {
      const token = tokenStore.getAccess();
      if (!token) return false;
      try {
        const payload = parseJwt(token);
        if (payload.exp * 1000 < Date.now()) {
          // Token expired — attempt refresh will happen on next API call
          // For now, mark as authenticated so we can try
        }
        set((s) => {
          s.isAuthenticated = true;
          if (!s.user) {
            s.user = { id: payload.sub, email: "", username: "", is_active: true };
          }
        });
        return true;
      } catch {
        tokenStore.clear();
        return false;
      }
    },
  }))
);

// ── JWT Decode (no verification — server does that) ───────────────────────────
function parseJwt(token: string): Record<string, any> {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    throw new Error("Invalid token format");
  }
}
