import PlayerType from "@/lib/types/type";
import {env} from "@/env";


export async function fetchPlayers(): Promise<PlayerType[]> {
    try {
        const response = await fetch(`${env.NEXT_PUBLIC_API_HOST}/players`, {
            headers: {
                "Accept": "application/json"
            }
        });
        return (await response.json()) as PlayerType[];
    } catch (error) {
        console.error(error);
        return [];
    }
}
