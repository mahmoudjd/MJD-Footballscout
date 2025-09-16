import {useMutation} from "@tanstack/react-query";
import axios from "axios";
import {PlayerType} from "@/lib/types/type";
import {env} from "@/env";
import {apiClient} from "@/lib/hooks/api-client";

export function useSearchPlayers() {
    return useMutation({
        mutationFn: (name: string) => searchPlayers(name)
    });
}

async function searchPlayers(name: string) {
    const response = await apiClient.post<PlayerType[]>(`/search`, {name});
    return response.data;
}
