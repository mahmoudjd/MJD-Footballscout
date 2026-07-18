import { apiClient } from "@/lib/hooks/apiClient"
import type {
  ShadowTeamCreateInputType,
  ShadowTeamDetailType,
  ShadowTeamListItemType,
  ShadowTeamType,
  ShadowTeamUpdateInputType,
} from "@/lib/types/type"

export async function fetchShadowTeams() {
  const response = await apiClient.get<ShadowTeamListItemType[]>("/shadow-teams")
  return response.data
}

export async function fetchShadowTeam(teamId: string) {
  const response = await apiClient.get<ShadowTeamDetailType>(`/shadow-teams/${teamId}`)
  return response.data
}

export async function createShadowTeam(payload: ShadowTeamCreateInputType) {
  const response = await apiClient.post<ShadowTeamType>("/shadow-teams", payload)
  return response.data
}

export async function updateShadowTeam(teamId: string, payload: ShadowTeamUpdateInputType) {
  const response = await apiClient.put<ShadowTeamType>(`/shadow-teams/${teamId}`, payload)
  return response.data
}

export async function deleteShadowTeam(teamId: string) {
  await apiClient.delete(`/shadow-teams/${teamId}`)
}
