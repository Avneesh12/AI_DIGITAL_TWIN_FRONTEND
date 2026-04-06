"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const schema = z.object({
  username: z.string()
    .min(3, "At least 3 characters")
    .max(50)
    .regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers, and underscores only"),
  email:    z.string().email("Invalid email address"),
  password: z.string().min(8, "At least 8 characters"),
});

type FormValues = z.infer<typeof schema>;

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerUser, isLoading, error, clearError } = useAuthStore();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    clearError();
    try {
      await registerUser(data);
      document.cookie = "adt_auth_hint=1; path=/; SameSite=Lax";
      router.push("/dashboard/chat");
      toast.success("Welcome — your twin is ready to learn from you");
    } catch {
      // error is already set in store
    }
  };

  const fields: { name: keyof FormValues; label: string; type: string; placeholder: string; autoComplete: string }[] = [
    { name: "username", label: "Username",  type: "text",     placeholder: "yourname",       autoComplete: "username" },
    { name: "email",    label: "Email",     type: "email",    placeholder: "you@example.com", autoComplete: "email" },
  ];

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
        Create your twin
      </h1>
      <p className="text-sm mb-7" style={{ color: "var(--text-secondary)" }}>
        Already have an account?{" "}
        <Link href="/login" className="underline underline-offset-2" style={{ color: "var(--text-primary)" }}>
          Sign in
        </Link>
      </p>

      {error && (
        <div
          className="px-4 py-3 rounded-xl text-sm mb-5 animate-fade-in"
          style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)", color: "#DC2626" }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {fields.map(({ name, label, type, placeholder, autoComplete }) => (
          <div key={name}>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              {label}
            </label>
            <input
              {...register(name)}
              type={type}
              autoComplete={autoComplete}
              placeholder={placeholder}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{
                background: "var(--bg-secondary)",
                border: `1px solid ${errors[name] ? "rgba(220,38,38,0.4)" : "var(--border-default)"}`,
                color: "var(--text-primary)",
              }}
            />
            {errors[name] && (
              <p className="text-xs mt-1" style={{ color: "#DC2626" }}>{errors[name]?.message}</p>
            )}
          </div>
        ))}

        {/* Password with toggle */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Password
          </label>
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              className="w-full px-3 py-2.5 pr-10 rounded-xl text-sm outline-none"
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

        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full py-2.5 rounded-xl text-sm font-semibold transition-all mt-2",
            "disabled:opacity-60 disabled:cursor-not-allowed"
          )}
          style={{ background: "var(--text-primary)", color: "var(--bg-primary)" }}
        >
          {isLoading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="text-center text-xs mt-6" style={{ color: "var(--text-tertiary)" }}>
        Your data is private. We never sell or share your conversations.
      </p>
    </div>
  );
}
