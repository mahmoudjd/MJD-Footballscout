import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
    client: {
        NEXT_PUBLIC_API_HOST: z.string().url("NEXT_PUBLIC_API_HOST muss eine gültige URL sein"),
    },
    server: {
        API_HOST: z.string().url("API_HOST muss eine gültige URL sein"),
    },
    runtimeEnv: {
        NEXT_PUBLIC_API_HOST: process.env.NEXT_PUBLIC_API_HOST,
        API_HOST: process.env.API_HOST
    },
});
