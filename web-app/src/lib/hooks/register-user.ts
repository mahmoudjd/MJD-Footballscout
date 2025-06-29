import { apiClient} from "@/lib/hooks/api-client";
import {env} from "@/env";

export async function registerUser({name, email, password}: {name: string; email: string; password: string}) {
    const response = await apiClient.post(`${env.NEXT_PUBLIC_API_HOST}/auth/register`, {
        name,
        email,
        password
    })
    return response.data
}