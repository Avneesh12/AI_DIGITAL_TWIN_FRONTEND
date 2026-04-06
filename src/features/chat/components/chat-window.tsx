"use client";

import { useEffect, useRef, useState } from "react";
import { useChatStore } from "@/store/chat-store";
import { useAuthStore } from "@/store/auth-store";
import { ChatMessage } from "./chat-message";
import { ChatComposer } from "./chat-composer";
import { ChatEmpty } from "./chat-empty";
import { cn } from "@/lib/utils";

export function ChatWindow() {
  const { messages, isLoading, error, loadHistory, clearError } = useChatStore();
  const { user } = useAuthStore();
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  // Load history on mount, then jump instantly to bottom
  useEffect(() => {
    loadHistory().then(() => setHistoryLoaded(true));
  }, []);

  // After history loads: jump instantly (no animation) so user sees latest messages
  useEffect(() => {
    if (historyLoaded) {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [historyLoaded]);

  // After each new sent/received message: smooth scroll to bottom
  useEffect(() => {
    if (historyLoaded) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  return (
    <div className="flex flex-col h-full">
      {/* ── Message Area ─────────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto"
        style={{ paddingBottom: "0" }}
      >
        {messages.length === 0 && !isLoading ? (
          <ChatEmpty username={user?.username} />
        ) : (
          <div className="max-w-3xl mx-auto px-6 py-8 space-y-1">
            {messages.map((msg, i) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                username={user?.username}
                isLast={i === messages.length - 1}
              />
            ))}

            {/* Error state */}
            {error && (
              <div
                className="flex items-center justify-between px-4 py-3 rounded-lg text-sm animate-fade-in"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid rgba(220,38,38,0.2)",
                  color: "var(--text-secondary)",
                }}
              >
                <span>{error}</span>
                <button
                  onClick={clearError}
                  className="text-xs underline underline-offset-2 ml-4 shrink-0"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Dismiss
                </button>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Composer ─────────────────────────────────────────────────────── */}
      <div
        className="border-t"
        style={{
          background: "var(--bg-elevated)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <div className="max-w-3xl mx-auto px-6 py-4">
          <ChatComposer />
        </div>
      </div>
    </div>
  );
}