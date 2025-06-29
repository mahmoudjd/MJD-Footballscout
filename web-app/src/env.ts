import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
    client: {
        NEXT_PUBLIC_API_HOST: z.string().url("NEXT_PUBLIC_API_HOST muss eine gültige URL sein"),

    },
    server: {
        API_HOST: z.string().url("API_HOST muss eine gültige URL sein"),
        GOOGLE_CLIENT_SECRET: z.string(),
        GOOGLE_CLIENT_ID: z.string()
    },
    runtimeEnv: {
        NEXT_PUBLIC_API_HOST: process.env.NEXT_PUBLIC_API_HOST,
        API_HOST: process.env.API_HOST,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET
    },
});
