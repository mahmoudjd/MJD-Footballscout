"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { signIn, useSession } from "next-auth/react"
import { useGetPlayers } from "@/lib/hooks/queries/use-get-players"
import { useComparePlayers } from "@/lib/hooks/queries/use-compare-players"
import { PageContainer } from "@/components/ui/page-container"
import { SectionHeader } from "@/components/ui/section-header"
import { Panel } from "@/components/ui/panel"
import { StatusState } from "@/components/ui/status-state"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { FeatureGuide, type GuideSection } from "@/components/ui/feature-guide"

const INITIAL_CANDIDATE_LIMIT = 20
const CANDIDATE_STEP = 20
const INITIAL_RESULT_LIMIT = 15
const RESULT_STEP = 15
const compareGuideSections: GuideSection[] = [
  {
    id: "select",
    label: "1. Select",
    description: "Pick players from the left side before running the comparison.",
    points: [
      "Use search to quickly find players by name, club, country, or position.",
      "Click Add/Selected to include or remove players from your set.",
      "Choose at least two players to compare.",
    ],
  },
  {
    id: "run",
    label: "2. Compare",
    description: "Apply your current selection or run an all-players comparison.",
    points: [
      "Use Compare selected players for your current set.",
      "Use Compare all players for a full ranking over available players.",
      "You can keep editing selection while results stay visible.",
    ],
  },
  {
    id: "read",
    label: "3. Read Results",
    description: "Interpret leaders and scoreboard to make scouting decisions.",
    points: [
      "Leaders cards highlight top ELO, value, and youngest players.",
      "Scoreboard ranks players by combined score.",
      "Use Show more results to review a larger sample.",
    ],
  },
]

function parseIds(raw: string | null) {
  if (!raw) return []
  return Array.from(
    new Set(
      raw
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean),
    ),
  )
}

function selectionsEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false
  for (let index = 0; index < a.length; index += 1) {
    if (a[index] !== b[index]) return false
  }
  return true
}

type MobileTab = "selection" | "results"

