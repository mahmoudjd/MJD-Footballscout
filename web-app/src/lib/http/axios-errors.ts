import axios from "axios"

type ErrorResponse = {
  error?: string
  message?: string
}

export function getAxiosErrorStatus(error: unknown): number | undefined {
  if (!axios.isAxiosError(error)) return undefined
  return error.response?.status
}

export function getAxiosErrorMessage(error: unknown): string | undefined {
  if (!axios.isAxiosError<ErrorResponse>(error)) return undefined
  return error.response?.data?.error || error.response?.data?.message
}
