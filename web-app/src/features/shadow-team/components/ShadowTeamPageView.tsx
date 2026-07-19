"use client"

import { useEffect, useMemo, useState, type FormEvent } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { OutlineIcons } from "@/components/icons/outline-icons"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Input } from "@/components/ui/input"
import { LoginRequiredState } from "@/components/ui/login-required-state"
import { PageContainer } from "@/components/ui/page-container"
import { Panel } from "@/components/ui/panel"
import { SectionHeader } from "@/components/ui/section-header"
import { StatusState } from "@/components/ui/status-state"
import { Text } from "@/components/ui/text"
import { usePlayersQuery } from "@/features/players/hooks/usePlayersQuery"
import {
  useShadowTeamMutations,
  useShadowTeamQuery,
  useShadowTeamsQuery,
} from "@/features/shadow-team/hooks/useShadowTeams"
import { cn } from "@/lib/cn"
import { useToast } from "@/lib/hooks/useToast"
import type {
  PlayerType,
  ShadowTeamAssignmentType,
  ShadowTeamFormationType,
  ShadowTeamSlotType,
} from "@/lib/types/type"

const formations: ShadowTeamFormationType[] = ["4-3-3", "4-2-3-1", "4-4-2", "3-5-2"]
const currencyFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "EUR",
  notation: "compact",
  maximumFractionDigits: 1,
})

function playerLabel(player: PlayerType) {
  return player.name || player.fullName || "Unknown player"
}

function formatUpdatedDate(value: unknown) {
  const date = value instanceof Date ? value : new Date(String(value))
  return Number.isNaN(date.getTime()) ? "Unknown date" : date.toLocaleDateString()
}

function assignmentFor(assignments: ShadowTeamAssignmentType[], slotId: string) {
  return assignments.find((item) => item.slotId === slotId)?.playerIds ?? []
}

function MetricCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-emerald-950/8 bg-white/85 p-4 shadow-[0_16px_28px_-26px_rgba(15,50,36,0.5)]">
      <Text as="p" variant="caption" tone="muted" className="font-semibold tracking-wide uppercase">
        {label}
      </Text>
      <Text as="p" variant="h2" weight="extrabold" className="mt-1 text-emerald-950 tabular-nums">
        {value}
      </Text>
      <Text as="p" variant="caption" tone="muted" className="mt-1">
        {hint}
      </Text>
    </div>
  )
}

function PitchSlot({
  slot,
  players,
  selected,
  onSelect,
}: {
  slot: ShadowTeamSlotType
  players: PlayerType[]
  selected: boolean
  onSelect: () => void
}) {
  const primary = players[0]
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`${slot.label}: ${primary ? playerLabel(primary) : "empty"}`}
      className={cn(
        "absolute z-10 flex min-h-14 w-[5.4rem] -translate-x-1/2 -translate-y-1/2 touch-manipulation flex-col items-center justify-center rounded-2xl border px-2 py-1.5 text-center shadow-lg transition-[background-color,border-color,color,box-shadow,transform] focus-visible:ring-3 focus-visible:ring-lime-300 focus-visible:outline-none sm:w-[6.5rem]",
        selected
          ? "scale-105 border-lime-300 bg-emerald-950 text-white shadow-[0_16px_30px_-16px_rgba(6,78,59,0.9)]"
          : primary
            ? "border-white/70 bg-white/95 text-emerald-950 hover:border-lime-300 hover:bg-lime-50"
            : "border-dashed border-white/70 bg-emerald-950/72 text-white hover:bg-emerald-950/88",
      )}
      style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
    >
      <span className="text-[10px] font-extrabold tracking-wider uppercase opacity-75">
        {slot.shortLabel}
      </span>
      <span className="line-clamp-1 max-w-full text-xs font-bold sm:text-sm">
        {primary ? playerLabel(primary) : "Add player"}
      </span>
      {players.length > 1 ? (
        <span className="mt-0.5 rounded-full bg-lime-300 px-1.5 text-[10px] font-extrabold text-emerald-950">
          +{players.length - 1}
        </span>
      ) : null}
    </button>
  )
}

