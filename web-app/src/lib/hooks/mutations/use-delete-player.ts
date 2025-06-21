import { env } from "@/env";
import axios from "axios";
import {useMutation, UseMutationOptions} from "@tanstack/react-query";
import {PlayerType} from "@/lib/types/type";

interface DeletePlayerMutationType {
  playerId: string;
}
async function deletePlayer(id: string) {
    const response = await axios.delete(`${env.NEXT_PUBLIC_API_HOST}/players/${id}`);
    return response.data;
}

export function useDeletePlayer(options?: UseMutationOptions<PlayerType, Error, DeletePlayerMutationType>) {
  return useMutation<PlayerType, Error, DeletePlayerMutationType>({
    ...options,
    mutationFn: (input) => deletePlayer(input.playerId)
  });
}