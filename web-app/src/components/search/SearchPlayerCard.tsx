"use client"

import { useState } from "react"
import Image from "next/image"
import type { PlayerType } from "@/lib/types/type"
import { OutlineIcons } from "@/components/outline-icons"
import { useSavePlayerMutation } from "@/lib/hooks/mutations/useSavePlayerMutation"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/lib/hooks/useToast"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"

interface SearchPlayerCardProps {
  player: PlayerType
}

export function SearchPlayerCard({ player }: SearchPlayerCardProps) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const toast = useToast()
  // Tracks local add-state to avoid duplicate additions in a single view session.
  const [isSaved, setIsSaved] = useState(!!player._id)

  const {
    mutate: savePlayer,
    isError,
    error,
    isPending: isSaving,
  } = useSavePlayerMutation({
    onSuccess: (savedPlayer) => {
      setIsSaved(true)
      queryClient.refetchQueries({ queryKey: ["players"] })
      toast.success(`${savedPlayer.name} saved successfully!`)
    },
    onError: () => {
      toast.error("Failed to save player!")
    },
  })

  function handleAddToFavorites() {
    if (isSaved) {
      toast.info("Player already added to favorites!")
      queryClient.invalidateQueries({ queryKey: ["players"] })
      return
    }
    savePlayer({ player })
  }

  if (isError) {
    throw error
  }

  function toProfile() {
    router.push("/players/" + player._id)
  }

  return (
    <div className="flex flex-col gap-3 p-4 transition-colors hover:bg-cyan-50/40 sm:flex-row sm:items-center">
      <Image
        src={player.image}
        alt={player.name}
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
            className="ml-2 rounded-full border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-cyan-700"
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
        {!!player._id ? (
          <Button
            onClick={toProfile}
            title="Show profile"
            variant="outline"
            size="sm"
            className="border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
          >
            <OutlineIcons.EyeIcon className="h-5 w-5 stroke-cyan-600" />
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
            className="border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
          >
            <OutlineIcons.HeartIcon className="h-5 w-5 stroke-cyan-600" />
            <Text as="span" weight="semibold">
              Add to player list
            </Text>
          </Button>
        )}
      </div>
    </div>
  )
}
