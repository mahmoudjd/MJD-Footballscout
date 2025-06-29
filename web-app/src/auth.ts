import NextAuth, {NextAuthOptions, Session} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import {loginUser} from "@/lib/hooks/login-user";
import {refreshAccessToken} from "@/lib/hooks/queries/refresh-token";
import {z} from "zod";

export type {Session} from "next-auth"

declare module "next-auth" {
    interface User {
        id: string
        expiresAt: number
        accessToken: string
        refreshToken: string
        name: string
        email?: string
    }

    export interface Session {
        user: User
    }
}

const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: {label: "Email", type: "text"},
                password: {label: "Password", type: "password"},
            },
            async authorize(credentials) {
                try {
                    const loginData = await loginUser({
                        email: credentials?.email || "",
                        password: credentials?.password || "",
                    });

                    if (loginData) {
                        return loginData;
                    } else {
                        throw new Error("Invalid email or password");
                    }
                } catch (error) {
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({token, user}) {
            if (user) {
                token.userId = user.id;
                token.name = user.name;
                token.email = user.email;
                token.accessToken = user.accessToken;
                token.refreshToken = user.refreshToken;
                token.expiresAt = Date.now() + 60 * 60 * 1000; // 1 Stunde Ablaufzeit
            }

            const fiveMinutesInMs = 5 * 60 * 1000; // Token wird 5 Minuten vor Ablauf aktualisiert

            // @ts-ignore
            if (Date.now() > (token.expiresAt || 0) - fiveMinutesInMs) {
                try {
                    console.log("Token läuft bald ab, wird aktualisiert...");
                    const refreshedTokens = await refreshAccessToken(String(token.refreshToken));

                    token.accessToken = refreshedTokens.accessToken;
                    token.refreshToken = refreshedTokens.refreshToken || token.refreshToken; // Fallback
                    token.expiresAt = refreshedTokens.expiresAt;
                } catch (error) {
                    console.error("Failed to refresh accessToken:", error);
                    return {
                        ...token,
                        error: "RefreshAccessTokenError",
                    };
                }
            }
            return token;
        },
        async session({session, token}) {
            session.user = {
                // @ts-ignore
                id: token.userId,
                name: token.name || '',
                email: token.email || '',
                // @ts-ignore
                accessToken: token.accessToken,
                // @ts-ignore
                refreshToken: token.refreshToken,
                // @ts-ignore
                expiresAt: token.expiresAt
            };
            // console.log("Session:", session);
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt"
    },
    jwt: {
        secret: process.env.NEXTAUTH_SECRET
    }
};

const handler = NextAuth(authOptions);

export {handler as GET, handler as POST, authOptions};