import type { Metadata } from "next";
import { MemoryPanel } from "@/features/memory/components/memory-panel";
export const metadata: Metadata = { title: "Memory" };
export default function MemoryPage() { return <MemoryPanel />; }
