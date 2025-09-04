import NextAuth, {NextAuthOptions} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import {env} from "@/env";
import {googleLogin, loginUser} from "@/lib/hooks/login-user";
import {refreshAccessToken} from "@/lib/hooks/queries/refresh-token";

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
        GoogleProvider({
            clientId: env.GOOGLE_CLIENT_ID!,
            clientSecret: env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            }
        }),
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
        async signIn({account, profile}) {
            if (account?.provider === "google") {
                return !!profile?.email
            }
            // The endpoint doesn't exist, so we'll just return true to allow sign-in
            // In a production app, you would implement proper user lookup/creation
            return true;
        },
        async jwt({token, user, account}) {
            if (account?.provider === "google") {
                const name = user?.name
                const googleUser = await googleLogin({
                    email: user?.email!,
                    name: name
                })
                console.log("Google-User:", googleUser);
                token.userId = googleUser.id;
                token.name = googleUser?.name;
                token.email = googleUser.email;
                token.accessToken = googleUser?.accessToken;
                token.refreshToken = googleUser?.refreshToken;
                token.expiresAt = Date.now() + 60 * 60 * 1000;
            } else if (user) {
                token.userId = user.id;
                token.name = user.name;
                token.email = user.email;
                token.accessToken = user.accessToken;
                token.refreshToken = user.refreshToken;
                token.expiresAt = Date.now() + 60 * 60 * 1000;
            }

            const fiveMinutesInMs = 5 * 60 * 1000;

            // @ts-ignore
            if (Date.now() > (token.expiresAt || 0) - fiveMinutesInMs) {
                try {
                    const refreshedTokens = await refreshAccessToken(String(token.refreshToken));

                    token.accessToken = refreshedTokens?.accessToken;
                    token.refreshToken = refreshedTokens?.refreshToken || token.refreshToken;
                    token.expiresAt = refreshedTokens?.expiresAt;
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
            (session as any).error = (token as any)?.error
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