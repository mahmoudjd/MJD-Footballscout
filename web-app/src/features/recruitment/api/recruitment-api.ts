import { apiClient } from "@/lib/hooks/apiClient"
import { parseApiResponse } from "@/lib/http/parse-api-response"
import {
  RecruitmentCandidateSchema,
  RecruitmentWorkspaceSchema,
  type RecruitmentCandidateInputType,
  type RecruitmentWorkspaceInputType,
} from "@/lib/types/type"

export async function fetchRecruitmentCandidates() {
  const response = await apiClient.get<unknown>("/recruitment/candidates")
  return parseApiResponse(
    RecruitmentCandidateSchema.array(),
    response.data,
    "recruitment candidate list",
  )
}

export async function createRecruitmentCandidate(payload: RecruitmentCandidateInputType) {
  const response = await apiClient.post<unknown>("/recruitment/candidates", payload)
  return parseApiResponse(
    RecruitmentCandidateSchema,
    response.data,
    "created recruitment candidate",
  )
}

export async function updateRecruitmentCandidate(
  id: string,
  payload: RecruitmentCandidateInputType,
) {
  const response = await apiClient.put<unknown>(`/recruitment/candidates/${id}`, payload)
  return parseApiResponse(
    RecruitmentCandidateSchema,
    response.data,
    "updated recruitment candidate",
  )
}

export async function deleteRecruitmentCandidate(id: string) {
  await apiClient.delete(`/recruitment/candidates/${id}`)
}

export async function fetchRecruitmentWorkspace() {
  const response = await apiClient.get<unknown>("/recruitment/workspace")
  return parseApiResponse(RecruitmentWorkspaceSchema, response.data, "recruitment workspace")
}

export async function updateRecruitmentWorkspace(payload: RecruitmentWorkspaceInputType) {
  const response = await apiClient.put<unknown>("/recruitment/workspace", payload)
  return parseApiResponse(
    RecruitmentWorkspaceSchema,
    response.data,
    "updated recruitment workspace",
  )
}
