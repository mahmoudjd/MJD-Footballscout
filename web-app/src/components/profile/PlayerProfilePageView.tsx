"use client"

import { useEffect, useState } from "react"
import type { ComponentType, SVGProps } from "react"
import { useUpdatePlayerMutation } from "@/lib/hooks/mutations/useUpdatePlayerMutation"
import ProfileHeader from "@/components/profile/profile-components/ProfileHeader"
import ProfileInfo from "@/components/profile/profile-components/ProfileInfo"
import Transfers from "@/components/profile/profile-components/Transfers"
import Attributes from "@/components/profile/profile-components/attributes"
import Titles from "@/components/profile/profile-components/Titles"
import Awards from "@/components/profile/profile-components/awards"
import { OutlineIcons } from "@/components/outline-icons"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { usePlayerQuery } from "@/lib/hooks/queries/usePlayerQuery"
import { ScrollToTopButton } from "@/components/scroll-to-top-button"
import { useToast } from "@/lib/hooks/useToast"
import { Panel } from "@/components/ui/panel"
import { StatusState } from "@/components/ui/status-state"
import ScoutingReports from "@/components/profile/profile-components/ScoutingReports"
import PlayerHistory from "@/components/profile/profile-components/PlayerHistory"
import { PageContainer } from "@/components/ui/page-container"
import { ProfilePageSkeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import { LoginRequiredState } from "@/components/ui/login-required-state"

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
    <article className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-100 text-cyan-700">
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
      await queryClient.refetchQueries({ queryKey: ["players", playerId] })
      toast.success(`${player?.name} data updated successfully!`)
    },
    onError: () => {
      toast.error("Failed to update player data!")
    },
  })
  const responseStatus = (error as { response?: { status?: number } } | null)?.response?.status
  const shouldThrowUnhandledError = isError && responseStatus !== 404 && responseStatus !== 401

  useEffect(() => {
    if (typeof window !== "undefined" && window.scrollY > 0) {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [])

  if (shouldThrowUnhandledError && error) {
    throw error
  }

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
        <LoginRequiredState
          callbackUrl={`/players/${playerId}`}
          description="Player profiles are available for authenticated users."
          className="w-full"
        />
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
          <Button
            onClick={() => router.push("/players")}
            variant="primary"
            size="md"
            className="mt-8"
          >
            Back to players
          </Button>
        </Panel>
      </div>
    )
  }

  const lastUpdated = player ? new Date(player?.timestamp).toLocaleString() : "-"
  const quickStats = [
    {
      label: "Age",
      value: typeof player.age === "number" ? player.age : "-",
      icon: OutlineIcons.CakeIcon,
    },
    {
      label: "ELO",
      value: typeof player.elo === "number" ? player.elo : "-",
      icon: OutlineIcons.ChartBarIcon,
    },
    {
      label: "Value",
      value: `${player.value || "-"} ${player.currency || ""}`.trim() || "-",
      icon: OutlineIcons.CurrencyEuroIcon,
    },
    {
      label: "Position",
      value: player.position || "-",
      icon: OutlineIcons.ShieldCheckIcon,
    },
  ]

  const hasCareerData =
    (player.transfers?.length || 0) > 0 ||
    (player.titles?.length || 0) > 0 ||
    (player.awards?.length || 0) > 0

  return (
    <PageContainer className="space-y-4" size="wide">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          onClick={() => router.back()}
          variant="outline"
          size="sm"
        >
          <OutlineIcons.ArrowLeftIcon className="h-4 w-4" />
          Back
        </Button>

        <Button
          onClick={handleClick}
          disabled={isUpdating}
          variant="outline"
          size="sm"
          className="border-cyan-700 bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
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

      <Panel
        tone="soft"
        className="flex items-center gap-2 px-4 py-3 text-sm text-slate-600"
      >
        <OutlineIcons.ClockIcon className="h-4 w-4 text-cyan-700" />
        <Text as="span" weight="medium" className="text-slate-700">
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
