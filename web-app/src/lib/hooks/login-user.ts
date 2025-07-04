import axios from "axios"
import {env} from "@/env";

export async function loginUser({ email, password }: { email: string; password: string }) {
    try {
        const response = await axios.post(`${env.NEXT_PUBLIC_API_HOST}/auth/login`, {
            email,
            password
        });
        return response.data;
    } catch (error) {
        console.error("Login failed:", error);
        return null;
    }
}

export async function googleLogin({ email, name }: { email: string; name: string }) {
    try {
        const response = await axios.post(`${env.NEXT_PUBLIC_API_HOST}/auth/google-login`, {
            email,
            name,
        });
        return response.data;
    } catch (error) {
        console.error("Login failed:", error);
        return null;
    }
}