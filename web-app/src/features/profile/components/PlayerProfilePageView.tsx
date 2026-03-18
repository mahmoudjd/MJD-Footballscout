"use client"

import { useEffect, useMemo, useState } from "react"
import type { ComponentType, SVGProps } from "react"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { useUpdatePlayerMutation } from "@/features/players/hooks/useUpdatePlayerMutation"
import { usePlayerQuery } from "@/features/players/hooks/usePlayerQuery"
import ProfileHeader from "@/features/profile/components/profile-components/ProfileHeader"
import ProfileInfo from "@/features/profile/components/profile-components/ProfileInfo"
import Transfers from "@/features/profile/components/profile-components/Transfers"
import Attributes from "@/features/profile/components/profile-components/attributes"
import Titles from "@/features/profile/components/profile-components/Titles"
import Awards from "@/features/profile/components/profile-components/awards"
import ScoutingReports from "@/features/profile/components/profile-components/ScoutingReports"
import PlayerHistory from "@/features/profile/components/profile-components/PlayerHistory"
import { OutlineIcons } from "@/components/icons/outline-icons"
import { ScrollToTopButton } from "@/components/common/scroll-to-top-button"
import { useToast } from "@/lib/hooks/useToast"
import { Panel } from "@/components/ui/panel"
import { StatusState } from "@/components/ui/status-state"
import { PageContainer } from "@/components/ui/page-container"
import { ProfilePageSkeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import { LoginRequiredState } from "@/components/ui/login-required-state"
import { queryKeys } from "@/lib/react-query/query-keys"

interface PlayerProfilePageViewProps {
  playerId: string
}

type ProfileTab = "overview" | "attributes" | "career" | "scouting" | "history"

type QuickStatProps = {
  label: string
  value: string | number
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

function QuickStatCard({ label, value, icon: Icon }: QuickStatProps) {
  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-3 shadow-[0_12px_24px_-22px_rgba(15,23,42,0.45)]">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
          <Icon className="h-4 w-4" />
        </span>
        <Text as="span" variant="overline" weight="semibold" tone="subtle">
          {label}
        </Text>
      </div>
      <Text as="p" variant="title" weight="semibold" className="mt-1 truncate text-slate-900">
        {value}
      </Text>
    </article>
  )
}

export function PlayerProfilePageView({ playerId }: PlayerProfilePageViewProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const toast = useToast()
  const { data: player, error, isError, isLoading } = usePlayerQuery(playerId)
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview")
  const [showAllDetails, setShowAllDetails] = useState(false)

  const { mutateAsync: updatePlayerMutation, isPending: isUpdating } = useUpdatePlayerMutation({
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: queryKeys.players.detail(playerId) })
      toast.success(`${player?.name} data updated successfully!`)
    },
    onError: () => {
      toast.error("Failed to update player data!")
    },
  })

  const responseStatus = (error as { response?: { status?: number } } | null)?.response?.status
  const isUnauthorized = responseStatus === 401
  const isNotFound = responseStatus === 404
  const shouldThrowUnhandledError = isError && !isUnauthorized && !isNotFound

  useEffect(() => {
    if (typeof window !== "undefined" && window.scrollY > 0) {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [])

  const lastUpdated = useMemo(() => {
    if (!player?.timestamp) return "-"
    const date = new Date(player.timestamp)
    return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString()
  }, [player?.timestamp])

  const quickStats = useMemo(
    () => [
      {
        label: "Age",
        value: typeof player?.age === "number" ? player.age : "-",
        icon: OutlineIcons.CakeIcon,
      },
      {
        label: "ELO",
        value: typeof player?.elo === "number" ? player.elo : "-",
        icon: OutlineIcons.ChartBarIcon,
      },
      {
        label: "Value",
        value: `${player?.value || "-"} ${player?.currency || ""}`.trim() || "-",
        icon: OutlineIcons.CurrencyEuroIcon,
      },
      {
        label: "Position",
        value: player?.position || "-",
        icon: OutlineIcons.ShieldCheckIcon,
      },
    ],
    [player?.age, player?.currency, player?.elo, player?.position, player?.value],
  )

  const hasCareerData = useMemo(
    () =>
      (player?.transfers?.length || 0) > 0 ||
      (player?.titles?.length || 0) > 0 ||
      (player?.awards?.length || 0) > 0,
    [player?.transfers, player?.titles, player?.awards],
  )

  if (shouldThrowUnhandledError && error) {
    throw error
  }

  const handleUpdatePlayer = async () => {
    await updatePlayerMutation({ playerId })
  }

  if (isLoading) {
    return (
      <PageContainer className="space-y-6" size="wide">
        <ProfilePageSkeleton sections={5} />
      </PageContainer>
    )
  }

  if (isUnauthorized) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
        <LoginRequiredState
          callbackUrl={`/players/${playerId}`}
          description="Player profiles are available for authenticated users."
          className="w-full"
        />
      </div>
    )
  }

  if (!player || isNotFound) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
        <Panel className="w-full">
          <StatusState
            tone="empty"
            title="Player not found"
            description="This player does not exist or is no longer available."
          />
          <Button onClick={() => router.push("/players")} variant="primary" size="md" className="mt-8">
            Back to players
          </Button>
        </Panel>
      </div>
    )
  }

  return (
    <PageContainer className="space-y-4" size="wide">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button onClick={() => router.back()} variant="outline" size="sm">
          <OutlineIcons.ArrowLeftIcon className="h-4 w-4" />
          Back
        </Button>

        <Button
          onClick={handleUpdatePlayer}
          disabled={isUpdating}
          variant="secondary"
          size="sm"
        >
          <OutlineIcons.ArrowPathIcon className="h-4 w-4" />
          {isUpdating ? "Updating..." : "Update Data"}
        </Button>
      </div>

      <ProfileHeader
        name={player.name}
        title={player.title}
        fullName={player.fullName}
        number={player.number}
        image={player.image}
        position={player.position}
        age={player.age}
        currentClub={player.currentClub}
      />

      <Panel tone="soft" className="flex items-center gap-2 px-4 py-3 text-sm text-stone-600">
        <OutlineIcons.ClockIcon className="h-4 w-4 text-amber-700" />
        <Text as="span" weight="medium" className="text-stone-700">
          Last updated:
        </Text>
        <Text as="span" weight="semibold" className="text-slate-900">
          {lastUpdated}
        </Text>
      </Panel>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {quickStats.map((stat) => (
          <QuickStatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} />
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ProfileTab)}>
        <TabsList className="!grid w-full grid-cols-2 gap-1 sm:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attributes">Attributes</TabsTrigger>
          <TabsTrigger value="career">Career</TabsTrigger>
          <TabsTrigger value="scouting">Scouting</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Panel className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <Text as="h3" variant="title" weight="bold" className="text-slate-900">
                Details
              </Text>
              <Button
                type="button"
                onClick={() => setShowAllDetails((current) => !current)}
                variant="outline"
                size="xs"
              >
                {showAllDetails ? "Show fewer details" : "Show all details"}
              </Button>
            </div>
            <ProfileInfo player={player} maxItems={showAllDetails ? undefined : 9} />
          </Panel>

          <Panel tone="soft" className="mt-4">
            <Text as="p" className="text-slate-700">
              Review attributes, career timeline, scouting reports, and history through the tabs above.
            </Text>
          </Panel>
        </TabsContent>

        <TabsContent value="attributes">
          {player.playerAttributes?.length > 0 ? (
            <Panel>
              <Attributes attributes={player.playerAttributes} />
            </Panel>
          ) : (
            <Panel>
              <StatusState tone="empty" title="No attributes available" />
            </Panel>
          )}
        </TabsContent>

        <TabsContent value="career">
          {hasCareerData ? (
            <div className="space-y-4">
              {player.transfers?.length > 0 ? (
                <Panel>
                  <Transfers transfers={player.transfers} />
                </Panel>
              ) : null}
              {player.titles?.length > 0 ? (
                <Panel>
                  <Titles titles={player.titles} />
                </Panel>
              ) : null}
              {player.awards?.length > 0 ? (
                <Panel>
                  <Awards awards={player.awards} />
                </Panel>
              ) : null}
            </div>
          ) : (
            <Panel>
              <StatusState tone="empty" title="No career data available" />
            </Panel>
          )}
        </TabsContent>

        <TabsContent value="scouting">
          <ScoutingReports playerId={playerId} />
        </TabsContent>

        <TabsContent value="history">
          <PlayerHistory playerId={playerId} />
        </TabsContent>
      </Tabs>

      <ScrollToTopButton />
    </PageContainer>
  )
}
