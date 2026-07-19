import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createShadowTeam,
  deleteShadowTeam,
  fetchShadowTeam,
  fetchShadowTeams,
  updateShadowTeam,
} from "@/features/shadow-team/api/shadow-team-api"
import { queryKeys } from "@/lib/react-query/query-keys"
import type { ShadowTeamUpdateInputType } from "@/lib/types/type"

export function useShadowTeamsQuery(enabled = true) {
  return useQuery({ queryKey: queryKeys.shadowTeams.all, queryFn: fetchShadowTeams, enabled })
}

export function useShadowTeamQuery(teamId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.shadowTeams.detail(teamId),
    queryFn: () => fetchShadowTeam(teamId),
    enabled: enabled && Boolean(teamId),
  })
}

export function useShadowTeamMutations() {
  const queryClient = useQueryClient()
  const refresh = async (teamId?: string) => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.shadowTeams.all })
    if (teamId)
      await queryClient.invalidateQueries({ queryKey: queryKeys.shadowTeams.detail(teamId) })
  }

  return {
    create: useMutation({ mutationFn: createShadowTeam, onSuccess: (team) => refresh(team._id) }),
    update: useMutation({
      mutationFn: ({ teamId, payload }: { teamId: string; payload: ShadowTeamUpdateInputType }) =>
        updateShadowTeam(teamId, payload),
      onSuccess: (team) => refresh(team._id),
    }),
    remove: useMutation({
      mutationFn: deleteShadowTeam,
      onSuccess: () => refresh(),
    }),
  }
}
