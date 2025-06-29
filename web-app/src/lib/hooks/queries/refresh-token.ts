import {apiClient} from "@/lib/hooks/api-client";

export async function refreshAccessToken(refreshToken: string) {
    try {
        console.log("Token-Refresh wird versucht...");
        const response = await apiClient.post("/auth/refresh", { refreshToken });

        const refreshedTokens = response.data;
        console.log("Neue Tokens erhalten:", refreshedTokens);

        if (response.status === 401 || !refreshedTokens?.accessToken) {
            throw new Error("RefreshTokenError");
        }

        return {
            accessToken: refreshedTokens.accessToken,
            refreshToken: refreshedTokens.refreshToken ?? refreshToken, // Fallback
            expiresAt: Date.now() + (refreshedTokens.expiresIn || 3600) * 1000, // Ablaufzeit
        };
    } catch (error) {
        console.error("Fehler beim Refresh:", error);
        throw error;
    }
}
