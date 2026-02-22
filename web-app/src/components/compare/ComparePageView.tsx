"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { usePlayersQuery } from "@/lib/hooks/queries/usePlayersQuery"
import { usePlayerComparisonQuery } from "@/lib/hooks/queries/usePlayerComparisonQuery"
import Image from "next/image"
import { PageContainer } from "@/components/ui/page-container"
import { SectionHeader } from "@/components/ui/section-header"
import { Panel } from "@/components/ui/panel"
import { StatusState } from "@/components/ui/status-state"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { FeatureGuide } from "@/components/ui/feature-guide"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/cn"
import { Text } from "@/components/ui/text"
import { Input } from "@/components/ui/input"
import { LoginRequiredState } from "@/components/ui/login-required-state"
import { Chip } from "@/components/ui/chip"
import {
  CANDIDATE_STEP,
  INITIAL_CANDIDATE_LIMIT,
  INITIAL_RESULT_LIMIT,
  RESULT_STEP,
  compareGuideSections,
  parseIds,
  selectionsEqual,
} from "@/components/compare/compare-config"
import { getPlayerImageSrc } from "@/lib/player-image"

type MobileTab = "selection" | "results"

export function ComparePageView() {
  const { status, data: session } = useSession()
  const isLoggedIn = !!session?.user?.id
  const searchParams = useSearchParams()

  const [search, setSearch] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [appliedIds, setAppliedIds] = useState<string[]>([])
  const [appliedScope, setAppliedScope] = useState<"selection" | "all">("selection")
  const [candidateLimit, setCandidateLimit] = useState(INITIAL_CANDIDATE_LIMIT)
  const [resultLimit, setResultLimit] = useState(INITIAL_RESULT_LIMIT)
  const [mobileTab, setMobileTab] = useState<MobileTab>("selection")

  const playersQuery = usePlayersQuery()
  const compareQuery = usePlayerComparisonQuery(
    isLoggedIn ? appliedIds : [],
    isLoggedIn && appliedScope === "all",
  )

  useEffect(() => {
    const idsFromUrl = parseIds(searchParams.get("ids"))
    if (idsFromUrl.length > 0) {
      setSelectedIds(idsFromUrl)
      setAppliedIds(idsFromUrl)
      setAppliedScope("selection")
    }
  }, [searchParams])

  useEffect(() => {
    setCandidateLimit(INITIAL_CANDIDATE_LIMIT)
  }, [search])

  useEffect(() => {
    setResultLimit(INITIAL_RESULT_LIMIT)
  }, [appliedIds])

  const allPlayers = useMemo(() => playersQuery.data ?? [], [playersQuery.data])
  const byId = useMemo(
    () => new Map(allPlayers.map((player) => [player._id, player])),
    [allPlayers],
  )
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])

  const filteredCandidates = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return allPlayers
    return allPlayers.filter((player) =>
      `${player.name} ${player.fullName} ${player.country} ${player.currentClub} ${player.position}`
        .toLowerCase()
        .includes(term),
    )
  }, [allPlayers, search])

  const visibleCandidates = useMemo(
    () => filteredCandidates.slice(0, candidateLimit),
    [filteredCandidates, candidateLimit],
  )
  const hasMoreCandidates = filteredCandidates.length > candidateLimit

  const selectedPlayers = useMemo(
    () =>
      selectedIds.flatMap((id) => {
        const player = byId.get(id)
        return player ? [player] : []
      }),
    [selectedIds, byId],
  )
  const selectedPreview = selectedPlayers.slice(0, 8)
  const selectedOverflow = Math.max(0, selectedPlayers.length - selectedPreview.length)

  const comparedPlayers = useMemo(
    () => compareQuery.data?.players ?? [],
    [compareQuery.data?.players],
  )
  const metrics = compareQuery.data?.metrics
  const ranking = useMemo(() => compareQuery.data?.ranking ?? [], [compareQuery.data?.ranking])

  const rankOrderById = useMemo(
    () => new Map(ranking.map((item, index) => [item.playerId, index + 1])),
    [ranking],
  )
  const scoreById = useMemo(
    () => new Map(ranking.map((item) => [item.playerId, item.score])),
    [ranking],
  )

  const orderedComparedPlayers = useMemo(() => {
    if (ranking.length === 0) return comparedPlayers
    return [...comparedPlayers].sort((a, b) => {
      const aRank = rankOrderById.get(String(a._id)) ?? Number.MAX_SAFE_INTEGER
      const bRank = rankOrderById.get(String(b._id)) ?? Number.MAX_SAFE_INTEGER
      return aRank - bRank
    })
  }, [comparedPlayers, ranking, rankOrderById])

  const visibleComparedPlayers = useMemo(
    () => orderedComparedPlayers.slice(0, resultLimit),
    [orderedComparedPlayers, resultLimit],
  )
  const hasMoreResults = orderedComparedPlayers.length > resultLimit

  const selectionRepresentsAll = allPlayers.length > 0 && selectedIds.length === allPlayers.length
  const selectionDirty =
    appliedScope === "all" ? !selectionRepresentsAll : !selectionsEqual(selectedIds, appliedIds)
  const hasActiveComparison = appliedScope === "all" || appliedIds.length >= 2

  const metricWinners = (ids: string[] = []) => {
    if (ids.length === 0) return "-"
    return ids.map((id) => byId.get(id)?.name || id).join(", ")
  }
  const isWinner = (group: string[] | undefined, playerId: string) => !!group?.includes(playerId)

  const togglePlayer = (playerId: string) => {
    setSelectedIds((current) =>
      current.includes(playerId) ? current.filter((id) => id !== playerId) : [...current, playerId],
    )
  }

  const applySelection = () => {
    if (selectedIds.length < 2) return
    setAppliedIds(selectedIds)
    setAppliedScope("selection")
    setMobileTab("results")
  }

  const compareAllPlayers = () => {
    if (allPlayers.length < 2) return
    const allIds = allPlayers.map((player) => player._id)
    setSelectedIds(allIds)
    setAppliedIds([])
    setAppliedScope("all")
    setMobileTab("results")
  }

  const clearSelection = () => {
    setSelectedIds([])
    setAppliedIds([])
    setAppliedScope("selection")
  }

  if (status === "loading") {
    return (
      <PageContainer className="space-y-6" size="wide">
        <SectionHeader
          title="Player Comparison"
          description="Select players on the left and keep results visible on the right."
          icon="ArrowsRightLeftIcon"
        />
        <Panel>
          <StatusState tone="loading" title="Checking session" />
        </Panel>
      </PageContainer>
    )
  }

  if (!isLoggedIn) {
    return (
      <PageContainer className="space-y-6" size="wide">
        <SectionHeader
          title="Player Comparison"
          description="Select players on the left and keep results visible on the right."
          icon="ArrowsRightLeftIcon"
        />
        <LoginRequiredState
          callbackUrl="/compare"
          description="Comparison is available for authenticated users."
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer className="space-y-6" size="wide">
      <SectionHeader
        title="Player Comparison"
        description="Compare one selection or all available players. Results stay visible while you edit selection."
        icon="ArrowsRightLeftIcon"
        badge={`${selectedIds.length} selected`}
        right={
          <div className="flex items-center gap-2">
            <FeatureGuide
              guideId="compare"
              title="How Comparison Works"
              description="Use this quick guide to select players, run comparison, and understand the ranking output."
              sections={compareGuideSections}
              triggerLabel="Compare help"
            />
          </div>
        }
      />

      <Tabs
        value={mobileTab}
        onValueChange={(value) => setMobileTab(value as MobileTab)}
        className="xl:hidden"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="selection">Selection</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Panel className={`${mobileTab === "results" ? "hidden xl:block" : "block"} space-y-4`}>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              onClick={applySelection}
              disabled={selectedIds.length < 2 || !selectionDirty}
              variant="primary"
              size="sm"
            >
              Compare selected players
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    onClick={compareAllPlayers}
                    disabled={playersQuery.isLoading || allPlayers.length < 2}
                    variant="outline"
                    size="sm"
                    className="border-cyan-700 text-cyan-700 hover:bg-cyan-50"
                  >
                    Compare all players ({allPlayers.length})
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  Runs ranking against all currently available players.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button
              type="button"
              onClick={clearSelection}
              disabled={selectedIds.length === 0}
              variant="outline"
              size="sm"
            >
              Clear selection
            </Button>
          </div>

          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search players by name, club, country or position"
            inputSize="sm"
          />

          <div className="rounded-xl border border-slate-200 bg-slate-50/90 p-3">
            {selectedIds.length === 0 ? (
              <Text as="p" tone="muted">
                No players selected.
              </Text>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                {selectedPreview.map((player) => (
                  <Chip
                    key={player._id}
                    tone="cyan"
                    className="bg-cyan-100/80 text-cyan-800"
                  >
                    {player.name}
                  </Chip>
                ))}
                {selectedOverflow > 0 && (
                  <Chip tone="slate">
                    +{selectedOverflow} more
                  </Chip>
                )}
              </div>
            )}
          </div>

          {playersQuery.isLoading && <StatusState tone="loading" title="Loading players" />}
          {playersQuery.isError && <StatusState tone="error" title="Unable to load players" />}

          {!playersQuery.isLoading && !playersQuery.isError && (
            <>
              <div className="max-h-[62vh] overflow-y-auto rounded-xl border border-slate-200">
                {visibleCandidates.length === 0 ? (
                  <div className="p-4">
                    <StatusState
                      tone="empty"
                      title="No players found"
                      description="Try a different search term."
                    />
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-200">
                    {visibleCandidates.map((player) => {
                      const selected = selectedSet.has(player._id)
                      return (
                        <li key={player._id} className="flex items-center gap-3 px-3 py-3">
                          <Image
                            src={getPlayerImageSrc(player.image)}
                            alt={player.name}
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-full object-cover"
                            sizes="40px"
                          />
                          <div className="min-w-0 flex-1">
                            <Text as="p" weight="semibold" className="truncate text-slate-900">
                              {player.name}
                            </Text>
                            <Text as="p" variant="caption" tone="muted" className="truncate">
                              {player.currentClub || "-"} • {player.country} • ELO {player.elo}
                            </Text>
                          </div>
                          <Button
                            type="button"
                            onClick={() => togglePlayer(player._id)}
                            variant={selected ? "primary" : "outline"}
                            size="xs"
                            className={cn(
                              "rounded-md",
                              !selected && "border-cyan-700 text-cyan-700 hover:bg-cyan-50",
                            )}
                          >
                            {selected ? "Selected" : "Add"}
                          </Button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
              {hasMoreCandidates && (
                <Button
                  type="button"
                  onClick={() => setCandidateLimit((prev) => prev + CANDIDATE_STEP)}
                  variant="outline"
                  size="sm"
                >
                  Load more players
                </Button>
              )}
            </>
          )}
        </Panel>

        <div className={`${mobileTab === "selection" ? "hidden xl:block" : "block"}`}>
          <div className="space-y-4 xl:sticky xl:top-20">
            <Panel className="space-y-2">
              <Text as="h3" variant="body-lg" weight="semibold" className="text-slate-900">
                Comparison status
              </Text>
              <Text as="p" className="text-slate-700">
                Applied players:{" "}
                <Text as="span" weight="semibold">
                  {appliedScope === "all" ? allPlayers.length : appliedIds.length}
                </Text>
              </Text>
              {selectionDirty && selectedIds.length >= 2 && (
                <Button
                  type="button"
                  onClick={applySelection}
                  variant="outline"
                  size="xs"
                  className="border-cyan-700 text-cyan-700 hover:bg-cyan-50"
                >
                  Update results with current selection
                </Button>
              )}
            </Panel>

            {!hasActiveComparison ? (
              <Panel>
                <StatusState
                  tone="empty"
                  title="Select at least two players"
                  description="Use the selection panel to start comparison."
                />
              </Panel>
            ) : null}

            {hasActiveComparison && compareQuery.isLoading && (
              <Panel>
                <StatusState tone="loading" title="Building comparison" />
              </Panel>
            )}

            {hasActiveComparison && compareQuery.isError && (
              <Panel>
                <StatusState
                  tone="error"
                  title="Comparison failed"
                  description="Try again with another selection."
                />
              </Panel>
            )}

            {hasActiveComparison &&
              !compareQuery.isLoading &&
              !compareQuery.isError &&
              comparedPlayers.length > 0 && (
                <>
                  <Panel className="space-y-3">
                    <Text as="h3" variant="body-lg" weight="semibold" className="text-slate-900">
                      Leaders
                    </Text>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <Text as="p" variant="overline" weight="semibold" tone="subtle">
                          Highest ELO
                        </Text>
                        <Text as="p" className="mt-1 text-slate-800">
                          {metricWinners(metrics?.highestElo)}
                        </Text>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <Text as="p" variant="overline" weight="semibold" tone="subtle">
                          Highest Market Value
                        </Text>
                        <Text as="p" className="mt-1 text-slate-800">
                          {metricWinners(metrics?.highestMarketValue)}
                        </Text>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <Text as="p" variant="overline" weight="semibold" tone="subtle">
                          Youngest
                        </Text>
                        <Text as="p" className="mt-1 text-slate-800">
                          {metricWinners(metrics?.youngest)}
                        </Text>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <Text as="p" variant="overline" weight="semibold" tone="subtle">
                          Recently Updated
                        </Text>
                        <Text as="p" className="mt-1 text-slate-800">
                          {metricWinners(metrics?.recentlyUpdated)}
                        </Text>
                      </div>
                    </div>
                  </Panel>

                  <Panel className="space-y-3">
                    <Text as="h3" variant="body-lg" weight="semibold" className="text-slate-900">
                      Scoreboard
                    </Text>
                    <div className="space-y-3 md:hidden">
                      {visibleComparedPlayers.map((player) => (
                        <article
                          key={player._id}
                          className="rounded-lg border border-slate-200 p-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <Text as="p" weight="semibold" className="truncate text-slate-900">
                                {rankOrderById.get(player._id) || "-"} . {player.name}
                              </Text>
                              <Text as="p" variant="caption" tone="muted" className="truncate">
                                {player.currentClub || player.country}
                              </Text>
                              {isWinner(metrics?.recentlyUpdated, player._id) && (
                                <Chip tone="success" size="xs" className="mt-1">
                                  Recently updated
                                </Chip>
                              )}
                            </div>
                            <Chip tone="cyan" size="xs" className="rounded-md bg-cyan-100 text-cyan-800">
                              {scoreById.get(player._id) ?? 0} pts
                            </Chip>
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                            <div
                              className={`rounded-md border px-2 py-1 ${isWinner(metrics?.youngest, player._id) ? "border-cyan-200 bg-cyan-50 text-cyan-800" : "border-slate-200 text-slate-700"}`}
                            >
                              <Text as="p" variant="overline" weight="semibold">
                                Age
                              </Text>
                              <Text as="p" weight="semibold" className="mt-0.5">
                                {player.age}
                              </Text>
                            </div>
                            <div
                              className={`rounded-md border px-2 py-1 ${isWinner(metrics?.highestElo, player._id) ? "border-cyan-200 bg-cyan-50 text-cyan-800" : "border-slate-200 text-slate-700"}`}
                            >
                              <Text as="p" variant="overline" weight="semibold">
                                ELO
                              </Text>
                              <Text as="p" weight="semibold" className="mt-0.5">
                                {player.elo}
                              </Text>
                            </div>
                            <div
                              className={`col-span-2 rounded-md border px-2 py-1 ${isWinner(metrics?.highestMarketValue, player._id) ? "border-cyan-200 bg-cyan-50 text-cyan-800" : "border-slate-200 text-slate-700"}`}
                            >
                              <Text as="p" variant="overline" weight="semibold">
                                Market value
                              </Text>
                              <Text as="p" weight="semibold" className="mt-0.5">
                                {player.value} {player.currency}
                              </Text>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>

                    <div className="hidden overflow-x-auto rounded-lg border border-slate-200 md:block">
                      <table className="min-w-full divide-y divide-slate-200 text-xs lg:text-sm">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-3 py-2 text-left font-semibold text-slate-700">#</th>
                            <th className="px-3 py-2 text-left font-semibold text-slate-700">
                              Player
                            </th>
                            <th className="px-3 py-2 text-left font-semibold text-slate-700">
                              Score
                            </th>
                            <th className="px-3 py-2 text-left font-semibold text-slate-700">
                              Age
                            </th>
                            <th className="px-3 py-2 text-left font-semibold text-slate-700">
                              ELO
                            </th>
                            <th className="px-3 py-2 text-left font-semibold text-slate-700">
                              Value
                            </th>
                            <th className="hidden px-3 py-2 text-left font-semibold text-slate-700 lg:table-cell">
                              Club
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {visibleComparedPlayers.map((player) => (
                            <tr key={player._id} className="align-top">
                              <td className="px-3 py-2 text-slate-600">
                                {rankOrderById.get(player._id) || "-"}
                              </td>
                              <td className="px-3 py-2 font-medium text-slate-900">
                                <Text as="p">{player.name}</Text>
                                {isWinner(metrics?.recentlyUpdated, player._id) && (
                                  <Chip tone="success" size="xs" className="mt-1">
                                    Recently updated
                                  </Chip>
                                )}
                              </td>
                              <td className="px-3 py-2 text-slate-700">
                                {scoreById.get(player._id) ?? 0}
                              </td>
                              <td
                                className={`px-3 py-2 ${isWinner(metrics?.youngest, player._id) ? "bg-cyan-50 font-semibold text-cyan-800" : "text-slate-700"}`}
                              >
                                {player.age}
                              </td>
                              <td
                                className={`px-3 py-2 ${isWinner(metrics?.highestElo, player._id) ? "bg-cyan-50 font-semibold text-cyan-800" : "text-slate-700"}`}
                              >
                                {player.elo}
                              </td>
                              <td
                                className={`px-3 py-2 ${isWinner(metrics?.highestMarketValue, player._id) ? "bg-cyan-50 font-semibold text-cyan-800" : "text-slate-700"}`}
                              >
                                {player.value} {player.currency}
                              </td>
                              <td className="hidden px-3 py-2 text-slate-700 lg:table-cell">
                                {player.currentClub || "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {hasMoreResults && (
                      <Button
                        type="button"
                        onClick={() => setResultLimit((prev) => prev + RESULT_STEP)}
                        variant="outline"
                        size="sm"
                      >
                        Show more results
                      </Button>
                    )}
                  </Panel>
                </>
              )}
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
