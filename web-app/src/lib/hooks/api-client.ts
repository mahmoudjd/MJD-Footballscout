

import axios from "axios"
import { env } from "@/env";
import {getSession} from "next-auth/react";

const apiClient = axios.create({
    baseURL: env.NEXT_PUBLIC_API_HOST
})


apiClient.interceptors.request.use(async (config)=> {
    const session = await getSession()
    const accessToken= session?.user.accessToken

    if (accessToken) {
        config.headers.Authorization= `Bearer ${accessToken}`
    }

    return config
})

export { apiClient }