import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  client: {
    NEXT_PUBLIC_API_HOST: z.string().url("NEXT_PUBLIC_API_HOST muss eine gültige URL sein"),
    NEXT_PUBLIC_ADSENSE_ENABLED: z
      .enum(["true", "false"])
      .default("false")
      .transform((value) => value === "true"),
    NEXT_PUBLIC_ADSENSE_CONSENT_READY: z
      .enum(["true", "false"])
      .default("false")
      .transform((value) => value === "true"),
    NEXT_PUBLIC_ADSENSE_CLIENT_ID: z
      .string()
      .regex(/^ca-pub-\d+$/)
      .optional(),
    NEXT_PUBLIC_ADSENSE_FOOTER_SLOT_ID: z.string().regex(/^\d+$/).optional(),
  },
  server: {
    NEXTAUTH_SECRET: z.string().min(32, "NEXTAUTH_SECRET muss mindestens 32 Zeichen lang sein"),
    GOOGLE_CLIENT_SECRET: z.string(),
    GOOGLE_CLIENT_ID: z.string(),
  },
  runtimeEnv: {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXT_PUBLIC_API_HOST: process.env.NEXT_PUBLIC_API_HOST,
    NEXT_PUBLIC_ADSENSE_ENABLED: process.env.NEXT_PUBLIC_ADSENSE_ENABLED,
    NEXT_PUBLIC_ADSENSE_CONSENT_READY: process.env.NEXT_PUBLIC_ADSENSE_CONSENT_READY,
    NEXT_PUBLIC_ADSENSE_CLIENT_ID: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID,
    NEXT_PUBLIC_ADSENSE_FOOTER_SLOT_ID: process.env.NEXT_PUBLIC_ADSENSE_FOOTER_SLOT_ID,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  },
})
