import type { Metadata } from "next";
import { RegisterForm } from "@/features/auth/components/register-form";
export const metadata: Metadata = { title: "Create account" };
export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg-primary)" }}>
      <RegisterForm />
    </div>
  );
}