export function ShadowTeamPageView() {
  const { status, data: session } = useSession()
  const isLoggedIn = Boolean(session?.user?.id)
  const toast = useToast()
  const teamsQuery = useShadowTeamsQuery(isLoggedIn)
  const playersQuery = usePlayersQuery(isLoggedIn)
  const [selectedTeamId, setSelectedTeamId] = useState("")
  const [selectedSlotId, setSelectedSlotId] = useState("")
  const [newName, setNewName] = useState("")
  const [newFormation, setNewFormation] = useState<ShadowTeamFormationType>("4-3-3")
  const [playerSearch, setPlayerSearch] = useState("")
  const [deleteOpen, setDeleteOpen] = useState(false)
  const detailsQuery = useShadowTeamQuery(selectedTeamId, isLoggedIn)
  const mutations = useShadowTeamMutations()
  const teams = useMemo(() => teamsQuery.data ?? [], [teamsQuery.data])
  const detail = detailsQuery.data

  useEffect(() => {
    if (!teams.length) return
    if (!selectedTeamId || !teams.some((team) => team._id === selectedTeamId)) {
      setSelectedTeamId(teams[0]._id)
    }
  }, [selectedTeamId, teams])

  useEffect(() => {
    if (!detail?.slots.length) return
    if (!selectedSlotId || !detail.slots.some((slot) => slot.id === selectedSlotId)) {
      setSelectedSlotId(detail.slots[0].id)
    }
  }, [detail?.slots, selectedSlotId])

  const playersById = useMemo(
    () => new Map((playersQuery.data ?? []).map((player) => [player._id, player])),
    [playersQuery.data],
  )
  const selectedSlot = detail?.slots.find((slot) => slot.id === selectedSlotId)
  const selectedIds = useMemo(
    () => (detail ? assignmentFor(detail.assignments, selectedSlotId) : []),
    [detail, selectedSlotId],
  )
  const selectedPlayers = selectedIds
    .map(
      (playerId) =>
        playersById.get(playerId) ?? detail?.players.find((player) => player._id === playerId),
    )
    .filter((player): player is PlayerType => Boolean(player))
  const matchingPlayers = useMemo(() => {
    if (!selectedSlot) return []
    const query = playerSearch.trim().toLocaleLowerCase()
    return (playersQuery.data ?? [])
      .filter((player) => player.position === selectedSlot.positionGroup)
      .filter((player) => !selectedIds.includes(player._id))
      .filter((player) =>
        query
          ? `${player.name} ${player.fullName} ${player.currentClub} ${player.country}`
              .toLocaleLowerCase()
              .includes(query)
          : true,
      )
      .sort((a, b) => (b.elo || 0) - (a.elo || 0))
      .slice(0, 20)
  }, [playerSearch, playersQuery.data, selectedIds, selectedSlot])
  const selectedAlternatives =
    detail?.alternatives.find((item) => item.slotId === selectedSlotId)?.players ?? []

  const saveAssignments = (assignments: ShadowTeamAssignmentType[], successMessage?: string) => {
    if (!detail) return
    mutations.update.mutate(
      {
        teamId: detail._id,
        payload: { name: detail.name, formation: detail.formation, assignments },
      },
      {
        onSuccess: () => successMessage && toast.success(successMessage),
        onError: () => toast.error("Shadow team could not be updated"),
      },
    )
  }

  const replaceSlotPlayers = (slotId: string, playerIds: string[]) => {
    if (!detail) return
    const withoutSlot = detail.assignments.filter((item) => item.slotId !== slotId)
    saveAssignments(playerIds.length ? [...withoutSlot, { slotId, playerIds }] : withoutSlot)
  }

  const handleCreate = (event: FormEvent) => {
    event.preventDefault()
    if (!newName.trim()) return
    mutations.create.mutate(
      { name: newName.trim(), formation: newFormation },
      {
        onSuccess: (team) => {
          setSelectedTeamId(team._id)
          setNewName("")
          toast.success("Shadow team created")
        },
        onError: () => toast.error("Shadow team could not be created"),
      },
    )
  }

  const addPlayer = (playerId: string) => {
    if (!selectedSlot || selectedIds.length >= 5) return
    replaceSlotPlayers(selectedSlot.id, [...selectedIds, playerId])
  }

  const makePrimary = (playerId: string) => {
    replaceSlotPlayers(selectedSlotId, [playerId, ...selectedIds.filter((id) => id !== playerId)])
  }

  if (status === "loading") {
    return (
      <PageContainer>
        <Panel>
          <StatusState tone="loading" title="Checking session" />
        </Panel>
      </PageContainer>
    )
  }

  if (!isLoggedIn) {
    return (
      <PageContainer className="space-y-4">
        <SectionHeader
          title="Shadow Team"
          description="Build formations and assess recruitment gaps."
          icon="Squares2X2Icon"
        />
        <LoginRequiredState
          callbackUrl="/shadow-team"
          description="Sign in to create and save your Shadow Teams."
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer size="wide" className="space-y-6">
      <SectionHeader
        title="Shadow Team"
        description="Build your future squad, compare candidates and turn positional gaps into a recruitment plan."
        icon="Squares2X2Icon"
        badge={`${teams.length} ${teams.length === 1 ? "team" : "teams"}`}
      />

      <div className="grid gap-6 xl:grid-cols-[19rem_minmax(0,1fr)]">
        <aside className="space-y-4">
          <Panel>
            <Text as="h2" variant="h3" weight="bold">
              Create a team
            </Text>
            <form className="mt-4 space-y-3" onSubmit={handleCreate}>
              <div className="space-y-1.5">
                <label
                  htmlFor="shadow-team-name"
                  className="block text-sm font-semibold text-emerald-950"
                >
                  Team name <span aria-hidden="true">*</span>
                </label>
                <Input
                  id="shadow-team-name"
                  value={newName}
                  onChange={(event) => setNewName(event.target.value)}
                  placeholder="Summer recruitment 2027"
                  maxLength={80}
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="shadow-team-formation"
                  className="block text-sm font-semibold text-emerald-950"
                >
                  Formation
                </label>
                <select
                  id="shadow-team-formation"
                  value={newFormation}
                  onChange={(event) =>
                    setNewFormation(event.target.value as ShadowTeamFormationType)
                  }
                  className="min-h-11 w-full rounded-xl border border-emerald-950/15 bg-white px-3.5 py-2.5 text-sm font-medium text-emerald-950 shadow-sm focus-visible:border-emerald-700 focus-visible:ring-3 focus-visible:ring-lime-300/35 focus-visible:outline-none"
                >
                  {formations.map((formation) => (
                    <option key={formation}>{formation}</option>
                  ))}
                </select>
              </div>
              <Button
                type="submit"
                fullWidth
                disabled={!newName.trim() || mutations.create.isPending}
              >
                Create Shadow Team
              </Button>
            </form>
          </Panel>

          <Panel>
            <div className="flex items-center justify-between gap-2">
              <Text as="h2" variant="h3" weight="bold">
                Your teams
              </Text>
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-800 tabular-nums">
                {teams.length}
              </span>
            </div>
            {teamsQuery.isLoading ? (
              <StatusState className="mt-4" tone="loading" title="Loading teams" />
            ) : null}
            {teamsQuery.isError ? (
              <StatusState className="mt-4" tone="error" title="Teams could not be loaded" />
            ) : null}
            {!teamsQuery.isLoading && !teams.length ? (
              <StatusState
                className="mt-4"
                title="No Shadow Teams yet"
                description="Create your first formation above."
              />
            ) : null}
            <div className="mt-3 space-y-2">
              {teams.map((team) => (
                <button
                  key={team._id}
                  type="button"
                  onClick={() => setSelectedTeamId(team._id)}
                  aria-pressed={team._id === selectedTeamId}
                  className={cn(
                    "w-full rounded-2xl border p-3 text-left transition-[background-color,border-color,color,box-shadow] focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:outline-none",
                    team._id === selectedTeamId
                      ? "border-emerald-900 bg-emerald-950 text-white shadow-md"
                      : "border-emerald-950/10 bg-white text-emerald-950 hover:border-emerald-700/25 hover:bg-emerald-50",
                  )}
                >
                  <span className="block truncate text-sm font-bold">{team.name}</span>
                  <span className="mt-1 block text-xs opacity-70">
                    {team.formation} · {team.filledSlots}/11 filled · {team.candidateCount}{" "}
                    candidates
                  </span>
                </button>
              ))}
            </div>
          </Panel>
        </aside>

        <main className="min-w-0 space-y-5">
          {!selectedTeamId && !teamsQuery.isLoading ? (
            <Panel>
              <StatusState
                title="Create a Shadow Team to begin"
                description="Choose a name and formation, then add candidates position by position."
              />
            </Panel>
          ) : null}
          {detailsQuery.isLoading ? (
            <Panel>
              <StatusState
                tone="loading"
                title="Preparing formation"
                description="Calculating gaps and alternatives."
              />
            </Panel>
          ) : null}
          {detailsQuery.isError ? (
            <Panel>
              <StatusState tone="error" title="Shadow Team could not be loaded" />
            </Panel>
          ) : null}
          {detail ? (
            <>
              <Panel className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Text as="h2" variant="h2" weight="extrabold">
                    {detail.name}
                  </Text>
                  <Text as="p" variant="body" tone="muted" className="mt-1">
                    {detail.formation} · Updated {formatUpdatedDate(detail.updatedAt)}
                  </Text>
                </div>
                <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
                  <OutlineIcons.TrashIcon className="h-4 w-4" aria-hidden="true" />
                  Delete team
                </Button>
              </Panel>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  label="Squad coverage"
                  value={`${detail.analytics.filledSlots}/${detail.analytics.totalSlots}`}
                  hint={`${detail.analytics.missingPositions.length} positions missing`}
                />
                <MetricCard
                  label="Average age"
                  value={detail.analytics.averageAge?.toFixed(1) ?? "—"}
                  hint="Primary candidates only"
                />
                <MetricCard
                  label="Estimated value"
                  value={currencyFormatter.format(detail.analytics.totalMarketValue)}
                  hint="Combined primary squad"
                />
                <MetricCard
                  label="Average ELO"
                  value={detail.analytics.averageElo?.toFixed(1) ?? "—"}
                  hint={`${detail.analytics.primaryPlayerCount} unique starters`}
                />
              </div>

              <div className="grid gap-3 lg:grid-cols-3">
                <StatusState
                  title={
                    detail.analytics.missingPositions.length
                      ? `${detail.analytics.missingPositions.length} positions missing`
                      : "Formation complete"
                  }
                  description={
                    detail.analytics.missingPositions.length
                      ? detail.analytics.missingPositions.map((item) => item.shortLabel).join(", ")
                      : "Every slot has a primary candidate."
                  }
                  tone={detail.analytics.missingPositions.length ? "error" : "empty"}
                />
                <StatusState
                  title={
                    detail.analytics.overstaffedPositions.length
                      ? `${detail.analytics.overstaffedPositions.length} shortlists active`
                      : "No position shortlists"
                  }
                  description={
                    detail.analytics.overstaffedPositions.length
                      ? detail.analytics.overstaffedPositions
                          .map((item) => `${item.shortLabel} (${item.count})`)
                          .join(", ")
                      : "Add alternatives to compare depth."
                  }
                />
                <StatusState
                  title={
                    detail.analytics.duplicatePlayers.length
                      ? `${detail.analytics.duplicatePlayers.length} duplicate assignments`
                      : "No duplicate players"
                  }
                  description={
                    detail.analytics.duplicatePlayers.length
                      ? "One or more candidates appear in several slots."
                      : "Every candidate has a clear role."
                  }
                  tone={detail.analytics.duplicatePlayers.length ? "error" : "empty"}
                />
              </div>

              <div className="grid gap-5 2xl:grid-cols-[minmax(0,1.35fr)_minmax(21rem,0.65fr)]">
                <Panel spacing="compact">
                  <div className="mb-3 flex items-center justify-between gap-3 px-1">
                    <div>
                      <Text as="h2" variant="h3" weight="bold">
                        Formation board
                      </Text>
                      <Text as="p" variant="caption" tone="muted">
                        Select a position to manage its shortlist.
                      </Text>
                    </div>
                    <span className="rounded-full border border-lime-300 bg-lime-100 px-3 py-1 text-sm font-extrabold text-emerald-950">
                      {detail.formation}
                    </span>
                  </div>
                  <div className="relative aspect-[3/4] min-h-[34rem] overflow-hidden rounded-[2rem] border-4 border-white bg-emerald-700 shadow-inner sm:aspect-[4/3] sm:min-h-[38rem]">
                    <div
                      className="absolute inset-4 rounded-[1.5rem] border-2 border-white/55"
                      aria-hidden="true"
                    />
                    <div
                      className="absolute top-1/2 right-4 left-4 border-t-2 border-white/55"
                      aria-hidden="true"
                    />
                    <div
                      className="absolute top-1/2 left-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/55"
                      aria-hidden="true"
                    />
                    <div
                      className="absolute top-4 left-1/2 h-20 w-1/2 -translate-x-1/2 border-2 border-t-0 border-white/55"
                      aria-hidden="true"
                    />
                    <div
                      className="absolute bottom-4 left-1/2 h-20 w-1/2 -translate-x-1/2 border-2 border-b-0 border-white/55"
                      aria-hidden="true"
                    />
                    {detail.slots.map((slot) => {
                      const ids = assignmentFor(detail.assignments, slot.id)
                      const players = ids
                        .map(
                          (id) =>
                            playersById.get(id) ??
                            detail.players.find((player) => player._id === id),
                        )
                        .filter((player): player is PlayerType => Boolean(player))
                      return (
                        <PitchSlot
                          key={slot.id}
                          slot={slot}
                          players={players}
                          selected={slot.id === selectedSlotId}
                          onSelect={() => setSelectedSlotId(slot.id)}
                        />
                      )
                    })}
                  </div>
                </Panel>

                <Panel className="self-start 2xl:sticky 2xl:top-24">
                  {selectedSlot ? (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Text
                            as="p"
                            variant="caption"
                            tone="muted"
                            className="font-bold tracking-wide uppercase"
                          >
                            {selectedSlot.shortLabel} · {selectedSlot.positionGroup}
                          </Text>
                          <Text as="h2" variant="h2" weight="extrabold" className="mt-1">
                            {selectedSlot.label}
                          </Text>
                        </div>
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">
                          {selectedIds.length}/5
                        </span>
                      </div>

                      <div className="mt-5 space-y-2">
                        {selectedPlayers.length ? (
                          selectedPlayers.map((player, index) => (
                            <div
                              key={player._id}
                              className="flex items-center gap-3 rounded-2xl border border-emerald-950/10 bg-white p-3"
                            >
                              <div className="min-w-0 flex-1">
                                <Text as="p" variant="body" weight="bold" className="truncate">
                                  {playerLabel(player)}
                                </Text>
                                <Text as="p" variant="caption" tone="muted">
                                  {index === 0 ? "Primary candidate" : `Alternative ${index}`} · ELO{" "}
                                  {player.elo || "—"}
                                </Text>
                              </div>
                              {index > 0 ? (
                                <Button
                                  size="xs"
                                  variant="ghost"
                                  onClick={() => makePrimary(player._id)}
                                >
                                  Set primary
                                </Button>
                              ) : null}
                              <Button
                                size="icon-sm"
                                variant="ghost"
                                aria-label={`Remove ${playerLabel(player)}`}
                                onClick={() =>
                                  replaceSlotPlayers(
                                    selectedSlot.id,
                                    selectedIds.filter((id) => id !== player._id),
                                  )
                                }
                              >
                                <OutlineIcons.XMarkIcon className="h-4 w-4" aria-hidden="true" />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <StatusState
                            title="Position is empty"
                            description="Add a primary candidate below."
                          />
                        )}
                      </div>

                      <div className="mt-6 border-t border-emerald-950/10 pt-5">
                        <div className="space-y-1.5">
                          <label
                            htmlFor="shadow-player-search"
                            className="block text-sm font-semibold text-emerald-950"
                          >
                            Find candidates
                          </label>
                          <Input
                            id="shadow-player-search"
                            type="search"
                            value={playerSearch}
                            onChange={(event) => setPlayerSearch(event.target.value)}
                            placeholder="Search name, club or country"
                            aria-describedby="shadow-player-search-hint"
                          />
                          <Text
                            id="shadow-player-search-hint"
                            as="p"
                            variant="caption"
                            tone="muted"
                          >
                            Showing {selectedSlot.positionGroup.toLowerCase()}s sorted by ELO.
                          </Text>
                        </div>
                        <div className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
                          {matchingPlayers.map((player) => (
                            <div
                              key={player._id}
                              className="flex items-center gap-3 rounded-xl bg-stone-50 p-2.5"
                            >
                              <div className="min-w-0 flex-1">
                                <Text as="p" variant="body" weight="semibold" className="truncate">
                                  {playerLabel(player)}
                                </Text>
                                <Text as="p" variant="caption" tone="muted" className="truncate">
                                  {player.currentClub || player.country} · ELO {player.elo || "—"}
                                </Text>
                              </div>
                              <Button
                                size="xs"
                                variant="outline"
                                disabled={selectedIds.length >= 5 || mutations.update.isPending}
                                onClick={() => addPlayer(player._id)}
                              >
                                Add
                              </Button>
                            </div>
                          ))}
                          {!matchingPlayers.length ? (
                            <Text as="p" variant="body" tone="muted" className="py-3 text-center">
                              No matching candidates found.
                            </Text>
                          ) : null}
                        </div>
                      </div>

                      <div className="mt-6 border-t border-emerald-950/10 pt-5">
                        <Text as="h3" variant="h3" weight="bold">
                          Best alternatives
                        </Text>
                        <Text as="p" variant="caption" tone="muted" className="mt-1">
                          Position-fit and similarity recommendations.
                        </Text>
                        <div className="mt-3 space-y-2">
                          {selectedAlternatives.map((item) => (
                            <div
                              key={item.player._id}
                              className="rounded-2xl border border-lime-200 bg-lime-50/60 p-3"
                            >
                              <div className="flex items-start gap-3">
                                <div className="min-w-0 flex-1">
                                  <Link
                                    href={`/players/${item.player._id}`}
                                    className="font-bold text-emerald-950 hover:underline"
                                  >
                                    {playerLabel(item.player)}
                                  </Link>
                                  <Text as="p" variant="caption" tone="muted">
                                    {item.player.currentClub || item.player.country}
                                  </Text>
                                </div>
                                <span className="rounded-full bg-emerald-950 px-2 py-1 text-xs font-extrabold text-white tabular-nums">
                                  {item.score}%
                                </span>
                              </div>
                              <Text
                                as="p"
                                variant="caption"
                                tone="muted"
                                className="mt-2 line-clamp-2"
                              >
                                {item.reasons.join(" · ")}
                              </Text>
                              <Button
                                className="mt-3"
                                size="xs"
                                variant="outline"
                                disabled={selectedIds.length >= 5 || mutations.update.isPending}
                                onClick={() => addPlayer(item.player._id)}
                              >
                                Add to shortlist
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : null}
                </Panel>
              </div>
            </>
          ) : null}
        </main>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Shadow Team?"
        description={`“${detail?.name ?? "This team"}” and its position assignments will be permanently removed.`}
        confirmLabel="Delete team"
        confirmTone="danger"
        isConfirming={mutations.remove.isPending}
        onConfirm={() =>
          detail &&
          mutations.remove.mutate(detail._id, {
            onSuccess: () => {
              setDeleteOpen(false)
              setSelectedTeamId("")
              toast.success("Shadow team deleted")
            },
            onError: () => toast.error("Shadow team could not be deleted"),
          })
        }
      />
    </PageContainer>
  )
}
