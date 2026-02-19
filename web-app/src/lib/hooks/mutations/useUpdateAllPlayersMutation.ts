import { useMutation, type UseMutationOptions } from "@tanstack/react-query"
import {
  updateAllPlayers,
  type UpdateAllPlayersResponse,
} from "@/lib/hooks/mutations/updateAllPlayers"

export function useUpdateAllPlayersMutation(
  options?: UseMutationOptions<UpdateAllPlayersResponse, Error, void>,
) {
  return useMutation<UpdateAllPlayersResponse, Error, void>({
    mutationFn: () => updateAllPlayers(),
    ...options,
  })
}
