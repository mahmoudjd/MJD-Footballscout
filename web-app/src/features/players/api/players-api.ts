import { apiClient } from "@/lib/hooks/apiClient"
import type {
  PlayerHighlightsType,
  PlayerHistoryResponseType,
  PlayerReportsResponseType,
  PlayerStatsType,
  PlayerType,
  SimilarPlayersResponseType,
} from "@/lib/types/type"

export interface UpdateAllPlayersResponse {
  message: string
  players: PlayerType[]
}

export async function fetchPlayers() {
  const response = await apiClient.get<PlayerType[]>("/players")
  return response.data
}

export async function fetchPlayerById(playerId: string) {
  const response = await apiClient.get<PlayerType>(`/players/${playerId}`)
  return response.data
}

export async function fetchPlayerStats() {
  const response = await apiClient.get<PlayerStatsType>("/players/stats")
  return response.data
}

export async function fetchPlayerHighlights() {
  const response = await apiClient.get<PlayerHighlightsType>("/players/highlights")
  return response.data
}

export async function fetchPlayerReports(playerId: string) {
  const response = await apiClient.get<PlayerReportsResponseType>(`/players/${playerId}/reports`)
  return response.data
}

export async function fetchPlayerHistory(playerId: string, limit = 30) {
  const response = await apiClient.get<PlayerHistoryResponseType>(
    `/players/${playerId}/history?limit=${limit}`,
  )
  return response.data
}

export async function fetchSimilarPlayers(playerId: string, limit = 6) {
  const response = await apiClient.get<SimilarPlayersResponseType>(
    `/players/${playerId}/similar?limit=${limit}`,
  )
  return response.data
}

export async function savePlayer(player: PlayerType) {
  const response = await apiClient.post<PlayerType>("/players", {
    data: player,
  })
  return response.data
}

export async function updatePlayerById(playerId: string) {
  const response = await apiClient.put<PlayerType>(`/players/${playerId}`)
  return response.data
}

export async function deletePlayerById(playerId: string) {
  await apiClient.delete(`/players/${playerId}`)
}

export async function updateAllPlayers() {
  const response = await apiClient.put<UpdateAllPlayersResponse>("/update-players")
  return response.data
}
