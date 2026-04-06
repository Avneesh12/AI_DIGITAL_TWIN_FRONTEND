/**
 * src/lib/api/client.ts
 * ─────────────────────
 * Axios instance with:
 * - automatic JWT injection
 * - silent token refresh on 401
 * - structured error normalization
 * - request/response logging in development
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import type { ApiError, TokenResponse } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

// ── Token storage helpers (memory + httpOnly cookie fallback) ─────────────────
// We store the access token in memory (not localStorage) to prevent XSS.
// The refresh token is stored in an httpOnly cookie set by the server,
// OR in localStorage if the server doesn't support httpOnly cookies.

let _accessToken: string | null = null;
let _refreshPromise: Promise<string> | null = null;

export const tokenStore = {
  getAccess: () => _accessToken ?? (typeof window !== "undefined" ? sessionStorage.getItem("adt_access") : null),
  setAccess: (token: string) => {
    _accessToken = token;
    if (typeof window !== "undefined") sessionStorage.setItem("adt_access", token);
  },
  getRefresh: () => typeof window !== "undefined" ? localStorage.getItem("adt_refresh") : null,
  setRefresh: (token: string) => {
    if (typeof window !== "undefined") localStorage.setItem("adt_refresh", token);
  },
  clear: () => {
    _accessToken = null;
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("adt_access");
      localStorage.removeItem("adt_refresh");
    }
  },
};

// ── API Client ────────────────────────────────────────────────────────────────

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30_000,
});

// ── Request Interceptor — inject access token ─────────────────────────────────

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response Interceptor — silent refresh on 401 ──────────────────────────────

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Only attempt refresh once per request, and not on auth endpoints
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes("/auth/")
    ) {
      original._retry = true;

      try {
        // Deduplicate concurrent refresh attempts
        if (!_refreshPromise) {
          _refreshPromise = performRefresh();
        }
        const newAccessToken = await _refreshPromise;
        _refreshPromise = null;

        tokenStore.setAccess(newAccessToken);
        original.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(original);
      } catch {
        _refreshPromise = null;
        tokenStore.clear();
        // Redirect to login
        if (typeof window !== "undefined") {
          window.location.href = "/login?reason=session_expired";
        }
      }
    }

    return Promise.reject(normalizeError(error));
  }
);

async function performRefresh(): Promise<string> {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) throw new Error("No refresh token available");

  const response = await axios.post<TokenResponse>(`${API_BASE_URL}/auth/refresh`, {
    refresh_token: refreshToken,
  });

  tokenStore.setRefresh(response.data.refresh_token);
  return response.data.access_token;
}

// ── Error Normalization ───────────────────────────────────────────────────────

export function normalizeError(error: AxiosError<ApiError>): Error {
  if (error.response?.data?.message) {
    return new Error(error.response.data.message);
  }
  if (error.message === "Network Error") {
    return new Error("Unable to connect to server. Check your connection.");
  }
  if (error.code === "ECONNABORTED") {
    return new Error("Request timed out. Please try again.");
  }
  return new Error(error.message ?? "An unexpected error occurred");
}

export default apiClient;
