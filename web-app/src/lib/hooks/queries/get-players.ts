import PlayerType from "@/lib/types/type";
import {env} from "@/env";


export async function fetchPlayers(): Promise<PlayerType[]> {
    try {
        const response = await fetch(`${env.NEXT_PUBLIC_API_HOST}/players`, {
            headers: {
                "Accept": "application/json"
            },
            cache: 'no-store' // Disable caching to ensure fresh data
        });
        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
}
