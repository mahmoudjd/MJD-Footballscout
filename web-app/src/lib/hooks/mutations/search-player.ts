import { env } from "@/env"

export async function searchPlayers(name: string) {
    try {
        const response = await fetch(`${env.NEXT_PUBLIC_API_HOST}/search?name=${name}`);
        if (!response.ok) {
            throw new Error("Failed to fetch player");
        }
        return await response.json();
    } catch (err) {
        console.error(err);
    }
}