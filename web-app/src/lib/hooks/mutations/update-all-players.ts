import { AxiosError } from "axios";
import {PlayerType} from "@/lib/types/type";
import {apiClient} from "@/lib/hooks/api-client";

export async function updateAllPlayers(): Promise<PlayerType[]> {
  try {
    const response = await apiClient.put<PlayerType[]>(`/update-players`);
    return response.data;
  } catch (error) {
    console.error("Update all players error:", error);
    throw error instanceof AxiosError
      ? new Error(error.response?.data?.message || error.message)
      : new Error("Failed to update all players");
  }
}
