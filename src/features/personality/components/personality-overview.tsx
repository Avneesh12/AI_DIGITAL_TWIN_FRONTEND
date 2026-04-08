"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Save, Sparkles, TrendingUp } from "lucide-react";
import { personalityApi } from "@/lib/api/personality";
import { traitLabel, cn } from "@/lib/utils";
import type { PersonalityProfile } from "@/types";

const schema = z.object({
  tone:                 z.string().optional(),
  communication_style:  z.string().optional(),
  decision_style:       z.string().optional(),
  persona_summary:      z.string().max(500).optional(),
  values:               z.string().optional(),
  interests:            z.string().optional(),
  openness:             z.number().min(0).max(1),
  conscientiousness:    z.number().min(0).max(1),
  extraversion:         z.number().min(0).max(1),
  agreeableness:        z.number().min(0).max(1),
  neuroticism:          z.number().min(0).max(1),
});

type FormValues = z.infer<typeof schema>;

const BIG_FIVE = [
  { key: "openness",          label: "Openness",              desc: "Curiosity, creativity, openness to new experiences" },
  { key: "conscientiousness", label: "Conscientiousness",     desc: "Organization, dependability, self-discipline" },
  { key: "extraversion",      label: "Extraversion",          desc: "Sociability, assertiveness, positive emotionality" },
  { key: "agreeableness",     label: "Agreeableness",         desc: "Cooperation, trust, empathy" },
  { key: "neuroticism",       label: "Emotional Sensitivity", desc: "Tendency toward negative emotions" },
] as const;

const TONE_OPTIONS     = ["casual", "formal", "witty", "direct", "warm", "analytical"];
const DECISION_OPTIONS = ["analytical", "intuitive", "consensus-driven", "data-driven", "instinctive"];
const STYLE_OPTIONS    = ["concise", "verbose", "bullet-heavy", "narrative", "structured"];

