/**
 * src/lib/api/chat.ts
 * ────────────────────
 * Chat endpoint wrappers.
 */
import apiClient from "./client";
import type { ChatHistoryItem, ChatRequest, ChatResponse } from "@/types";



export const chatApi = {
  sendMessage: async (data: ChatRequest): Promise<ChatResponse> => {
    const res = await apiClient.post<ChatResponse>("/chat", data);
    return res.data;
  },

  getHistory: async (limit = 50): Promise<ChatHistoryItem[]> => {
    const res = await apiClient.get<ChatHistoryItem[]>("/chat/history", {
      params: { limit },
    });
    return res.data;
  },
};
