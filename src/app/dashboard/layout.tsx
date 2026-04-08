"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, hydrate } = useAuthStore();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const ok = hydrate();
    if (!ok) router.replace("/login?reason=unauthenticated");
  }, []);

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-dvh overflow-hidden bg-[var(--bg-primary)]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — slides in on mobile, always visible on md+ */}
      <div
        className={[
          "fixed inset-y-0 left-0 z-30 transition-transform duration-200",
          "md:relative md:translate-x-0 md:z-auto md:flex-shrink-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <AppSidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Topbar onMenuClick={() => setSidebarOpen((v) => !v)} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
