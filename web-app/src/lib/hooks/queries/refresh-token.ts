import {apiClient} from "@/lib/hooks/api-client";
import {signOut} from "next-auth/react";

export async function refreshAccessToken(refreshToken: string) {
    try {
        const response = await apiClient.post("/auth/refresh", {refreshToken});

        const refreshedTokens = response.data;

        if (response.status === 401 || !refreshedTokens?.accessToken) {
            throw new Error("RefreshTokenError");
        }

        return {
            accessToken: refreshedTokens.accessToken,
            refreshToken: refreshedTokens.refreshToken ?? refreshToken,
            expiresAt: Date.now() + (refreshedTokens.expiresIn || 3600) * 1000,
        };
    } catch (error: any) {
        console.error('Fehler beim Token-Refresh:', error);

        // When 401 → singout user and redirect to login
        if (error.response?.status === 401) {
            await signOut({callbackUrl: '/login'});
            return;
        }

        throw error;
    }
}
