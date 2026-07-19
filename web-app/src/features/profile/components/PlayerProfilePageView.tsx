"use client"

import { useState } from "react"
import type { ComponentType, SVGProps } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { useUpdatePlayerMutation } from "@/features/players/hooks/useUpdatePlayerMutation"
import { usePlayerQuery } from "@/features/players/hooks/usePlayerQuery"
import ProfileHeader from "@/features/profile/components/profile-components/ProfileHeader"
import ProfileInfo from "@/features/profile/components/profile-components/ProfileInfo"
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
import { Spinner } from "@/components/common/spinner"
import { ActionLink } from "@/components/ui/action-link"

const Attributes = dynamic(
  () => import("@/features/profile/components/profile-components/attributes"),
)
const Transfers = dynamic(
  () => import("@/features/profile/components/profile-components/Transfers"),
)
const Titles = dynamic(() => import("@/features/profile/components/profile-components/Titles"))
const Awards = dynamic(() => import("@/features/profile/components/profile-components/awards"))
const ScoutingReports = dynamic(
  () => import("@/features/profile/components/profile-components/ScoutingReports"),
)
const PlayerHistory = dynamic(
  () => import("@/features/profile/components/profile-components/PlayerHistory"),
)
const SimilarPlayers = dynamic(
  () => import("@/features/profile/components/profile-components/SimilarPlayers"),
)

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
})

interface PlayerProfilePageViewProps {
  playerId: string
}

type ProfileTab = "overview" | "attributes" | "career" | "similar" | "scouting" | "history"

type QuickStatProps = {
  label: string
  value: string | number
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

function QuickStatCard({ label, value, icon: Icon }: QuickStatProps) {
  return (
    <article className="min-w-0 rounded-2xl border border-emerald-950/8 bg-linear-to-br from-white to-emerald-50/55 p-3.5 shadow-[0_18px_34px_-28px_rgba(15,50,36,0.4)] sm:p-4">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 shadow-inner">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <Text as="span" variant="overline" weight="bold" className="text-emerald-950/55">
          {label}
        </Text>
      </div>
      <Text
        as="p"
        variant="title"
        weight="bold"
        className="mt-2 truncate text-emerald-950 tabular-nums"
        title={String(value)}
      >
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

  const { mutateAsync: updatePlayerMutation, isPending: isUpdating } = useUpdatePlayerMutation({
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: queryKeys.players.detail(playerId) })
      toast.success(`${player?.name} data updated successfully.`)
    },
    onError: () => {
      toast.error("Player data could not be updated. Please try again.")
    },
  })

  const responseStatus = (error as { response?: { status?: number } } | null)?.response?.status
  const isUnauthorized = responseStatus === 401
  const isNotFound = responseStatus === 404
  const shouldThrowUnhandledError = isError && !isUnauthorized && !isNotFound

  const updatedAt = player?.timestamp ? new Date(player.timestamp) : null
  const hasValidUpdatedAt = updatedAt !== null && !Number.isNaN(updatedAt.getTime())
  const lastUpdated = hasValidUpdatedAt ? dateTimeFormatter.format(updatedAt) : "-"

  const quickStats = [
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
  ]

  const hasCareerData =
    (player?.transfers?.length || 0) > 0 ||
    (player?.titles?.length || 0) > 0 ||
    (player?.awards?.length || 0) > 0

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
          <ActionLink href="/players" size="md" fullWidth={false} className="mt-8">
            Back to Players
          </ActionLink>
        </Panel>
      </div>
    )
  }

  return (
    <PageContainer className="space-y-5" size="wide">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button onClick={() => router.back()} variant="outline" size="sm">
          <OutlineIcons.ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
          Back
        </Button>

        <Button onClick={handleUpdatePlayer} disabled={isUpdating} variant="secondary" size="sm">
          {isUpdating ? (
            <Spinner size="sm" />
          ) : (
            <OutlineIcons.ArrowPathIcon className="h-4 w-4" aria-hidden="true" />
          )}
          {isUpdating ? "Updating…" : "Update Data"}
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

      <Panel tone="soft" className="flex flex-wrap items-center gap-x-2 gap-y-1 px-4 py-3 text-sm">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
          <OutlineIcons.ClockIcon className="h-4 w-4" aria-hidden="true" />
        </span>
        <Text as="span" weight="medium" className="text-emerald-950/60">
          Last updated:
        </Text>
        <time
          className="text-sm font-bold text-emerald-950 tabular-nums"
          dateTime={hasValidUpdatedAt ? updatedAt.toISOString() : undefined}
        >
          {lastUpdated}
        </time>
      </Panel>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {quickStats.map((stat) => (
          <QuickStatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} />
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ProfileTab)}>
        <TabsList className="flex w-full snap-x justify-start gap-1 overflow-x-auto p-1.5 md:grid md:grid-cols-6">
          <TabsTrigger value="overview" className="shrink-0 snap-start">
            Overview
          </TabsTrigger>
          <TabsTrigger value="attributes" className="shrink-0 snap-start">
            Attributes
          </TabsTrigger>
          <TabsTrigger value="career" className="shrink-0 snap-start">
            Career
          </TabsTrigger>
          <TabsTrigger value="similar" className="shrink-0 snap-start">
            Similar
          </TabsTrigger>
          <TabsTrigger value="scouting" className="shrink-0 snap-start">
            Scouting
          </TabsTrigger>
          <TabsTrigger value="history" className="shrink-0 snap-start">
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Panel className="space-y-4">
            <div>
              <Text as="h2" variant="title" weight="bold" className="text-emerald-950">
                Complete Player Details
              </Text>
              <Text as="p" variant="body" className="mt-1 text-emerald-950/60">
                All available profile information is shown here at a glance.
              </Text>
            </div>
            <ProfileInfo player={player} />
          </Panel>

          <Panel tone="soft" className="mt-4 flex items-start gap-3">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-lime-200/70 text-emerald-900">
              <OutlineIcons.SparklesIcon className="h-4 w-4" aria-hidden="true" />
            </span>
            <Text as="p" className="pt-1.5 text-emerald-950/70">
              Use the tabs to review attributes, career milestones, scouting reports & change
              history.
            </Text>
          </Panel>
        </TabsContent>

        <TabsContent value="attributes">
          {activeTab === "attributes" ? (
            player.playerAttributes?.length > 0 ? (
              <Panel>
                <Attributes attributes={player.playerAttributes} />
              </Panel>
            ) : (
              <Panel>
                <StatusState tone="empty" title="No attributes available" />
              </Panel>
            )
          ) : null}
        </TabsContent>

        <TabsContent value="career">
          {activeTab === "career" ? (
            hasCareerData ? (
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
            )
          ) : null}
        </TabsContent>

        <TabsContent value="scouting">
          {activeTab === "scouting" ? <ScoutingReports playerId={playerId} /> : null}
        </TabsContent>

        <TabsContent value="similar">
          {activeTab === "similar" ? <SimilarPlayers playerId={playerId} /> : null}
        </TabsContent>

        <TabsContent value="history">
          {activeTab === "history" ? <PlayerHistory playerId={playerId} /> : null}
        </TabsContent>
      </Tabs>

      <ScrollToTopButton />
    </PageContainer>
  )
}
