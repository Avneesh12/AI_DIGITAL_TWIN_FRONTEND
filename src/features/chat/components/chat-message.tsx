"use client";

import { useState } from "react";
import { Copy, Check, RefreshCw } from "lucide-react";
import { cn, formatTime, initials } from "@/lib/utils";
import { useChatStore } from "@/store/chat-store";
import type { ChatMessage as ChatMessageType } from "@/types";

interface Props {
  message: ChatMessageType;
  username?: string;
  isLast?: boolean;
}

export function ChatMessage({ message, username, isLast }: Props) {
  const [copied, setCopied] = useState(false);
  const { retryLast, isLoading } = useChatStore();
  const isUser = message.role === "user";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Typing indicator (pending assistant message)
  if (message.isPending) {
    return (
      <div className="flex gap-3 py-3 animate-fade-in">
        <Avatar isUser={false} username={username} />
        <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-tl-sm"
          style={{ background: "var(--bg-secondary)" }}>
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group flex gap-3 py-2 animate-slide-up",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <Avatar isUser={isUser} username={username} />

      <div className={cn("flex flex-col gap-1 max-w-[82%]", isUser ? "items-end" : "items-start")}>
        {/* Bubble */}
        <div
          className={cn(
            "px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "rounded-2xl rounded-tr-sm"
              : "rounded-2xl rounded-tl-sm chat-prose"
          )}
          style={
            isUser
              ? {
                  background: "var(--text-primary)",
                  color: "var(--bg-primary)",
                }
              : {
                  background: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                }
          }
        >
          {message.content || <span style={{ color: "var(--text-tertiary)" }}>…</span>}
        </div>

        {/* Meta row */}
        <div
          className={cn(
            "flex items-center gap-2 px-1 opacity-0 group-hover:opacity-100 transition-opacity",
            isUser ? "flex-row-reverse" : "flex-row"
          )}
        >
          <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
            {formatTime(message.created_at)}
          </span>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded transition-colors"
            style={{ color: "var(--text-tertiary)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-secondary)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)")}
          >
            {copied ? <Check size={11} /> : <Copy size={11} />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>

          {/* Retry — only for the last assistant message */}
          {!isUser && isLast && !isLoading && (
            <button
              onClick={retryLast}
              className="flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded transition-colors"
              style={{ color: "var(--text-tertiary)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-secondary)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)")}
            >
              <RefreshCw size={11} />
              <span>Retry</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Avatar({ isUser, username }: { isUser: boolean; username?: string }) {
  if (isUser) {
    return (
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0 mt-1"
        style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
      >
        {username ? initials(username) : "U"}
      </div>
    );
  }
  return (
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1"
      style={{ background: "var(--accent)", color: "var(--accent-text)" }}
    >
      <span className="text-[11px] font-semibold">AI</span>
    </div>
  );
}
