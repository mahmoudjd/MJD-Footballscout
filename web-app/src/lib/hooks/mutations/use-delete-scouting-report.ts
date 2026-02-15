import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { apiClient } from "@/lib/hooks/api-client"

interface DeleteScoutingReportInput {
  reportId: string
}

async function deleteScoutingReport(input: DeleteScoutingReportInput) {
  await apiClient.delete(`/reports/${input.reportId}`)
}

export function useDeleteScoutingReport(
  options?: UseMutationOptions<void, Error, DeleteScoutingReportInput>,
) {
  return useMutation<void, Error, DeleteScoutingReportInput>({
    ...options,
    mutationFn: deleteScoutingReport,
  })
}
