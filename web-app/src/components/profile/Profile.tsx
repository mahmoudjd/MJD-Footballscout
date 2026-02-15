"use client"

import { useEffect } from "react"
import { useUpdateMutation } from "@/lib/hooks/mutations/use-update-player"
import ProfileHeader from "@/components/profile/profile-components/ProfileHeader"
import ProfileInfo from "@/components/profile/profile-components/ProfileInfo"
import Transfers from "@/components/profile/profile-components/Transfers"
import Attributes from "@/components/profile/profile-components/attributes"
import Titles from "@/components/profile/profile-components/Titles"
import Awards from "@/components/profile/profile-components/awards"
import { OutlineIcons } from "@/components/outline-icons"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { useGetPlayer } from "@/lib/hooks/queries/use-get-player"
import { ScrollToTopButton } from "@/components/scroll-to-top-button"
import { useToast } from "@/lib/hooks/use-toast"
import { Panel } from "@/components/ui/panel"
import { StatusState } from "@/components/ui/status-state"
import ScoutingReports from "@/components/profile/profile-components/ScoutingReports"
import PlayerHistory from "@/components/profile/profile-components/PlayerHistory"
import { PageContainer } from "@/components/ui/page-container"
import { signIn } from "next-auth/react"
import { ProfilePageSkeleton } from "@/components/ui/skeleton"

interface Props {
  playerId: string
}

export function Profile({ playerId }: Props) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const toast = useToast()
  const { data: player, error, isError, isLoading } = useGetPlayer({ playerId })

  const { mutateAsync: updatePlayerMutation, isPending: isUpdating } = useUpdateMutation({
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ["player", { playerId }] })
      toast.success(`${player?.name} data updated successfully!`)
    },
    onError: () => {
      toast.error("Failed to update player data!")
    },
  })
  const responseStatus = (error as { response?: { status?: number } } | null)?.response?.status

  if (isError && responseStatus !== 404 && responseStatus !== 401) {
    throw error
  }
  useEffect(() => {
    if (typeof window !== "undefined" && window.scrollY > 0) {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [])

  async function handleClick() {
    await updatePlayerMutation({ playerId })
  }

  if (isLoading) {
    return (
      <PageContainer className="space-y-6" size="wide">
        <ProfilePageSkeleton sections={5} />
      </PageContainer>
    )
  }
  if (responseStatus === 401) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
        <Panel className="w-full">
          <StatusState
            tone="empty"
            title="Login required"
            description="Player profiles are available for authenticated users."
          />
          <button
            onClick={() => signIn(undefined, { callbackUrl: `/players/${playerId}` })}
            className="mt-8 cursor-pointer rounded-md bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-cyan-600"
          >
            Go to login
          </button>
        </Panel>
      </div>
    )
  }
  if (!player || responseStatus === 404) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
        <Panel className="w-full">
          <StatusState
            tone="empty"
            title="Player not found"
            description="This player does not exist or is no longer available."
          />
          <button
            onClick={() => router.push("/players")}
            className="mt-8 cursor-pointer rounded-md bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-cyan-600"
          >
            Back to players
          </button>
        </Panel>
      </div>
    )
  }

  const lastUpdated = player ? new Date(player?.timestamp).toLocaleString() : "-"

  return (
    <PageContainer className="space-y-6" size="wide">
      <button
        onClick={() => router.back()}
        className="mb-4 inline-flex cursor-pointer items-center text-sm font-medium text-cyan-700 transition hover:text-cyan-800"
      >
        <OutlineIcons.ArrowLeftIcon className="mr-1 h-5 w-5" />
        Back
      </button>

      <ProfileHeader
        name={player.name}
        title={player.title}
        number={player.number}
        image={player.image}
        position={player.position}
      />

      <Panel
        tone="soft"
        className="flex flex-col gap-3 px-4 py-3 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex flex-wrap items-center gap-2">
          <OutlineIcons.ClockIcon className="h-5 w-5 text-gray-400" />
          <span className="text-gray-600">Last updated:</span>
          <span className="font-medium text-gray-800">{lastUpdated}</span>
        </div>

        <button
          onClick={handleClick}
          disabled={isUpdating}
          className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-cyan-700 transition hover:text-cyan-800 disabled:opacity-50"
        >
          <OutlineIcons.ArrowPathIcon className="h-5 w-5" />
          {isUpdating ? "Updating..." : "Update Data"}
        </button>
      </Panel>

      <hr className="border-gray-300" />
      <ProfileInfo player={player} />
      <hr className="border-gray-300" />

      {player.playerAttributes?.length > 0 && (
        <>
          <Attributes attributes={player.playerAttributes} />
          <hr className="border-gray-300" />
        </>
      )}

      {player.transfers?.length > 0 && (
        <>
          <Transfers transfers={player.transfers} />
          <hr className="border-gray-300" />
        </>
      )}

      {player.titles?.length > 0 && <Titles titles={player.titles} />}

      {player.awards?.length > 0 && (
        <>
          <hr className="border-gray-300" />
          <Awards awards={player.awards} />
        </>
      )}

      <hr className="border-gray-300" />
      <ScoutingReports playerId={playerId} />

      <hr className="border-gray-300" />
      <PlayerHistory playerId={playerId} />
      <ScrollToTopButton />
    </PageContainer>
  )
}
