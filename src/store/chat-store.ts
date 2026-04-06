/**
 * src/store/chat-store.ts
 * ────────────────────────
 * Manages the active chat session, message list, and send state.
 */
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { chatApi } from "@/lib/api/chat";
import type { ChatMessage } from "@/types";

interface ChatState {
  messages: ChatMessage[];
  sessionId: string | null;
  isLoading: boolean;
  error: string | null;
  memoriesUsed: number;
  tokensUsed: number;

  sendMessage: (content: string) => Promise<void>;
  loadHistory: () => Promise<void>;
  startNewSession: () => void;
  retryLast: () => Promise<void>;
  clearError: () => void;
}

export const useChatStore = create<ChatState>()(
  immer((set, get) => ({
    messages: [],
    sessionId: null,
    isLoading: false,
    error: null,
    memoriesUsed: 0,
    tokensUsed: 0,

    sendMessage: async (content) => {
      const { sessionId, messages } = get();

      // Optimistic UI: add user message immediately
      const userMsg: ChatMessage = {
        id: `optimistic-${Date.now()}`,
        role: "user",
        content,
        created_at: new Date().toISOString(),
      };

      // Add pending assistant message (shows typing indicator)
      const pendingMsg: ChatMessage = {
        id: `pending-${Date.now()}`,
        role: "assistant",
        content: "",
        created_at: new Date().toISOString(),
        isPending: true,
      };

      set((s) => {
        s.messages.push(userMsg, pendingMsg);
        s.isLoading = true;
        s.error = null;
      });

      try {
        const res = await chatApi.sendMessage({
          message: content,
          session_id: sessionId ?? undefined,
        });

        set((s) => {
          // Remove pending, add real response
          s.messages = s.messages.filter((m) => !m.isPending);
          s.messages.push({
            id: res.chat_id,
            role: "assistant",
            content: res.response,
            created_at: new Date().toISOString(),
          });
          s.sessionId = res.session_id;
          s.isLoading = false;
          s.memoriesUsed = res.memories_used;
          s.tokensUsed = res.tokens_used;
        });
      } catch (err: any) {
        set((s) => {
          s.messages = s.messages.filter((m) => !m.isPending);
          s.isLoading = false;
          s.error = err.message;
        });
        throw err;
      }
    },

    loadHistory: async () => {
      set((s) => { s.isLoading = true; });
      try {
        const history = await chatApi.getHistory();
        set((s) => {
          // Sort oldest → newest so latest message sits at the bottom
          const sorted = [...history].sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
          s.messages = sorted.map((h) => ({
            id: h.id,
            role: h.role as "user" | "assistant",
            content: h.content,
            created_at: h.created_at,
          }));
          s.isLoading = false;
        });
      } catch (err: any) {
        set((s) => { s.isLoading = false; s.error = err.message; });
      }
    },

    startNewSession: () => {
      set((s) => {
        s.messages = [];
        s.sessionId = null;
        s.error = null;
        s.memoriesUsed = 0;
      });
    },

    retryLast: async () => {
      const { messages, sendMessage } = get();
      const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
      if (lastUserMsg) {
        // Remove last assistant message if it exists
        set((s) => {
          const lastIdx = [...s.messages].reverse().findIndex((m) => m.role === "assistant");
          if (lastIdx !== -1) {
            s.messages.splice(s.messages.length - 1 - lastIdx, 1);
          }
          // Also remove the user message we'll re-add
          const userIdx = [...s.messages].reverse().findIndex((m) => m.role === "user");
          if (userIdx !== -1) {
            s.messages.splice(s.messages.length - 1 - userIdx, 1);
          }
        });
        await sendMessage(lastUserMsg.content);
      }
    },

    clearError: () => {
      set((s) => { s.error = null; });
    },
  }))
);