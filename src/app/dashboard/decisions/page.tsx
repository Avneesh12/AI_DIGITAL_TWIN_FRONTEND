"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/api/client";
import { formatDate, truncate } from "@/lib/utils";
import { GitBranch, Tag } from "lucide-react";
import { toast } from "sonner";
import type { Decision } from "@/types";

export default function DecisionsPage() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<Decision[]>("/decisions")
      .then((r) => setDecisions(r.data))
      .catch(() => toast.error("Failed to load decisions"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border p-4" style={{ borderColor: "var(--border-subtle)" }}>
            <div className="skeleton h-4 w-48 mb-2" />
            <div className="skeleton h-3 w-full mb-1" />
            <div className="skeleton h-3 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <div>
        <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Decision Log</h2>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          {decisions.length} recorded decisions · Your twin learns your reasoning patterns from these
        </p>
      </div>

      {decisions.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <GitBranch size={36} style={{ color: "var(--text-tertiary)", marginBottom: "1rem" }} />
          <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>No decisions recorded yet</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
            Ask your twin decision questions and it will learn your patterns
          </p>
        </div>
      ) : (
        <div className="space-y-3 pb-8">
          {decisions.map((d) => (
            <div
              key={d.id}
              className="rounded-2xl border p-4 sm:p-5"
              style={{ background: "var(--bg-elevated)", borderColor: "var(--border-subtle)" }}
            >
              {/* Context + date — stack on mobile, row on sm+ */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-4 mb-3">
                <p className="text-sm font-medium leading-snug" style={{ color: "var(--text-primary)" }}>
                  {truncate(d.context, 120)}
                </p>
                <span className="text-[11px] flex-shrink-0" style={{ color: "var(--text-tertiary)" }}>
                  {formatDate(d.created_at)}
                </span>
              </div>

              <div
                className="px-3 py-2 rounded-xl text-sm mb-3"
                style={{ background: "var(--accent-light)", color: "var(--accent-text)" }}
              >
                <span
                  className="text-[10px] font-medium uppercase tracking-wide block mb-0.5"
                  style={{ color: "var(--accent)" }}
                >
                  Chosen
                </span>
                {d.chosen_option}
              </div>

              {d.reasoning && (
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {truncate(d.reasoning, 200)}
                </p>
              )}

              {d.outcome && (
                <div
                  className="mt-3 pt-3 border-t text-sm"
                  style={{ borderColor: "var(--border-subtle)", color: "var(--text-tertiary)" }}
                >
                  <span className="font-medium" style={{ color: "var(--text-secondary)" }}>Outcome: </span>
                  {d.outcome}
                </div>
              )}

              {d.tags.length > 0 && (
                <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                  {d.tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 text-[10px] capitalize px-2 py-0.5 rounded-full"
                      style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}
                    >
                      <Tag size={8} />{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
