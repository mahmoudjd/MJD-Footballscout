import type { z } from "zod"

export function parseApiResponse<Output>(
  schema: z.ZodType<Output>,
  data: unknown,
  resource: string,
): Output {
  const result = schema.safeParse(data)
  if (result.success) return result.data

  console.error(`[api-contract] Invalid ${resource} response`, {
    issues: result.error.issues.map(({ code, message, path }) => ({ code, message, path })),
  })
  throw new Error(`${resource} response has an unexpected format`)
}
