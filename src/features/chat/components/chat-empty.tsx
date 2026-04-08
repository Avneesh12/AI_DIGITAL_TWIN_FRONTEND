"use client";

import { Sparkles } from "lucide-react";

const EXAMPLES = [
  { label: "Decisions", example: "Should I take this job offer?" },
  { label: "Advice",    example: "How should I handle this conflict?" },
  { label: "Thinking",  example: "What are my views on work-life balance?" },
  { label: "Memory",    example: "What did I decide last month about X?" },
];

export function ChatEmpty({ username }: { username?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] px-4 sm:px-6 animate-fade-in">
      <div
        className="flex items-center justify-center w-14 h-14 rounded-2xl mb-6"
        style={{ background: "var(--accent-light)" }}
      >
        <Sparkles size={24} style={{ color: "var(--accent)" }} />
      </div>

      <h2
        className="text-xl font-semibold mb-2 text-center"
        style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}
      >
        {username ? `Hello, ${username}` : "Start a conversation"}
      </h2>

      <p
        className="text-sm text-center max-w-sm leading-relaxed"
        style={{ color: "var(--text-secondary)" }}
      >
        Your digital twin knows how you think, what you value, and how you make decisions.
        Ask it anything — the more you talk, the more it becomes you.
      </p>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md text-sm">
        {EXAMPLES.map(({ label, example }) => (
          <div
            key={label}
            className="px-3 py-2.5 rounded-xl border"
            style={{
              background: "var(--bg-secondary)",
              borderColor: "var(--border-subtle)",
            }}
          >
            <p
              className="text-[10px] font-medium uppercase tracking-wide mb-1"
              style={{ color: "var(--text-tertiary)" }}
            >
              {label}
            </p>
            <p className="text-xs leading-snug" style={{ color: "var(--text-secondary)" }}>
              "{example}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
