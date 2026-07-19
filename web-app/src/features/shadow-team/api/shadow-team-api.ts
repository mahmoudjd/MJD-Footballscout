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
    return ShadowTeamListItemSchema.array().parse(response.data)
}

export async function fetchShadowTeam(teamId: string) {
    const response = await apiClient.get<unknown>(`/shadow-teams/${teamId}`)
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
