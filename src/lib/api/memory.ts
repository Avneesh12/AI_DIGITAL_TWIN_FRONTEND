/**
 * src/lib/api/memory.ts
 */
import apiClient from "./client";
import type { MemoryEntry } from "@/types";

export const memoryApi = {
  list: async (limit = 50): Promise<MemoryEntry[]> => {
    const res = await apiClient.get<MemoryEntry[]>("/memory", { params: { limit } });
    return res.data;
  },

  delete: async (pointId: string): Promise<void> => {
    await apiClient.delete(`/memory/${pointId}`);
  },

  deleteAll: async (): Promise<void> => {
    await apiClient.delete("/memory");
  },
};
