// ─── src/app/(auth)/login/page.tsx ───────────────────────────────────────────
// Placed here as a reference — each section below is a separate file path

export const LOGIN_PAGE = `
import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/components/login-form";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg-primary)" }}>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
`;
