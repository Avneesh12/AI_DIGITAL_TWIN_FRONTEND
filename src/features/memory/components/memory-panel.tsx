"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Trash2, Brain, Tag, Clock, AlertTriangle } from "lucide-react";
import { memoryApi } from "@/lib/api/memory";
import { formatDate, importanceVariant, truncate, cn } from "@/lib/utils";
import { toast } from "sonner";
import type { MemoryEntry } from "@/types";

const IMPORTANCE_STYLES = {
  high:   { bg: "rgba(245,158,11,0.12)", color: "var(--accent-text)",   label: "High" },
  medium: { bg: "var(--bg-tertiary)",    color: "var(--text-secondary)", label: "Medium" },
  low:    { bg: "var(--bg-tertiary)",    color: "var(--text-tertiary)",  label: "Low" },
};

export function MemoryPanel() {
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

  useEffect(() => {
    memoryApi.list()
      .then(setMemories)
      .catch(() => toast.error("Failed to load memories"))
      .finally(() => setLoading(false));
  }, []);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    memories.forEach((m) => m.topic_tags.forEach((t) => tags.add(t)));
    return [...tags].sort();
  }, [memories]);

  const filtered = useMemo(() => {
    return memories.filter((m) => {
      const matchesTag = !activeTag || m.topic_tags.includes(activeTag);
      const matchesQuery = !query || [m.user_message, m.assistant_response]
        .some((t) => t.toLowerCase().includes(query.toLowerCase()));
      return matchesTag && matchesQuery;
    });
  }, [memories, query, activeTag]);

  const handleDelete = async (pointId: string) => {
    setDeletingId(pointId);
    try {
      await memoryApi.delete(pointId);
      setMemories((prev) => prev.filter((m) => m.point_id !== pointId));
      toast.success("Memory deleted");
    } catch {
      toast.error("Failed to delete memory");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirmDeleteAll) { setConfirmDeleteAll(true); return; }
    try {
      await memoryApi.deleteAll();
      setMemories([]);
      toast.success("All memories cleared");
    } catch {
      toast.error("Failed to clear memories");
    } finally {
      setConfirmDeleteAll(false);
    }
  };

  if (loading) return <MemorySkeleton />;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Memory Bank
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {memories.length} stored {memories.length === 1 ? "memory" : "memories"} · What your twin remembers about you
          </p>
        </div>

        {memories.length > 0 && (
          <button
            onClick={handleDeleteAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0"
            style={{
              background: confirmDeleteAll ? "rgba(220,38,38,0.1)" : "var(--bg-secondary)",
              color: confirmDeleteAll ? "#DC2626" : "var(--text-tertiary)",
              border: `1px solid ${confirmDeleteAll ? "rgba(220,38,38,0.3)" : "var(--border-default)"}`,
            }}
          >
            <AlertTriangle size={12} />
            <span className="hidden sm:inline">{confirmDeleteAll ? "Confirm: clear all" : "Clear all"}</span>
            <span className="sm:hidden">{confirmDeleteAll ? "Confirm" : "Clear"}</span>
          </button>
        )}
      </div>

      {/* Search + Tag Filters */}
      <div className="space-y-3">
        <div
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl border"
          style={{ background: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
        >
          <Search size={14} style={{ color: "var(--text-tertiary)" }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search memories…"
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: "var(--text-primary)" }}
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-xs px-1" style={{ color: "var(--text-tertiary)" }}>
              ✕
            </button>
          )}
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveTag(null)}
              className="text-[11px] px-2.5 py-1 rounded-full border transition-all"
              style={{
                background: !activeTag ? "var(--accent)" : "var(--bg-secondary)",
                borderColor: !activeTag ? "var(--accent)" : "var(--border-default)",
                color: !activeTag ? "var(--accent-text)" : "var(--text-tertiary)",
              }}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className="text-[11px] px-2.5 py-1 rounded-full border transition-all capitalize"
                style={{
                  background: activeTag === tag ? "var(--accent)" : "var(--bg-secondary)",
                  borderColor: activeTag === tag ? "var(--accent)" : "var(--border-default)",
                  color: activeTag === tag ? "var(--accent-text)" : "var(--text-tertiary)",
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Memory List */}
      {filtered.length === 0 ? (
        <MemoryEmpty hasMemories={memories.length > 0} />
      ) : (
        <div className="space-y-3">
          {filtered.map((mem) => {
            const variant = importanceVariant(mem.importance_score);
            const styles = IMPORTANCE_STYLES[variant];
            const isDeleting = deletingId === mem.point_id;

            return (
              <div
                key={mem.point_id}
                className={cn("rounded-2xl border p-4 transition-all group", isDeleting && "opacity-50")}
                style={{ background: "var(--bg-elevated)", borderColor: "var(--border-subtle)" }}
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <span
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: styles.bg, color: styles.color }}
                    >
                      {styles.label}
                    </span>

                    {mem.emotional_tone && (
                      <span
                        className="text-[10px] capitalize px-2 py-0.5 rounded-full"
                        style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}
                      >
                        {mem.emotional_tone}
                      </span>
                    )}

                    {mem.topic_tags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setActiveTag(tag)}
                        className="flex items-center gap-1 text-[10px] capitalize px-2 py-0.5 rounded-full transition-colors"
                        style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}
                      >
                        <Tag size={8} />
                        {tag}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="hidden sm:flex items-center gap-1 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      <Clock size={10} />
                      {formatDate(mem.created_at)}
                    </span>
                    <button
                      onClick={() => handleDelete(mem.point_id)}
                      disabled={isDeleting}
                      className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-1 rounded"
                      style={{ color: "var(--text-tertiary)" }}
                      aria-label="Delete memory"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Exchange preview */}
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-[10px] font-medium uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>
                      You asked
                    </span>
                    <p className="mt-0.5 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {truncate(mem.user_message, 200)}
                    </p>
                  </div>
                  <div className="pt-2 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                    <span className="text-[10px] font-medium uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>
                      Twin responded
                    </span>
                    <p className="mt-0.5 leading-relaxed" style={{ color: "var(--text-primary)" }}>
                      {truncate(mem.assistant_response, 200)}
                    </p>
                  </div>
                </div>

                {/* Importance bar */}
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Importance</span>
                  <div className="flex-1 h-0.5 rounded-full" style={{ background: "var(--bg-tertiary)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${mem.importance_score * 100}%`,
                        background: "var(--accent)",
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-medium" style={{ color: "var(--text-secondary)" }}>
                    {Math.round(mem.importance_score * 100)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MemoryEmpty({ hasMemories }: { hasMemories: boolean }) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <Brain size={36} style={{ color: "var(--text-tertiary)", marginBottom: "1rem" }} />
      <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
        {hasMemories ? "No memories match your search" : "No memories yet"}
      </p>
      <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
        {hasMemories
          ? "Try a different query or remove the tag filter"
          : "Your twin builds memory from every conversation"}
      </p>
    </div>
  );
}

function MemorySkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-4">
      <div className="skeleton h-5 w-40 mb-2" />
      <div className="skeleton h-4 w-56 mb-6" />
      <div className="skeleton h-10 w-full rounded-xl mb-4" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl border p-4" style={{ borderColor: "var(--border-subtle)" }}>
          <div className="skeleton h-3 w-24 mb-3" />
          <div className="skeleton h-4 w-full mb-2" />
          <div className="skeleton h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}
