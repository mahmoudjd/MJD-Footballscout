import { apiClient } from "@/lib/hooks/api-client"
import { AuthLoginResponse } from "@/lib/hooks/login-user"

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
