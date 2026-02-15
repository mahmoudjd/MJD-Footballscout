import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import {
  updateAllPlayers,
  UpdateAllPlayersResponse,
} from "@/lib/hooks/mutations/update-all-players"

export function useUpdateAllPlayers(
  options?: UseMutationOptions<UpdateAllPlayersResponse, Error, void>,
) {
  return useMutation<UpdateAllPlayersResponse, Error, void>({
    mutationFn: () => updateAllPlayers(),
    ...options,
  })
}
