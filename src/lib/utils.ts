import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a date relative to now, with smart labels for today/yesterday */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) return formatDistanceToNow(date, { addSuffix: true });
  if (isYesterday(date)) return `Yesterday at ${format(date, "HH:mm")}`;
  return format(date, "MMM d, yyyy");
}

/** Format a timestamp for inline display */
export function formatTime(dateStr: string): string {
  return format(new Date(dateStr), "HH:mm");
}

/** Truncate text with ellipsis */
export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n) + "…" : str;
}

/** Convert 0-1 float to a human label for Big Five traits */
export function traitLabel(value: number): string {
  if (value >= 0.8) return "Very High";
  if (value >= 0.6) return "High";
  if (value >= 0.4) return "Moderate";
  if (value >= 0.2) return "Low";
  return "Very Low";
}

/** Importance score → badge variant */
export function importanceVariant(score: number): "high" | "medium" | "low" {
  if (score >= 0.75) return "high";
  if (score >= 0.4)  return "medium";
  return "low";
}

/** Generate avatar initials from username */
export function initials(name: string): string {
  return name.trim().slice(0, 2).toUpperCase();
}
