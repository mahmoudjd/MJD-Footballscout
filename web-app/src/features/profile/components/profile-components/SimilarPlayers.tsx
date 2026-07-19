"use client"

import { OutlineIcons } from "@/components/icons/outline-icons"
import { ActionLink } from "@/components/ui/action-link"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import { Panel } from "@/components/ui/panel"
import { PlayerSummaryCard } from "@/components/ui/player-summary-card"
import { StatusState } from "@/components/ui/status-state"
import { Text } from "@/components/ui/text"
import { useSimilarPlayersQuery } from "@/features/players/hooks/useSimilarPlayersQuery"

interface SimilarPlayersProps {
  playerId: string
}

export default function SimilarPlayers({ playerId }: SimilarPlayersProps) {
  const { data, isLoading, isError, refetch, isFetching } = useSimilarPlayersQuery(playerId)

  if (isLoading) {
    return (
      <Panel>
        <StatusState
          tone="loading"
          title="Finding Similar Players…"
          description="Comparing position, age, ELO, market value & player profile."
        />
      </Panel>
    )
  }

  if (isError) {
    return (
      <Panel className="space-y-4">
        <StatusState
          tone="error"
          title="Similar Players Could Not Be Loaded"
          description="Check the connection and try the comparison again."
        />
        <Button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          variant="outline"
          size="sm"
        >
          {isFetching ? "Retrying…" : "Try Again"}
        </Button>
      </Panel>
    )
  }

  if (!data?.items.length) {
    return (
      <Panel>
        <StatusState
          tone="empty"
          title="No Strong Matches Yet"
          description="Add more players or update the player data to improve the recommendations."
        />
      </Panel>
    )
  }

  return (
    <Panel className="space-y-5">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-lime-200/75 text-emerald-900">
          <OutlineIcons.UserGroupIcon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <Text as="h2" variant="title" weight="bold" className="text-pretty text-emerald-950">
            Similar Players
          </Text>
          <Text as="p" className="mt-1 text-pretty text-emerald-950/60">
            Data-based matches ranked by profile similarity. The reasons explain each score.
          </Text>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {data.items.map(({ player, similarityScore, reasons }) => (
          <article
            key={player._id}
            className="min-w-0 rounded-2xl border border-emerald-950/10 bg-linear-to-br from-white to-emerald-50/45 p-3.5 shadow-[0_18px_36px_-30px_rgba(15,50,36,0.4)] sm:p-4"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <Chip tone={similarityScore >= 75 ? "success" : "amber"}>
                {similarityScore}% Match
              </Chip>
              <Text as="span" variant="caption" className="text-emerald-950/55">
                Profile Fit
              </Text>
            </div>
            <div
              className="mb-4 h-2 overflow-hidden rounded-full bg-emerald-950/10"
              role="progressbar"
              aria-label={`${player.name} profile match`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={similarityScore}
            >
              <div
                className="h-full rounded-full bg-linear-to-r from-emerald-700 to-lime-400"
                style={{ width: `${similarityScore}%` }}
              />
            </div>

            <PlayerSummaryCard
              player={player}
              compact
              tone="soft"
              className="border-0 bg-transparent p-0 shadow-none"
              actions={
                <ActionLink
                  href={`/players/${player._id}`}
                  variant="outline"
                  size="sm"
                  fullWidth={false}
                >
                  View Profile
                </ActionLink>
              }
            />

            <div className="mt-4 flex flex-wrap gap-1.5" aria-label="Match reasons">
              {reasons.map((reason) => (
                <Chip key={reason} tone="neutral" size="xs">
                  {reason}
                </Chip>
              ))}
            </div>
          </article>
        ))}
      </div>
    </Panel>
  )
}
