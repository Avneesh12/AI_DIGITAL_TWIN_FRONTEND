import type { Metadata } from "next";
import { PersonalityOverview } from "@/features/personality/components/personality-overview";
export const metadata: Metadata = { title: "Personality" };
export default function PersonalityPage() { return <PersonalityOverview />; }
