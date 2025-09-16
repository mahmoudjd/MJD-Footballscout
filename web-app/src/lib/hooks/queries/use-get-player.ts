import {env} from "@/env";
import {PlayerType} from "@/lib/types/type";
import {useQuery} from "@tanstack/react-query";
import {apiClient} from "@/lib/hooks/api-client";

export async function getPlayer(id: string) {
    const response = await apiClient.get<PlayerType>(`/players/${id}`);
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