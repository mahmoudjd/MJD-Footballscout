import { apiClient } from "@/lib/hooks/apiClient"
import type { AuthLoginResponse } from "@/features/auth/authApi"

export async function registerUser({
  name,
  email,
  password,
}: {
  name: string
  email: string
  password: string
}) {
  const response = await apiClient.post<AuthLoginResponse>("/auth/register", {
    name,
    email,
    password,
  })
  return response.data
}
