import type { PlayerType } from "@/lib/types/type"
import { apiClient } from "@/lib/hooks/apiClient"

export interface UpdateAllPlayersResponse {
  message: string
  players: PlayerType[]
}

export async function updateAllPlayers(): Promise<UpdateAllPlayersResponse> {
  const response = await apiClient.put<UpdateAllPlayersResponse>(`/update-players`)
  return response.data
}
