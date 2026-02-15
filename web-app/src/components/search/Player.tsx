import React, { useState } from "react"
import Image from "next/image"
import { PlayerType } from "@/lib/types/type"
import { OutlineIcons } from "@/components/outline-icons"
import { useSavePlayer } from "@/lib/hooks/mutations/use-save-player"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/lib/hooks/use-toast"

interface Props {
  player: PlayerType
}

export function Player({ player }: Props) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const toast = useToast()
  // Lokaler State, um zu tracken, ob Spieler bereits hinzugefügt wurde
  const [isSaved, setIsSaved] = useState(!!player._id)

  const {
    mutate: savePlayer,
    isError,
    error,
    isPending: isSaving,
  } = useSavePlayer({
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
    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
      <Image
        src={player.image}
        alt={player.name}
        width={96}
        height={96}
        className="h-20 w-20 rounded-full object-cover sm:h-24 sm:w-24"
      />

      <div className="flex min-w-0 flex-1 flex-col space-y-1">
        <h3 className="truncate text-base font-semibold text-gray-800 sm:text-lg">
          {player.name}
          <span className="ml-2 text-sm text-gray-500">#{player.number}</span>
        </h3>
        <p className="truncate text-sm text-gray-600">{player.fullName}</p>
        <p className="truncate text-sm text-gray-600">
          {player.country}
          {player.currentClub ? ` • ${player.currentClub}` : ""}
        </p>
        <p className="text-sm text-gray-500">{player.age} years old</p>
      </div>

      <div className="flex w-full flex-col space-y-2 sm:w-auto sm:items-end">
        {!!player._id ? (
          <button
            onClick={toProfile}
            title="Show profile"
            className="flex cursor-pointer items-center justify-center gap-2 rounded-full p-2 transition hover:bg-cyan-100 hover:text-cyan-600 disabled:opacity-50"
          >
            <OutlineIcons.EyeIcon className="h-5 w-5 stroke-cyan-500 group-hover:fill-cyan-500" />
            <span className="text-sm text-cyan-600">Show profile</span>
          </button>
        ) : (
          <button
            onClick={handleAddToFavorites}
            disabled={isSaving}
            title="Add to player list"
            className="flex cursor-pointer items-center justify-center gap-2 rounded-full p-2 transition hover:bg-cyan-100 hover:text-cyan-600 disabled:opacity-50"
          >
            <OutlineIcons.HeartIcon className="h-5 w-5 stroke-cyan-500 group-hover:fill-cyan-500" />
            <span className="text-sm text-cyan-600">Add to player list</span>
          </button>
        )}
      </div>
    </div>
  )
}
