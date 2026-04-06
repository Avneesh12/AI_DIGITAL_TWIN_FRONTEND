/**
 * src/lib/api/personality.ts
 */
import apiClient from "./client";
import type { PersonalityProfile, PersonalityUpdate } from "@/types";

export const personalityApi = {
  get: async (): Promise<PersonalityProfile> => {
    const res = await apiClient.get<PersonalityProfile>("/personality");
    return res.data;
  },

  create: async (data: PersonalityUpdate): Promise<PersonalityProfile> => {
    const res = await apiClient.post<PersonalityProfile>("/personality", data);
    return res.data;
  },

  update: async (data: PersonalityUpdate): Promise<PersonalityProfile> => {
    const res = await apiClient.patch<PersonalityProfile>("/personality", data);
    return res.data;
  },
};
