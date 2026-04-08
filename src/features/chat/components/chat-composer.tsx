"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Send, Square } from "lucide-react";
import { useChatStore } from "@/store/chat-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const SUGGESTED_PROMPTS = [
  "What would I prioritize this week?",
  "How would I handle a difficult conversation?",
  "What are my thoughts on remote work?",
  "How do I usually approach hard decisions?",
];

export function ChatComposer() {
  const [value, setValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, isLoading, messages } = useChatStore();

  const hasMessages = messages.length > 0;

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSend = async () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;

    setValue("");
    setShowSuggestions(false);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      await sendMessage(trimmed);
    } catch {
      toast.error("Failed to send message. Please try again.");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestion = (prompt: string) => {
    setValue(prompt);
    setShowSuggestions(false);
    textareaRef.current?.focus();
  };

  return (
    <div className="space-y-3">
      {/* Suggested prompts */}
      {!hasMessages && showSuggestions && (
        <div className="flex flex-wrap gap-2 animate-fade-in">
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSuggestion(prompt)}
              className="text-xs px-3 py-1.5 rounded-full border transition-colors hover:border-[var(--accent)] hover:text-[var(--accent-text)]"
              style={{
                borderColor: "var(--border-default)",
                color: "var(--text-secondary)",
                background: "var(--bg-secondary)",
              }}
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div
        className="flex items-end gap-3 px-4 py-3 rounded-2xl border transition-colors focus-within:border-[var(--border-strong)]"
        style={{
          background: "var(--bg-secondary)",
          borderColor: "var(--border-default)",
        }}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask your twin anything…"
          rows={1}
          disabled={isLoading}
          className="flex-1 resize-none bg-transparent outline-none text-sm leading-relaxed"
          style={{
            color: "var(--text-primary)",
            caretColor: "var(--accent)",
            maxHeight: "200px",
            fontFamily: "var(--font-sans)",
          }}
        />

        <button
          onClick={isLoading ? undefined : handleSend}
          disabled={!isLoading && !value.trim()}
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-xl transition-all flex-shrink-0",
            "disabled:opacity-30 disabled:cursor-not-allowed"
          )}
          style={{
            background: value.trim() || isLoading ? "var(--accent)" : "var(--bg-tertiary)",
            color: value.trim() || isLoading ? "var(--accent-text)" : "var(--text-tertiary)",
          }}
        >
          {isLoading ? <Square size={13} fill="currentColor" /> : <Send size={13} />}
        </button>
      </div>

      {/* Footer hint — hidden on very small screens */}
      <p className="hidden sm:block text-center text-[11px]" style={{ color: "var(--text-tertiary)" }}>
        Shift+Enter for new line · Your twin speaks as you, not for you
      </p>
    </div>
  );
}
