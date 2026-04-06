"use client";

import { usePathname } from "next/navigation";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/store/auth-store";
import { useChatStore } from "@/store/chat-store";

const PAGE_TITLES: Record<string, { title: string; description: string }> = {
  "/dashboard/chat":        { title: "Chat",        description: "Talk to your digital twin" },
  "/dashboard/memory":      { title: "Memory",      description: "What your twin remembers" },
  "/dashboard/personality": { title: "Personality", description: "Who your twin thinks you are" },
  "/dashboard/decisions":   { title: "Decisions",   description: "Your past choices and reasoning" },
  "/dashboard/history":     { title: "History",     description: "Past conversations" },
  "/dashboard/settings":    { title: "Settings",    description: "Preferences and account" },
};

export function Topbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { memoriesUsed } = useChatStore();

  const page = PAGE_TITLES[pathname] ?? { title: "Dashboard", description: "" };

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const ThemeIcon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;

  return (
    <header
      className="flex items-center justify-between px-6 border-b"
      style={{
        height: "var(--topbar-height, 56px)",
        background: "var(--bg-elevated)",
        borderColor: "var(--border-subtle)",
        flexShrink: 0,
      }}
    >
      {/* Page title */}
      <div className="flex items-center gap-3">
        <div>
          <h1
            className="text-sm font-semibold leading-none"
            style={{ color: "var(--text-primary)" }}
          >
            {page.title}
          </h1>
          {page.description && (
            <p
              className="text-xs mt-0.5 leading-none"
              style={{ color: "var(--text-tertiary)" }}
            >
              {page.description}
            </p>
          )}
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Memory indicator — shows after a chat response */}
        {pathname === "/dashboard/chat" && memoriesUsed > 0 && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
            style={{
              background: "var(--accent-light)",
              color: "var(--accent-text)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {memoriesUsed} {memoriesUsed === 1 ? "memory" : "memories"} retrieved
          </div>
        )}

        {/* Theme toggle */}
        <button
          onClick={cycleTheme}
          className="flex items-center justify-center w-8 h-8 rounded-md transition-colors"
          style={{ color: "var(--text-tertiary)" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--bg-tertiary)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
          title={`Theme: ${theme}`}
        >
          <ThemeIcon size={15} />
        </button>
      </div>
    </header>
  );
}
