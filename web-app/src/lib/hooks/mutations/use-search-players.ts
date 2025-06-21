import {useMutation} from "@tanstack/react-query";
import axios from "axios";
import {PlayerType} from "@/lib/types/type";
import {env} from "@/env";

export function useSearchPlayers() {
    return useMutation({
        mutationFn: (name: string) => searchPlayers(name)
    });
}

async function searchPlayers(name: string) {
    const response = await axios.post<PlayerType[]>(`${env.NEXT_PUBLIC_API_HOST}/search`, {name});
    return response.data;
}
