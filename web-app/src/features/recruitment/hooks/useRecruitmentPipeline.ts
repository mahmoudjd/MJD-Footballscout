import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createRecruitmentCandidate,
  deleteRecruitmentCandidate,
  fetchRecruitmentCandidates,
  fetchRecruitmentWorkspace,
  updateRecruitmentCandidate,
  updateRecruitmentWorkspace,
} from "@/features/recruitment/api/recruitment-api"
import { queryKeys } from "@/lib/react-query/query-keys"
import type { RecruitmentCandidateInputType } from "@/lib/types/type"

export function useRecruitmentCandidates(enabled = true) {
  return useQuery({
    queryKey: queryKeys.recruitment.candidates,
    queryFn: fetchRecruitmentCandidates,
    enabled,
  })
}

export function useRecruitmentPipelineMutations() {
  const queryClient = useQueryClient()
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.recruitment.candidates })
  return {
    create: useMutation({ mutationFn: createRecruitmentCandidate, onSuccess: refresh }),
    update: useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: RecruitmentCandidateInputType }) =>
        updateRecruitmentCandidate(id, payload),
      onSuccess: refresh,
    }),
    remove: useMutation({ mutationFn: deleteRecruitmentCandidate, onSuccess: refresh }),
  }
}

export function useRecruitmentWorkspace(enabled = true) {
  return useQuery({
    queryKey: queryKeys.recruitment.workspace,
    queryFn: fetchRecruitmentWorkspace,
    enabled,
  })
}

export function useRecruitmentWorkspaceMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateRecruitmentWorkspace,
    onSuccess: (workspace) => queryClient.setQueryData(queryKeys.recruitment.workspace, workspace),
  })
}
