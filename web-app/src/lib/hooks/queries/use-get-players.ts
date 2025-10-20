import { useQuery } from "@tanstack/react-query";
import { PlayerType } from "@/lib/types/type";
import { apiClient } from "@/lib/hooks/api-client";

export function useGetPlayers() {
  return useQuery({
    queryKey: ["players"],
    queryFn: fetchPlayers,
  });
}

async function fetchPlayers() {
  const response = await apiClient.get<PlayerType[]>(`/players`);
  return response.data;
}
