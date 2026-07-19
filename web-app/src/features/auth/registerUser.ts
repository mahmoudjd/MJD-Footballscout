import { apiClient } from "@/lib/hooks/apiClient"

export interface RegistrationResponse {
  message: string
  verificationRequired: true
  verificationUrl?: string
}

export async function registerUser({
  name,
  email,
  password,
}: {
  name: string
  email: string
  password: string
}) {
  const response = await apiClient.post<RegistrationResponse>("/auth/register", {
    name,
    email,
    password,
  })
  return response.data
}
