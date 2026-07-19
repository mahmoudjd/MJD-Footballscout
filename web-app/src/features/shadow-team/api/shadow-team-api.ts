import { apiClient } from "@/lib/hooks/apiClient"
import { parseApiResponse } from "@/lib/http/parse-api-response"
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
  return parseApiResponse(ShadowTeamListItemSchema.array(), response.data, "Shadow Team list")
}

export async function fetchShadowTeam(teamId: string) {
  const response = await apiClient.get<unknown>(`/shadow-teams/${teamId}`)
  return parseApiResponse(ShadowTeamDetailSchema, response.data, "Shadow Team detail")
}

export async function createShadowTeam(payload: ShadowTeamCreateInputType) {
  const response = await apiClient.post<unknown>("/shadow-teams", payload)
  return parseApiResponse(ShadowTeamSchema, response.data, "created Shadow Team")
}

export async function updateShadowTeam(teamId: string, payload: ShadowTeamUpdateInputType) {
  const response = await apiClient.put<unknown>(`/shadow-teams/${teamId}`, payload)
  return parseApiResponse(ShadowTeamSchema, response.data, "updated Shadow Team")
}

export async function deleteShadowTeam(teamId: string) {
  await apiClient.delete(`/shadow-teams/${teamId}`)
}
