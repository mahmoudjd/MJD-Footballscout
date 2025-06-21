import { env } from "@/env";
import axios, { AxiosError } from "axios";
import {PlayerType} from "@/lib/types/type";

export async function updateAllPlayers(): Promise<PlayerType[]> {
  try {
    const response = await axios.put<PlayerType[]>(`${env.NEXT_PUBLIC_API_HOST}/update-players`);
    return response.data;
  } catch (error) {
    console.error("Update all players error:", error);
    throw error instanceof AxiosError
      ? new Error(error.response?.data?.message || error.message)
      : new Error("Failed to update all players");
  }
}
