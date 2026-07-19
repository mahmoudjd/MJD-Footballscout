import { apiClient } from "@/lib/hooks/apiClient"
import {
  RecruitmentCandidateSchema,
  RecruitmentWorkspaceSchema,
  type RecruitmentCandidateInputType,
  type RecruitmentWorkspaceInputType,
} from "@/lib/types/type"

export async function fetchRecruitmentCandidates() {
  const response = await apiClient.get<unknown>("/recruitment/candidates")
  return RecruitmentCandidateSchema.array().parse(response.data)
}

export async function createRecruitmentCandidate(payload: RecruitmentCandidateInputType) {
  const response = await apiClient.post<unknown>("/recruitment/candidates", payload)
  return RecruitmentCandidateSchema.parse(response.data)
}

export async function updateRecruitmentCandidate(
  id: string,
  payload: RecruitmentCandidateInputType,
) {
  const response = await apiClient.put<unknown>(`/recruitment/candidates/${id}`, payload)
  return RecruitmentCandidateSchema.parse(response.data)
}

export async function deleteRecruitmentCandidate(id: string) {
  await apiClient.delete(`/recruitment/candidates/${id}`)
}

export async function fetchRecruitmentWorkspace() {
  const response = await apiClient.get<unknown>("/recruitment/workspace")
  return RecruitmentWorkspaceSchema.parse(response.data)
}

export async function updateRecruitmentWorkspace(payload: RecruitmentWorkspaceInputType) {
  const response = await apiClient.put<unknown>("/recruitment/workspace", payload)
  return RecruitmentWorkspaceSchema.parse(response.data)
}
