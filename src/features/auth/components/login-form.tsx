"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const schema = z.object({
  email:    z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard/chat";
  const reason = searchParams.get("reason");

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    clearError();
    try {
      await login(data);
      // Set the cookie hint for middleware
      document.cookie = "adt_auth_hint=1; path=/; SameSite=Lax";
      router.push(next);
      toast.success("Welcome back");
    } catch {
      // error is already set in store
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-8">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg"
          style={{ background: "var(--accent)" }}
        >
          <Sparkles size={15} style={{ color: "var(--accent-text)" }} />
        </div>
        <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
          Digital Twin
        </span>
      </div>

      <h1
        className="text-2xl font-semibold mb-1"
        style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
      >
        Sign in
      </h1>
      <p className="text-sm mb-7" style={{ color: "var(--text-secondary)" }}>
        Your twin is waiting.{" "}
        <Link
          href="/register"
          className="underline underline-offset-2 transition-colors"
          style={{ color: "var(--text-primary)" }}
        >
          Create account
        </Link>
      </p>

      {/* Session expiry notice */}
      {reason === "session_expired" && (
        <div
          className="px-4 py-3 rounded-xl text-sm mb-5"
          style={{
            background: "var(--accent-light)",
            border: "1px solid rgba(245,158,11,0.2)",
            color: "var(--accent-text)",
          }}
        >
          Your session expired. Please sign in again.
        </div>
      )}

      {/* Server error */}
      {error && (
        <div
          className="px-4 py-3 rounded-xl text-sm mb-5 animate-fade-in"
          style={{
            background: "rgba(220,38,38,0.08)",
            border: "1px solid rgba(220,38,38,0.2)",
            color: "#DC2626",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Email */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Email
          </label>
          <input
            {...register("email")}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
            style={{
              background: "var(--bg-secondary)",
              border: `1px solid ${errors.email ? "rgba(220,38,38,0.4)" : "var(--border-default)"}`,
              color: "var(--text-primary)",
            }}
          />
          {errors.email && (
            <p className="text-xs mt-1" style={{ color: "#DC2626" }}>{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs transition-colors"
              style={{ color: "var(--text-tertiary)" }}
            >
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full px-3 py-2.5 pr-10 rounded-xl text-sm outline-none transition-all"
              style={{
                background: "var(--bg-secondary)",
                border: `1px solid ${errors.password ? "rgba(220,38,38,0.4)" : "var(--border-default)"}`,
                color: "var(--text-primary)",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-tertiary)" }}
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs mt-1" style={{ color: "#DC2626" }}>{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full py-2.5 rounded-xl text-sm font-semibold transition-all mt-2",
            "disabled:opacity-60 disabled:cursor-not-allowed"
          )}
          style={{
            background: "var(--text-primary)",
            color: "var(--bg-primary)",
          }}
        >
          {isLoading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
