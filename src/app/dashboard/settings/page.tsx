"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { memoryApi } from "@/lib/api/memory";
import { toast } from "sonner";
import {
  User, Shield, Palette, Bell, Download, Trash2,
  Server, CheckCircle, AlertCircle, LogOut, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

type Section = "profile" | "privacy" | "appearance" | "notifications" | "danger";

const SIDE_NAV: { key: Section; label: string; icon: React.ElementType }[] = [
  { key: "profile",       label: "Profile",       icon: User },
  { key: "privacy",       label: "Privacy",       icon: Shield },
  { key: "appearance",    label: "Appearance",    icon: Palette },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "danger",        label: "Danger zone",   icon: AlertCircle },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>("profile");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    document.cookie = "adt_auth_hint=; path=/; max-age=0";
    router.replace("/login");
    router.refresh();
  };

  const handleClearMemory = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    try {
      await memoryApi.deleteAll();
      toast.success("All memories cleared");
      setConfirmDelete(false);
    } catch {
      toast.error("Failed to clear memories");
    }
  };

  const handleExport = () => {
    toast.info("Export feature coming soon");
  };

  const activeNav = SIDE_NAV.find((n) => n.key === activeSection);

  const handleSelectSection = (key: Section) => {
    setActiveSection(key);
    setMobileMenuOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-6">
        <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Settings</h2>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Manage your account, privacy, and preferences.
        </p>
      </div>

      {/* Mobile: dropdown section picker */}
      <div className="sm:hidden mb-4">
        <button
          onClick={() => setMobileMenuOpen((v) => !v)}
          className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl border text-sm"
          style={{
            background: "var(--bg-elevated)",
            borderColor: "var(--border-default)",
            color: "var(--text-primary)",
          }}
        >
          <span className="flex items-center gap-2">
            {activeNav && <activeNav.icon size={14} style={{ color: "var(--accent)" }} />}
            {activeNav?.label}
          </span>
          <ChevronRight size={14} className={cn("transition-transform", mobileMenuOpen && "rotate-90")} style={{ color: "var(--text-tertiary)" }} />
        </button>
        {mobileMenuOpen && (
          <div
            className="mt-1 rounded-xl border overflow-hidden"
            style={{ background: "var(--bg-elevated)", borderColor: "var(--border-default)" }}
          >
            {SIDE_NAV.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => handleSelectSection(key)}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-left transition-colors border-b last:border-0"
                style={{
                  background: activeSection === key ? "var(--bg-tertiary)" : "transparent",
                  color: activeSection === key ? "var(--text-primary)" : "var(--text-secondary)",
                  borderColor: "var(--border-subtle)",
                }}
              >
                <Icon size={14} style={{ color: activeSection === key ? "var(--accent)" : "var(--text-tertiary)" }} />
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-6 sm:gap-8">
        {/* Side nav — desktop only */}
        <aside className="hidden sm:block w-44 flex-shrink-0">
          <nav className="space-y-0.5">
            {SIDE_NAV.map(({ key, label, icon: Icon }) => {
              const active = activeSection === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveSection(key)}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-left transition-all"
                  style={{
                    background: active ? "var(--bg-tertiary)" : "transparent",
                    color: active ? "var(--text-primary)" : "var(--text-secondary)",
                    fontWeight: active ? 500 : 400,
                  }}
                >
                  <Icon size={14} style={{ color: active ? "var(--accent)" : "var(--text-tertiary)" }} />
                  {label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-4">

          {activeSection === "profile" && (
            <SettingsCard title="Account Details">
              <Row label="Username" value={user?.username || "—"} />
              <Row label="Email"    value={user?.email    || "—"} />
              <Row label="User ID"  value={user?.id ? user.id.slice(0, 8) + "…" : "—"} />
              <Row label="Status"   value="Active" accent />
              <div className="pt-4 mt-4 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border transition-colors"
                  style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
                >
                  <LogOut size={13} />
                  Sign out
                </button>
              </div>
            </SettingsCard>
          )}

          {activeSection === "privacy" && (
            <>
              <SettingsCard title="Data & Memory">
                <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                  Your conversations, memories, and personality profile are stored privately and never shared with third parties.
                </p>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border transition-colors"
                  style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
                >
                  <Download size={13} />
                  Export my data
                </button>
              </SettingsCard>
              <SettingsCard title="Backend Status">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} style={{ color: "#16A34A" }} />
                    <span style={{ color: "var(--text-secondary)" }}>
                      Connected to{" "}
                      <code
                        className="text-xs px-1.5 py-0.5 rounded break-all"
                        style={{ background: "var(--bg-tertiary)", color: "var(--text-primary)" }}
                      >
                        {process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}
                      </code>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} style={{ color: "#16A34A" }} />
                    <span style={{ color: "var(--text-secondary)" }}>Memory encryption: end-to-end</span>
                  </div>
                </div>
              </SettingsCard>
            </>
          )}

          {activeSection === "appearance" && (
            <SettingsCard title="Theme">
              <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                Use the theme toggle in the top bar to switch between light, dark, and system themes.
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Light",  bg: "#FAFAF9", text: "#1C1917" },
                  { label: "Dark",   bg: "#1C1917", text: "#FAFAF9" },
                  { label: "System", bg: "linear-gradient(135deg,#FAFAF9 50%,#1C1917 50%)", text: "#888" },
                ].map(({ label, bg, text }) => (
                  <div
                    key={label}
                    className="rounded-xl border p-3 text-center text-xs font-medium"
                    style={{ background: bg, color: text, borderColor: "var(--border-default)" }}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </SettingsCard>
          )}

          {activeSection === "notifications" && (
            <SettingsCard title="Notifications">
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Notification preferences are not yet available in this version.
              </p>
            </SettingsCard>
          )}

          {activeSection === "danger" && (
            <>
              <SettingsCard title="Clear All Memories" danger>
                <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                  Permanently delete all stored memories. Your twin will start fresh. This cannot be undone.
                </p>
                <button
                  onClick={handleClearMemory}
                  className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border transition-all"
                  style={{
                    borderColor: confirmDelete ? "rgba(220,38,38,0.5)" : "var(--border-default)",
                    background: confirmDelete ? "rgba(220,38,38,0.08)" : "transparent",
                    color: confirmDelete ? "#DC2626" : "var(--text-secondary)",
                  }}
                >
                  <Trash2 size={13} />
                  {confirmDelete ? "Click again to confirm deletion" : "Clear all memories"}
                </button>
              </SettingsCard>

              <SettingsCard title="Delete Account" danger>
                <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                  Permanently delete your account, all data, memories, and personality profile.
                </p>
                <button
                  className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border"
                  style={{
                    borderColor: "rgba(220,38,38,0.3)",
                    color: "#DC2626",
                    background: "rgba(220,38,38,0.06)",
                  }}
                  onClick={() => toast.error("Account deletion requires contacting support")}
                >
                  <AlertCircle size={13} />
                  Delete my account
                </button>
              </SettingsCard>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingsCard({ title, children, danger }: {
  title: string; children: React.ReactNode; danger?: boolean;
}) {
  return (
    <div
      className="rounded-2xl border p-4 sm:p-5"
      style={{
        background: "var(--bg-elevated)",
        borderColor: danger ? "rgba(220,38,38,0.15)" : "var(--border-subtle)",
      }}
    >
      <h3
        className="text-sm font-semibold mb-4"
        style={{ color: danger ? "#DC2626" : "var(--text-primary)" }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className="flex items-center justify-between py-2.5 border-b last:border-0 gap-4"
      style={{ borderColor: "var(--border-subtle)" }}
    >
      <span className="text-sm flex-shrink-0" style={{ color: "var(--text-secondary)" }}>{label}</span>
      <span
        className="text-sm font-medium truncate text-right"
        style={{ color: accent ? "#16A34A" : "var(--text-primary)" }}
      >
        {value}
      </span>
    </div>
  );
}
