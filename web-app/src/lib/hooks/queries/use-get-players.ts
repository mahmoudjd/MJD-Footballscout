import {useQuery} from "@tanstack/react-query";
import axios from "axios";
import {PlayerType} from "@/lib/types/type";
import {env} from "@/env";

export function useGetPlayers() {
    return useQuery({
        queryKey: ["players"],
        queryFn: fetchPlayers,
    });
}

async function fetchPlayers() {
        const response = await axios.get<PlayerType[]>(`/players`);
        return response.data;
}
