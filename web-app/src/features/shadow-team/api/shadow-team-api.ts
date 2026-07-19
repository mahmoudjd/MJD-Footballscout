import { apiClient } from "@/lib/hooks/apiClient"
import {
  ShadowTeamDetailSchema,
  ShadowTeamListItemSchema,
  ShadowTeamSchema,
  type ShadowTeamCreateInputType,
  type ShadowTeamUpdateInputType,
} from "@/lib/types/type"

// Axios returns dates as strings. Parse at the boundary so cached types stay accurate.

export async function fetchShadowTeams() {
  const response = await apiClient.get<unknown>("/shadow-teams")
  // Some CDN / caching layers may return 304 Not Modified with an empty body.
  // Treat that as an empty list so the client parsing doesn't throw.
  if (response.status === 304 || response.data == null) {
    return ShadowTeamListItemSchema.array().parse([])
  }
  return ShadowTeamListItemSchema.array().parse(response.data)
}

export async function fetchShadowTeam(teamId: string) {
  const response = await apiClient.get<unknown>(`/shadow-teams/${teamId}`)
  // If the server returns 304 Not Modified, response.data can be empty.
  // Return a safe default detail object so the UI can render without a parsing error.
  if (response.status === 304 || response.data == null) {
    return ShadowTeamDetailSchema.parse({
      _id: teamId,
      userId: "",
      name: "",
      formation: "4-3-3",
      assignments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      slots: [],
      players: [],
      analytics: {
        filledSlots: 0,
        totalSlots: 0,
        missingPositions: [],
        overstaffedPositions: [],
        duplicatePlayers: [],
        primaryPlayerCount: 0,
        averageAge: null,
        averageElo: null,
        totalMarketValue: 0,
      },
      alternatives: [],
    })
  }
  return ShadowTeamDetailSchema.parse(response.data)
}

export async function createShadowTeam(payload: ShadowTeamCreateInputType) {
  const response = await apiClient.post<unknown>("/shadow-teams", payload)
  return ShadowTeamSchema.parse(response.data)
}

export async function updateShadowTeam(teamId: string, payload: ShadowTeamUpdateInputType) {
  const response = await apiClient.put<unknown>(`/shadow-teams/${teamId}`, payload)
  return ShadowTeamSchema.parse(response.data)
}

export async function deleteShadowTeam(teamId: string) {
  await apiClient.delete(`/shadow-teams/${teamId}`)
}