export function PersonalityOverview() {
  const [profile, setProfile] = useState<PersonalityProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { isDirty } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      openness: 0.5, conscientiousness: 0.5,
      extraversion: 0.5, agreeableness: 0.5, neuroticism: 0.5,
    },
  });

  const traitValues = {
    openness:          watch("openness"),
    conscientiousness: watch("conscientiousness"),
    extraversion:      watch("extraversion"),
    agreeableness:     watch("agreeableness"),
    neuroticism:       watch("neuroticism"),
  };

  useEffect(() => {
    personalityApi.get()
      .then((p) => {
        setProfile(p);
        setValue("tone", p.tone ?? "");
        setValue("communication_style", p.communication_style ?? "");
        setValue("decision_style", p.decision_style ?? "");
        setValue("persona_summary", p.persona_summary ?? "");
        setValue("values", (p.values ?? []).join(", "));
        setValue("interests", (p.interests ?? []).join(", "));
        setValue("openness", p.openness);
        setValue("conscientiousness", p.conscientiousness);
        setValue("extraversion", p.extraversion);
        setValue("agreeableness", p.agreeableness);
        setValue("neuroticism", p.neuroticism);
      })
      .catch(() => toast.error("Failed to load personality profile"))
      .finally(() => setLoading(false));
  }, []);

  const onSubmit = async (data: FormValues) => {
    setSaving(true);
    try {
      const updated = await personalityApi.update({
        tone: data.tone || undefined,
        communication_style: data.communication_style || undefined,
        decision_style: data.decision_style || undefined,
        persona_summary: data.persona_summary || undefined,
        values: data.values ? data.values.split(",").map((v) => v.trim()).filter(Boolean) : undefined,
        interests: data.interests ? data.interests.split(",").map((v) => v.trim()).filter(Boolean) : undefined,
        openness: data.openness,
        conscientiousness: data.conscientiousness,
        extraversion: data.extraversion,
        agreeableness: data.agreeableness,
        neuroticism: data.neuroticism,
      });
      setProfile(updated);
      toast.success("Personality profile updated");
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PersonalitySkeleton />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Personality Profile
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Define how your twin thinks, speaks, and decides.
          </p>
        </div>

        {profile && (
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0"
            style={{ background: "var(--accent-light)", color: "var(--accent-text)" }}
          >
            <TrendingUp size={11} />
            {Math.round(profile.trait_confidence * 100)}% confidence
          </div>
        )}
      </div>

      {profile && profile.trait_confidence > 0.1 && (
        <div
          className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm"
          style={{ background: "var(--accent-light)", border: "1px solid rgba(245,158,11,0.2)" }}
        >
          <Sparkles size={14} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 2 }} />
          <p style={{ color: "var(--accent-text)" }}>
            Your twin has auto-updated this profile from your conversations.
            Review and adjust any values below.
          </p>
        </div>
      )}

      {/* Persona Summary */}
      <Section title="Who You Are" description="A free-form description of your personality and outlook.">
        <textarea
          {...register("persona_summary")}
          rows={3}
          placeholder="A pragmatic engineer who values clarity over consensus…"
          className="w-full px-3 py-2.5 rounded-xl text-sm resize-none outline-none transition-colors"
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-default)",
            color: "var(--text-primary)",
            fontFamily: "var(--font-sans)",
          }}
        />
      </Section>

      {/* Communication */}
      <Section title="Communication" description="How you express yourself and prefer to interact.">
        {/* Stack on mobile, 2-col on sm+ */}
        <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">
          <Field label="Tone">
            <ChipSelect
              options={TONE_OPTIONS}
              value={watch("tone") ?? ""}
              onChange={(v) => setValue("tone", v, { shouldDirty: true })}
            />
          </Field>
          <Field label="Writing Style">
            <ChipSelect
              options={STYLE_OPTIONS}
              value={watch("communication_style") ?? ""}
              onChange={(v) => setValue("communication_style", v, { shouldDirty: true })}
            />
          </Field>
          <Field label="Decision Style" className="sm:col-span-2">
            <ChipSelect
              options={DECISION_OPTIONS}
              value={watch("decision_style") ?? ""}
              onChange={(v) => setValue("decision_style", v, { shouldDirty: true })}
            />
          </Field>
        </div>
      </Section>

      {/* Values & Interests */}
      <Section title="Values & Interests" description="Comma-separated. Your twin uses these to color its responses.">
        <div className="space-y-3">
          <Field label="Core Values">
            <input
              {...register("values")}
              type="text"
              placeholder="honesty, efficiency, growth, creativity"
              className="w-full px-3 py-2 rounded-xl text-sm outline-none"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-default)",
                color: "var(--text-primary)",
              }}
            />
          </Field>
          <Field label="Interests">
            <input
              {...register("interests")}
              type="text"
              placeholder="technology, philosophy, fitness, music"
              className="w-full px-3 py-2 rounded-xl text-sm outline-none"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-default)",
                color: "var(--text-primary)",
              }}
            />
          </Field>
        </div>
      </Section>

      {/* Big Five Traits */}
      <Section title="Big Five Personality Traits" description="These scores shape how your twin reasons and responds.">
        <div className="space-y-5">
          {BIG_FIVE.map(({ key, label, desc }) => {
            const value = traitValues[key];
            return (
              <div key={key}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{label}</p>
                    <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{desc}</p>
                  </div>
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
                  >
                    {traitLabel(value ?? 0.5)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] w-6 text-right flex-shrink-0" style={{ color: "var(--text-tertiary)" }}>Low</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={value ?? 0.5}
                    onChange={(e) => setValue(key, parseFloat(e.target.value), { shouldDirty: true })}
                    className="trait-slider flex-1"
                  />
                  <span className="text-[10px] w-6 flex-shrink-0" style={{ color: "var(--text-tertiary)" }}>High</span>
                </div>
                <div className="mt-1.5 h-0.5 rounded-full" style={{ background: "var(--bg-tertiary)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-200"
                    style={{ width: `${(value ?? 0.5) * 100}%`, background: "var(--accent)" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Save */}
      <div className="flex justify-end pb-6 sm:pb-8">
        <button
          type="submit"
          disabled={saving || !isDirty}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all",
            "disabled:opacity-40 disabled:cursor-not-allowed"
          )}
          style={{ background: "var(--accent)", color: "var(--accent-text)" }}
        >
          <Save size={14} />
          {saving ? "Saving…" : "Save Profile"}
        </button>
      </div>
    </form>
  );
}

function Section({ title, description, children }: {
  title: string; description: string; children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-4 sm:p-5 border"
      style={{ background: "var(--bg-elevated)", borderColor: "var(--border-subtle)" }}
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{title}</h3>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{description}</p>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children, className }: {
  label: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function ChipSelect({ options, value, onChange }: {
  options: string[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(active ? "" : opt)}
            className="text-xs px-3 py-1.5 rounded-full border transition-all capitalize"
            style={{
              background: active ? "var(--accent)" : "var(--bg-secondary)",
              borderColor: active ? "var(--accent)" : "var(--border-default)",
              color: active ? "var(--accent-text)" : "var(--text-secondary)",
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function PersonalitySkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {[200, 160, 280].map((h, i) => (
        <div key={i} className="rounded-2xl border p-5" style={{ borderColor: "var(--border-subtle)" }}>
          <div className="skeleton h-4 w-32 mb-2" />
          <div className="skeleton h-3 w-48 mb-4" />
          <div className="skeleton" style={{ height: h }} />
        </div>
      ))}
    </div>
  );
}
