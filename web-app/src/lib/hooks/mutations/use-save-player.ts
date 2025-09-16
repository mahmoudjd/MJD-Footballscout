import {useMutation, UseMutationOptions} from "@tanstack/react-query";
import {PlayerType} from "@/lib/types/type";
import axios from "axios";
import {env} from "@/env";
import {apiClient} from "@/lib/hooks/api-client";

interface SavePlayerMutationType {
    player: PlayerType
}
export function useSavePlayer(options?: UseMutationOptions<PlayerType, Error, SavePlayerMutationType>) {
    return useMutation<PlayerType, Error, SavePlayerMutationType>({
        ...options,
        mutationFn: (input) => savePlayer(input.player)
    });
}

async function savePlayer(player: PlayerType) {
    const response = await apiClient.post(`/players`, {
        data: player
    });
    return response.data;
}