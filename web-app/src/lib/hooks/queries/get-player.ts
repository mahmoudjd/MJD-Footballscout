import {env} from "@/env";

export async function getPlayer(id: string) {
    try {
        const response = await fetch(`${env.NEXT_PUBLIC_API_HOST}/players/${id}`);
        return await response.json();
    } catch (error) {
        console.error(error);
        return null
    }
}