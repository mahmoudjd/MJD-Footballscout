import { env } from "@/env";
import axios from "axios";
import {useMutation, UseMutationOptions} from "@tanstack/react-query";
import {PlayerType} from "@/lib/types/type";
import {apiClient} from "@/lib/hooks/api-client";

interface DeletePlayerMutationType {
  playerId: string;
}
async function deletePlayer(id: string) {
    const response = await apiClient.delete(`/players/${id}`);
    return response.data;
}

export function useDeletePlayer(options?: UseMutationOptions<PlayerType, Error, DeletePlayerMutationType>) {
  return useMutation<PlayerType, Error, DeletePlayerMutationType>({
    ...options,
    mutationFn: (input) => deletePlayer(input.playerId)
  });
}