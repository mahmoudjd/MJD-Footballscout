import { useMutation, type UseMutationOptions } from "@tanstack/react-query"
import { apiClient } from "@/lib/hooks/apiClient"

interface DeleteScoutingReportInput {
  reportId: string
}

async function deleteScoutingReport(input: DeleteScoutingReportInput) {
  await apiClient.delete(`/reports/${input.reportId}`)
}

export function useDeleteScoutingReportMutation(
  options?: UseMutationOptions<void, Error, DeleteScoutingReportInput>,
) {
  return useMutation<void, Error, DeleteScoutingReportInput>({
    ...options,
    mutationFn: deleteScoutingReport,
  })
}
