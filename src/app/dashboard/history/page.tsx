"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Clock, MessageSquare, ChevronRight } from "lucide-react";
import { chatApi } from "@/lib/api/chat";
import { useChatStore } from "@/store/chat-store";
import { formatDate, truncate } from "@/lib/utils";
import { toast } from "sonner";

type HistoryItem = {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    chatApi.getHistory(100)
      .then((data) => setItems(data as HistoryItem[]))
      .catch(() => toast.error("Failed to load history"))
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => {
    const filtered = query
      ? items.filter((i) => i.content.toLowerCase().includes(query.toLowerCase()))
      : items;

    const groups: Record<string, HistoryItem[]> = {};
    filtered.forEach((item) => {
      const day = new Date(item.created_at).toDateString();
      if (!groups[day]) groups[day] = [];
      groups[day].push(item);
    });
    return groups;
  }, [items, query]);

  const handleContinue = () => router.push("/dashboard/chat");

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-4">
        <div className="skeleton h-10 w-full rounded-xl mb-6" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border p-4" style={{ borderColor: "var(--border-subtle)" }}>
            <div className="skeleton h-3 w-24 mb-2" />
            <div className="skeleton h-4 w-full mb-1" />
            <div className="skeleton h-3 w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Conversation History
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {items.length} messages across all sessions
          </p>
        </div>
        <button
          onClick={handleContinue}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors flex-shrink-0 hover:bg-[var(--bg-tertiary)]"
          style={{
            background: "var(--bg-secondary)",
            borderColor: "var(--border-default)",
            color: "var(--text-secondary)",
          }}
        >
          <MessageSquare size={12} />
          <span className="hidden sm:inline">Continue chatting</span>
          <span className="sm:hidden">Chat</span>
        </button>
      </div>

      {/* Search */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl border"
        style={{ background: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
      >
        <Search size={14} style={{ color: "var(--text-tertiary)" }} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search conversations…"
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: "var(--text-primary)" }}
        />
        {query && (
          <button onClick={() => setQuery("")} className="text-xs px-1" style={{ color: "var(--text-tertiary)" }}>✕</button>
        )}
      </div>

      {/* Grouped messages */}
      {Object.keys(grouped).length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <Clock size={36} style={{ color: "var(--text-tertiary)", marginBottom: "1rem" }} />
          <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            {query ? "No messages match your search" : "No conversation history yet"}
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
            Start a conversation with your twin to build history
          </p>
        </div>
      ) : (
        <div className="space-y-6 pb-8">
          {Object.entries(grouped).map(([day, dayItems]) => (
            <div key={day}>
              <p
                className="text-[11px] font-medium uppercase tracking-widest mb-3"
                style={{ color: "var(--text-tertiary)" }}
              >
                {day === new Date().toDateString() ? "Today" :
                 day === new Date(Date.now() - 86400000).toDateString() ? "Yesterday" : day}
              </p>
              <div className="space-y-2">
                {dayItems.map((item) => (
                  <button
                    key={item.id}
                    className="group w-full flex items-start gap-3 px-4 py-3 rounded-xl border transition-colors text-left hover:border-[var(--border-default)]"
                    style={{
                      background: "var(--bg-elevated)",
                      borderColor: "var(--border-subtle)",
                    }}
                    onClick={handleContinue}
                  >
                    {/* Role indicator */}
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5"
                      style={
                        item.role === "user"
                          ? { background: "var(--bg-tertiary)", color: "var(--text-secondary)" }
                          : { background: "var(--accent)", color: "var(--accent-text)" }
                      }
                    >
                      {item.role === "user" ? "U" : "T"}
                    </div>

                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm leading-relaxed truncate" style={{ color: "var(--text-primary)" }}>
                        {truncate(item.content, 120)}
                      </p>
                      <p className="text-[11px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                        {formatDate(item.created_at)}
                      </p>
                    </div>

                    <ChevronRight
                      size={14}
                      className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1"
                      style={{ color: "var(--text-tertiary)" }}
                    />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
