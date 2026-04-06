/**
 * src/lib/api/auth.ts
 * ────────────────────
 * Auth endpoint wrappers with typed request/response.
 */
import apiClient, { tokenStore } from "./client";
import type { LoginRequest, RegisterRequest, TokenResponse, User } from "@/types";

export const authApi = {
  register: async (data: RegisterRequest): Promise<TokenResponse> => {
    const res = await apiClient.post<TokenResponse>("/auth/register", data);
    return res.data;
  },

  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const res = await apiClient.post<TokenResponse>("/auth/login", data);
    return res.data;
  },

  refresh: async (refreshToken: string): Promise<TokenResponse> => {
    const res = await apiClient.post<TokenResponse>("/auth/refresh", {
      refresh_token: refreshToken,
    });
    return res.data;
  },

  /** Persist tokens from a successful auth response */
  persistTokens: (tokens: TokenResponse) => {
    tokenStore.setAccess(tokens.access_token);
    tokenStore.setRefresh(tokens.refresh_token);
  },

  logout: () => {
    tokenStore.clear();
  },
};
