"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquare, Brain, Cpu, GitBranch, Clock, Settings,
  ChevronRight, Plus, Sparkles, LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useChatStore } from "@/store/chat-store";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard/chat",        label: "Chat",        icon: MessageSquare, badge: null },
  { href: "/dashboard/memory",      label: "Memory",      icon: Brain,         badge: null },
  { href: "/dashboard/personality", label: "Personality", icon: Cpu,           badge: null },
  { href: "/dashboard/decisions",   label: "Decisions",   icon: GitBranch,     badge: null },
  { href: "/dashboard/history",     label: "History",     icon: Clock,         badge: null },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { startNewSession } = useChatStore();
  const router = useRouter();

const handleLogout = async () => {
  await logout(); // 👈 await
  document.cookie = "adt_auth_hint=; path=/; max-age=0"; // 👈 clear cookie
  router.replace("/login");
  router.refresh();
};

  const handleNewChat = () => {
    startNewSession();
    router.push("/dashboard/chat");
  };

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "AI";

  return (
    <aside
      className="flex flex-col h-full border-r"
      style={{
        width: "var(--sidebar-width, 240px)",
        background: "var(--bg-elevated)",
        borderColor: "var(--border-subtle)",
        flexShrink: 0,
      }}
    >
      {/* ── Logo ─────────────────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-2.5 px-5 h-14 border-b"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div
          className="flex items-center justify-center w-7 h-7 rounded-md text-xs font-semibold"
          style={{ background: "var(--accent)", color: "var(--accent-text)" }}
        >
          <Sparkles size={14} />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Digital Twin
          </p>
          <p className="text-[10px] leading-none" style={{ color: "var(--text-tertiary)" }}>
            AI Personal Oracle
          </p>
        </div>
      </div>

      {/* ── New Chat Button ───────────────────────────────────────────────── */}
      <div className="px-3 pt-4 pb-2">
        <button
          onClick={handleNewChat}
          className="flex items-center justify-between w-full px-3 py-2 rounded-md text-sm font-medium transition-colors"
          style={{
            background: "var(--accent-light)",
            color: "var(--accent-text)",
          }}
        >
          <span className="flex items-center gap-2">
            <Plus size={14} />
            New conversation
          </span>
          <ChevronRight size={12} className="opacity-50" />
        </button>
      </div>

      {/* ── Navigation ───────────────────────────────────────────────────── */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        <p
          className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-widest"
          style={{ color: "var(--text-tertiary)" }}
        >
          Workspace
        </p>
        {NAV_ITEMS.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-150",
                "group relative"
              )}
              style={{
                background: active ? "var(--bg-tertiary)" : "transparent",
                color: active ? "var(--text-primary)" : "var(--text-secondary)",
              }}
              onMouseEnter={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.background = "var(--bg-secondary)";
              }}
              onMouseLeave={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              {/* Active indicator */}
              {active && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                  style={{ background: "var(--accent)" }}
                />
              )}
              <Icon
                size={15}
                style={{ color: active ? "var(--accent)" : "var(--text-tertiary)" }}
              />
              <span className="flex-1">{label}</span>
              {badge && (
                <span
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                  style={{ background: "var(--accent-light)", color: "var(--accent-text)" }}
                >
                  {badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-4">
          <p
            className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-widest"
            style={{ color: "var(--text-tertiary)" }}
          >
            Account
          </p>
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            style={{
              color: pathname === "/dashboard/settings" ? "var(--text-primary)" : "var(--text-secondary)",
              background: pathname === "/dashboard/settings" ? "var(--bg-tertiary)" : "transparent",
            }}
          >
            <Settings size={15} style={{ color: "var(--text-tertiary)" }} />
            Settings
          </Link>
        </div>
      </nav>

      {/* ── User Footer ──────────────────────────────────────────────────── */}
      <div
        className="p-3 border-t"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div
          className="flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors group"
          style={{ color: "var(--text-primary)" }}
        >
          {/* Avatar */}
          <div
            className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold shrink-0"
            style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.username || "User"}</p>
            <p className="text-[11px] truncate" style={{ color: "var(--text-tertiary)" }}>
              {user?.email || ""}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-[var(--bg-tertiary)]"
            title="Sign out"
          >
            <LogOut size={13} style={{ color: "var(--text-tertiary)" }} />
          </button>
        </div>
      </div>
    </aside>
  );
}