export function CompareView() {
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

  const playersQuery = useGetPlayers()
  const compareQuery = useComparePlayers(
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
        />
        <Panel className="space-y-4">
          <StatusState
            tone="empty"
            title="Login required"
            description="Comparison is available for authenticated users."
          />
          <button
            type="button"
            onClick={() => signIn(undefined, { callbackUrl: "/compare" })}
            className="rounded-md bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-600"
          >
            Go to login
          </button>
        </Panel>
      </PageContainer>
    )
  }

  return (
    <PageContainer className="space-y-6" size="wide">
      <SectionHeader
        title="Player Comparison"
        description="Compare one selection or all available players. Results stay visible while you edit selection."
        right={
          <div className="flex items-center gap-2">
            <FeatureGuide
              guideId="compare"
              title="How Comparison Works"
              description="Use this quick guide to select players, run comparison, and understand the ranking output."
              sections={compareGuideSections}
              triggerLabel="Compare help"
            />
            <span className="inline-flex rounded-md bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {selectedIds.length} selected
            </span>
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
            <button
              type="button"
              onClick={applySelection}
              disabled={selectedIds.length < 2 || !selectionDirty}
              className="rounded-md bg-cyan-700 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Compare selected players
            </button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={compareAllPlayers}
                    disabled={playersQuery.isLoading || allPlayers.length < 2}
                    className="rounded-md border border-cyan-700 px-3 py-2 text-sm font-semibold text-cyan-700 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Compare all players ({allPlayers.length})
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  Runs ranking against all currently available players.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <button
              type="button"
              onClick={clearSelection}
              disabled={selectedIds.length === 0}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear selection
            </button>
          </div>

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search players by name, club, country or position"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
          />

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            {selectedIds.length === 0 ? (
              <p className="text-sm text-slate-600">No players selected.</p>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                {selectedPreview.map((player) => (
                  <span
                    key={player._id}
                    className="rounded-md bg-cyan-100 px-2 py-1 text-xs font-medium text-cyan-800"
                  >
                    {player.name}
                  </span>
                ))}
                {selectedOverflow > 0 && (
                  <span className="rounded-md bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700">
                    +{selectedOverflow} more
                  </span>
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
                          <img
                            src={player.image}
                            alt={player.name}
                            className="h-10 w-10 rounded-full object-cover"
                            loading="lazy"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {player.name}
                            </p>
                            <p className="truncate text-xs text-slate-600">
                              {player.currentClub || "-"} • {player.country} • ELO {player.elo}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => togglePlayer(player._id)}
                            className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                              selected
                                ? "bg-cyan-700 text-white"
                                : "border border-cyan-700 text-cyan-700 hover:bg-cyan-50"
                            }`}
                          >
                            {selected ? "Selected" : "Add"}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
              {hasMoreCandidates && (
                <button
                  type="button"
                  onClick={() => setCandidateLimit((prev) => prev + CANDIDATE_STEP)}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Load more players
                </button>
              )}
            </>
          )}
        </Panel>

        <div className={`${mobileTab === "selection" ? "hidden xl:block" : "block"}`}>
          <div className="space-y-4 xl:sticky xl:top-20">
            <Panel className="space-y-2">
              <h3 className="text-base font-semibold text-slate-900">Comparison status</h3>
              <p className="text-sm text-slate-700">
                Applied players:{" "}
                <span className="font-semibold">
                  {appliedScope === "all" ? allPlayers.length : appliedIds.length}
                </span>
              </p>
              {selectionDirty && selectedIds.length >= 2 && (
                <button
                  type="button"
                  onClick={applySelection}
                  className="rounded-md border border-cyan-700 px-3 py-2 text-xs font-semibold text-cyan-700 hover:bg-cyan-50"
                >
                  Update results with current selection
                </button>
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
                    <h3 className="text-base font-semibold text-slate-900">Leaders</h3>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                          Highest ELO
                        </p>
                        <p className="mt-1 text-sm text-slate-800">
                          {metricWinners(metrics?.highestElo)}
                        </p>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                          Highest Market Value
                        </p>
                        <p className="mt-1 text-sm text-slate-800">
                          {metricWinners(metrics?.highestMarketValue)}
                        </p>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                          Youngest
                        </p>
                        <p className="mt-1 text-sm text-slate-800">
                          {metricWinners(metrics?.youngest)}
                        </p>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                          Recently Updated
                        </p>
                        <p className="mt-1 text-sm text-slate-800">
                          {metricWinners(metrics?.recentlyUpdated)}
                        </p>
                      </div>
                    </div>
                  </Panel>

                  <Panel className="space-y-3">
                    <h3 className="text-base font-semibold text-slate-900">Scoreboard</h3>
                    <div className="space-y-3 md:hidden">
                      {visibleComparedPlayers.map((player) => (
                        <article
                          key={player._id}
                          className="rounded-lg border border-slate-200 p-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900">
                                {rankOrderById.get(player._id) || "-"} . {player.name}
                              </p>
                              <p className="truncate text-xs text-slate-600">
                                {player.currentClub || player.country}
                              </p>
                              {isWinner(metrics?.recentlyUpdated, player._id) && (
                                <span className="mt-1 inline-flex rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                                  Recently updated
                                </span>
                              )}
                            </div>
                            <span className="rounded-md bg-cyan-100 px-2 py-0.5 text-xs font-semibold text-cyan-800">
                              {scoreById.get(player._id) ?? 0} pts
                            </span>
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                            <div
                              className={`rounded-md border px-2 py-1 ${isWinner(metrics?.youngest, player._id) ? "border-cyan-200 bg-cyan-50 text-cyan-800" : "border-slate-200 text-slate-700"}`}
                            >
                              <p className="text-[10px] font-semibold tracking-wide uppercase">
                                Age
                              </p>
                              <p className="mt-0.5 font-semibold">{player.age}</p>
                            </div>
                            <div
                              className={`rounded-md border px-2 py-1 ${isWinner(metrics?.highestElo, player._id) ? "border-cyan-200 bg-cyan-50 text-cyan-800" : "border-slate-200 text-slate-700"}`}
                            >
                              <p className="text-[10px] font-semibold tracking-wide uppercase">
                                ELO
                              </p>
                              <p className="mt-0.5 font-semibold">{player.elo}</p>
                            </div>
                            <div
                              className={`col-span-2 rounded-md border px-2 py-1 ${isWinner(metrics?.highestMarketValue, player._id) ? "border-cyan-200 bg-cyan-50 text-cyan-800" : "border-slate-200 text-slate-700"}`}
                            >
                              <p className="text-[10px] font-semibold tracking-wide uppercase">
                                Market value
                              </p>
                              <p className="mt-0.5 font-semibold">
                                {player.value} {player.currency}
                              </p>
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
                                <p>{player.name}</p>
                                {isWinner(metrics?.recentlyUpdated, player._id) && (
                                  <span className="mt-1 inline-flex rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                                    Recently updated
                                  </span>
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
                      <button
                        type="button"
                        onClick={() => setResultLimit((prev) => prev + RESULT_STEP)}
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Show more results
                      </button>
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
