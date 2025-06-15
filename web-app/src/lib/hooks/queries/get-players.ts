import PlayerType from "@/lib/types/type";
import {env} from "@/env";


export async function fetchPlayers(): Promise<PlayerType[]> {
    try {
        const response = await fetch(`${env.NEXT_PUBLIC_API_HOST}/players`);
        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
}