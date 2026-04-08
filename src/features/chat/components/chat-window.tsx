"use client";

import { useEffect, useRef, useState } from "react";
import { useChatStore } from "@/store/chat-store";
import { useAuthStore } from "@/store/auth-store";
import { ChatMessage } from "./chat-message";
import { ChatComposer } from "./chat-composer";
import { ChatEmpty } from "./chat-empty";

export function ChatWindow() {
  const { messages, isLoading, error, loadHistory, clearError } = useChatStore();
  const { user } = useAuthStore();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  useEffect(() => {
    loadHistory().then(() => setHistoryLoaded(true));
  }, []);

  useEffect(() => {
    if (historyLoaded) {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [historyLoaded]);

  useEffect(() => {
    if (historyLoaded) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  return (
    <div className="flex flex-col h-full">
      {/* Message Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 && !isLoading ? (
          <ChatEmpty username={user?.username} />
        ) : (
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-1">
            {messages.map((msg, i) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                username={user?.username}
                isLast={i === messages.length - 1}
              />
            ))}

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
                  className="text-xs underline underline-offset-2 ml-4 flex-shrink-0"
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

      {/* Composer */}
      <div
        className="border-t flex-shrink-0"
        style={{
          background: "var(--bg-elevated)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <ChatComposer />
        </div>
      </div>
    </div>
  );
}
