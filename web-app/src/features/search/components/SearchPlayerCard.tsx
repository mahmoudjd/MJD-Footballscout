"use client"

import { useState } from "react"
import Image from "next/image"
import type { PlayerType } from "@/lib/types/type"
import { OutlineIcons } from "@/components/icons/outline-icons"
import { useSavePlayerMutation } from "@/features/players/hooks/useSavePlayerMutation"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/lib/hooks/useToast"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import { queryKeys } from "@/lib/react-query/query-keys"
import { getPlayerImageSrc } from "@/lib/player-image"

interface SearchPlayerCardProps {
  player: PlayerType
}

export function SearchPlayerCard({ player }: SearchPlayerCardProps) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const toast = useToast()
  const [savedPlayerId, setSavedPlayerId] = useState<string | undefined>(player._id)
  const isSaved = !!savedPlayerId

  const {
    mutate: savePlayer,
    isError,
    error,
    isPending: isSaving,
  } = useSavePlayerMutation({
    onSuccess: (savedPlayer) => {
      setSavedPlayerId(savedPlayer._id)
      queryClient.refetchQueries({ queryKey: queryKeys.players.all })
      toast.success(`${savedPlayer.name} saved successfully!`)
    },
    onError: () => {
      toast.error("Failed to save player!")
    },
  })

  function handleAddToFavorites() {
    if (isSaved) {
      toast.info("Player already added to favorites!")
      queryClient.invalidateQueries({ queryKey: queryKeys.players.all })
      return
    }
    savePlayer({ player })
  }

  if (isError) {
    throw error
  }

  function toProfile() {
    if (!savedPlayerId) return
    router.push("/players/" + savedPlayerId)
  }

  return (
    <div className="flex flex-col gap-3 p-4 transition-colors hover:bg-stone-50/80 sm:flex-row sm:items-center">
      <Image
        src={getPlayerImageSrc(player.image)}
        alt={player.name || "Player image"}
        width={96}
        height={96}
        className="h-20 w-20 rounded-full object-cover sm:h-24 sm:w-24"
      />

      <div className="flex min-w-0 flex-1 flex-col space-y-1">
        <Text as="h3" variant="title" weight="semibold" className="truncate sm:text-lg">
          {player.name}
          <Text
            as="span"
            variant="caption"
            weight="semibold"
            className="ml-2 rounded-full border border-stone-200 bg-stone-100 px-2 py-0.5 text-stone-700"
          >
            #{player.number || "-"}
          </Text>
        </Text>
        <Text as="p" variant="body" tone="muted" className="truncate">
          {player.fullName}
        </Text>
        <Text as="p" variant="body" tone="muted" className="truncate">
          {player.country}
          {player.currentClub ? ` • ${player.currentClub}` : ""}
        </Text>
        <Text as="p" variant="body" tone="subtle">
          {player.age} years old
        </Text>
      </div>

      <div className="flex w-full flex-col space-y-2 sm:w-auto sm:items-end">
        {isSaved ? (
          <Button
            onClick={toProfile}
            title="Show profile"
            variant="outline"
            size="sm"
            className="border-stone-300 bg-stone-50 text-stone-700 hover:bg-stone-100"
          >
            <OutlineIcons.EyeIcon className="h-5 w-5" aria-hidden="true" />
            <Text as="span" weight="semibold">
              Show profile
            </Text>
          </Button>
        ) : (
          <Button
            onClick={handleAddToFavorites}
            disabled={isSaving}
            title="Add to player list"
            variant="outline"
            size="sm"
            className="border-stone-300 bg-stone-50 text-stone-700 hover:bg-stone-100"
          >
            <OutlineIcons.HeartIcon className="h-5 w-5" aria-hidden="true" />
            <Text as="span" weight="semibold">
              Add to player list
            </Text>
          </Button>
        )}
      </div>
    </div>
  )
}
