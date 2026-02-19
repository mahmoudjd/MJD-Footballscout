import { useMutation, type UseMutationOptions } from "@tanstack/react-query"
import { apiClient } from "@/lib/hooks/apiClient"
import type { ScoutingReportInputType, ScoutingReportType } from "@/lib/types/type"

interface UpsertPlayerReportInput {
  playerId: string
  report: ScoutingReportInputType
}

async function upsertPlayerReport(input: UpsertPlayerReportInput) {
  const response = await apiClient.post<ScoutingReportType>(
    `/players/${input.playerId}/reports`,
    input.report,
  )
  return response.data
}

export function useUpsertPlayerReportMutation(
  options?: UseMutationOptions<ScoutingReportType, Error, UpsertPlayerReportInput>,
) {
  return useMutation<ScoutingReportType, Error, UpsertPlayerReportInput>({
    ...options,
    mutationFn: upsertPlayerReport,
  })
}
