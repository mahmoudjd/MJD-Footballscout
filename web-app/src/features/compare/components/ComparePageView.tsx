"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { usePlayersQuery } from "@/features/players/hooks/usePlayersQuery"
import { usePlayerComparisonQuery } from "@/features/compare/hooks/usePlayerComparisonQuery"
import { PageContainer } from "@/components/ui/page-container"
import { SectionHeader } from "@/components/ui/section-header"
import { Panel } from "@/components/ui/panel"
import { StatusState } from "@/components/ui/status-state"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FeatureGuide } from "@/components/ui/feature-guide"
import { LoginRequiredState } from "@/components/ui/login-required-state"
import {
  CANDIDATE_STEP,
  INITIAL_CANDIDATE_LIMIT,
  INITIAL_RESULT_LIMIT,
  RESULT_STEP,
  compareGuideSections,
  parseIds,
  selectionsEqual,
} from "@/features/compare/compare-config"
import { CompareSelectionPanel } from "@/features/compare/components/compare-selection-panel"
import { CompareResultsPanel } from "@/features/compare/components/compare-results-panel"

type MobileTab = "selection" | "results"

const compareHeader = {
  title: "Player Comparison",
  description: "Select players on the left and keep results visible on the right.",
  icon: "ArrowsRightLeftIcon",
} as const

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

  const playersQuery = usePlayersQuery(isLoggedIn)
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
  const playersById = useMemo(
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
        const player = playersById.get(id)
        return player ? [player] : []
      }),
    [selectedIds, playersById],
  )
  const selectedPreview = selectedPlayers.slice(0, 8)
  const selectedOverflow = Math.max(0, selectedPlayers.length - selectedPreview.length)

  const comparedPlayers = useMemo(() => compareQuery.data?.players ?? [], [compareQuery.data?.players])
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
        <SectionHeader {...compareHeader} />
        <Panel>
          <StatusState tone="loading" title="Checking session" />
        </Panel>
      </PageContainer>
    )
  }

  if (!isLoggedIn) {
    return (
      <PageContainer className="space-y-6" size="wide">
        <SectionHeader {...compareHeader} />
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
          <FeatureGuide
            guideId="compare"
            title="How Comparison Works"
            description="Use this quick guide to select players, run comparison, and understand the ranking output."
            sections={compareGuideSections}
            triggerLabel="Compare help"
          />
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
          <CompareSelectionPanel
            selectedIds={selectedIds}
            selectedPreview={selectedPreview}
            selectedOverflow={selectedOverflow}
            search={search}
            onSearchChange={setSearch}
            onApplySelection={applySelection}
            onCompareAllPlayers={compareAllPlayers}
            onClearSelection={clearSelection}
            selectionDirty={selectionDirty}
            allPlayersCount={allPlayers.length}
            isPlayersLoading={playersQuery.isLoading}
            isPlayersError={playersQuery.isError}
            visibleCandidates={visibleCandidates}
            selectedSet={selectedSet}
            onTogglePlayer={togglePlayer}
            hasMoreCandidates={hasMoreCandidates}
            onLoadMoreCandidates={() => setCandidateLimit((prev) => prev + CANDIDATE_STEP)}
          />
        </Panel>

        <div className={`${mobileTab === "selection" ? "hidden xl:block" : "block"}`}>
          <div className="space-y-4 xl:sticky xl:top-20">
            <CompareResultsPanel
              allPlayersCount={allPlayers.length}
              appliedScope={appliedScope}
              appliedIdsCount={appliedIds.length}
              selectionDirty={selectionDirty}
              selectedIdsCount={selectedIds.length}
              onApplySelection={applySelection}
              hasActiveComparison={hasActiveComparison}
              isComparisonLoading={compareQuery.isLoading}
              isComparisonError={compareQuery.isError}
              metrics={compareQuery.data?.metrics}
              comparedPlayers={comparedPlayers}
              visibleComparedPlayers={visibleComparedPlayers}
              rankOrderById={rankOrderById}
              scoreById={scoreById}
              playersById={playersById}
              hasMoreResults={hasMoreResults}
              onLoadMoreResults={() => setResultLimit((prev) => prev + RESULT_STEP)}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
