import {env} from "@/env";
import axios from "axios";
import {PlayerType} from "@/lib/types/type";
import {useQuery} from "@tanstack/react-query";

export async function getPlayer(id: string) {
    const response = await axios.get<PlayerType>(`${env.NEXT_PUBLIC_API_HOST}/players/${id}`);
    return response.data;
}

export function useGetPlayer({playerId}: { playerId: string }) {
    return useQuery<PlayerType>(
        {
            queryKey: ["player", {playerId}],
            queryFn: () => getPlayer(playerId)
        }
    )
}