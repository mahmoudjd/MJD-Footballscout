"use client"
import { useEffect, useMemo, useState } from "react"
import Pagination from "@/components/pagination"
import PlayersTable from "./PlayersTable"
import { useDeletePlayerMutation } from "@/lib/hooks/mutations/useDeletePlayerMutation"
import { useUpdateAllPlayersMutation } from "@/lib/hooks/mutations/useUpdateAllPlayersMutation"
import PlayerFilters from "@/components/players/player-filters"
import { usePlayersQuery } from "@/lib/hooks/queries/usePlayersQuery"
import { useQueryClient } from "@tanstack/react-query"
import { usePlayerFilters } from "@/lib/hooks/usePlayerFilters"
import { useToast } from "@/lib/hooks/useToast"
import { Panel } from "@/components/ui/panel"
import { SectionHeader } from "@/components/ui/section-header"
import { PageContainer } from "@/components/ui/page-container"
import { PlayersTableSkeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Select } from "@/components/ui/select"
import { useSession } from "next-auth/react"
import { FeatureGuide } from "@/components/ui/feature-guide"
import { StatusState } from "@/components/ui/status-state"
import { OutlineIcons } from "@/components/outline-icons"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import { playersGuideSections } from "@/components/players/players-guide"
import { Chip } from "@/components/ui/chip"
import axios from "axios"

export default function PlayersPageView() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const isLoggedIn = Boolean(session?.user?.id)
  const isAdmin = session?.user?.role === "admin"
  const { data: players, isLoading, isError, error } = usePlayersQuery()
  const [currentPage, setCurrentPage] = useState(1)
  const [elemsPerPage, setElemsPerPage] = useState(5)
  const [playerToDeleteId, setPlayerToDeleteId] = useState<string | null>(null)
  const [isUpdateAllDialogOpen, setIsUpdateAllDialogOpen] = useState(false)
  const toast = useToast()
  const {
    filteredPlayers,
    selectedPosition,
    setSelectedPosition,
    selectedAgeGroup,
    setSelectedAgeGroup,
    selectedNationality,
    setSelectedNationality,
    clubQuery,
    setClubQuery,
    minAge,
    setMinAge,
    maxAge,
    setMaxAge,
    minElo,
    setMinElo,
    maxElo,
    setMaxElo,
    minValue,
    setMinValue,
    maxValue,
    setMaxValue,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    resetFilters,
  } = usePlayerFilters(players ?? [], setCurrentPage)
  const { mutateAsync: deletePlayer, isPending: isDeleting } = useDeletePlayerMutation()
  const { mutateAsync: updateAllPlayersMutation, isPending: isUpdatingAllPlayers } =
    useUpdateAllPlayersMutation()
  const currentPlayers = useMemo(() => {
    const idxOfLast = currentPage * elemsPerPage
    const idxOfFirst = idxOfLast - elemsPerPage
    return filteredPlayers.slice(idxOfFirst, idxOfLast)
  }, [filteredPlayers, currentPage, elemsPerPage])

  const totalPages = Math.max(1, Math.ceil(filteredPlayers.length / elemsPerPage))
  const totalPlayersCount = players?.length ?? 0
  const firstItemIndex = filteredPlayers.length === 0 ? 0 : (currentPage - 1) * elemsPerPage + 1
  const lastItemIndex = Math.min(currentPage * elemsPerPage, filteredPlayers.length)
  const activeFilterCount = [
    Boolean(selectedPosition),
    Boolean(selectedAgeGroup),
    Boolean(selectedNationality),
    Boolean(clubQuery),
    Boolean(minAge),
    Boolean(maxAge),
    Boolean(minElo),
    Boolean(maxElo),
    Boolean(minValue),
    Boolean(maxValue),
    sortBy !== "default",
    sortOrder !== "desc",
  ].filter(Boolean).length
  const hasActiveFilters = activeFilterCount > 0

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const headerDescription =
    filteredPlayers.length === 0
      ? `No players match your current criteria. ${totalPlayersCount} records are available in total.`
      : `Showing ${firstItemIndex}-${lastItemIndex} of ${filteredPlayers.length} filtered players from ${totalPlayersCount} total records.`

  const playerToDeleteName = useMemo(() => {
    if (!playerToDeleteId) return null
    return players?.find((player) => player._id === playerToDeleteId)?.name || null
  }, [players, playerToDeleteId])

  const getHttpStatusCode = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      return error.response?.status
    }
    return undefined
  }

  const getHttpErrorMessage = (error: unknown) => {
    if (axios.isAxiosError<{ error?: string; message?: string }>(error)) {
      return error.response?.data?.error || error.response?.data?.message
    }
    return undefined
  }

  const handleDeleteAndUpdate = async () => {
    if (!playerToDeleteId) return
    const deletingPlayerId = playerToDeleteId
    setPlayerToDeleteId(null)
    try {
      await deletePlayer({ playerId: deletingPlayerId })
      await queryClient.invalidateQueries({ queryKey: ["players"] })
      toast.success("Player deleted successfully!")

      if (currentPlayers.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => Math.max(1, prev - 1))
      }
    } catch (error: unknown) {
      if (getHttpStatusCode(error) === 403) {
        toast.error("Only admins can delete players.")
        return
      }
      toast.error("Failed to delete player!")
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages))
  }

  const handleElemsPerPageChange = (val: number) => {
    setElemsPerPage(val)
    setCurrentPage(1)
  }

  const handleUpdateAllPlayers = async () => {
    try {
      const response = await updateAllPlayersMutation()
      await queryClient.invalidateQueries({ queryKey: ["players"] })
      toast.success(response.message || "All players updated successfully!")
      setIsUpdateAllDialogOpen(false)
    } catch (error: unknown) {
      if (getHttpStatusCode(error) === 403) {
        toast.error("Only admins can update all players.")
        return
      }
      toast.error(getHttpErrorMessage(error) || "Failed to update all players.")
    }
  }

  const nationalities = useMemo(() => {
    const all = players
      ?.map((player) => player.country?.trim())
      .filter((country): country is string => Boolean(country))
    return Array.from(new Set(all)).sort((a, b) => a.localeCompare(b))
  }, [players])

  if (isError) {
    throw error
  }

  return (
    <PageContainer className="space-y-6" size="wide">
      <SectionHeader
        title="All Players"
        description={headerDescription}
        icon="UserIcon"
        badge={
          hasActiveFilters ? `${activeFilterCount} filters active` : `${filteredPlayers.length} found`
        }
        right={
          <div className="flex items-center gap-2">
            <FeatureGuide
              guideId="players-filters"
              title="How Filters Work"
              description="Use this guide to filter, sort, and manage players efficiently."
              sections={playersGuideSections}
              triggerLabel="Filter help"
            />
            {isAdmin ? (
              <Button
                type="button"
                onClick={() => setIsUpdateAllDialogOpen(true)}
                disabled={isUpdatingAllPlayers}
                variant="primary"
                size="md"
              >
                {isUpdatingAllPlayers ? "Updating all..." : "Update all players"}
              </Button>
            ) : null}
          </div>
        }
      />

      <Panel tone="soft" className="p-4">
        <PlayerFilters
          selectedPosition={selectedPosition}
          selectedAgeGroup={selectedAgeGroup}
          selectedNationality={selectedNationality}
          clubQuery={clubQuery}
          minAge={minAge}
          maxAge={maxAge}
          minElo={minElo}
          maxElo={maxElo}
          minValue={minValue}
          maxValue={maxValue}
          sortBy={sortBy}
          sortOrder={sortOrder}
          nationalities={nationalities}
          onPositionChange={setSelectedPosition}
          onAgeGroupChange={setSelectedAgeGroup}
          onNationalityChange={setSelectedNationality}
          onClubQueryChange={setClubQuery}
          onMinAgeChange={setMinAge}
          onMaxAgeChange={setMaxAge}
          onMinEloChange={setMinElo}
          onMaxEloChange={setMaxElo}
          onMinValueChange={setMinValue}
          onMaxValueChange={setMaxValue}
          onSortByChange={setSortBy}
          onSortOrderChange={setSortOrder}
          onReset={resetFilters}
        />
      </Panel>

      <Panel tone="soft" className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Chip tone="cyan" className="gap-1">
            <OutlineIcons.ChartBarIcon className="h-3.5 w-3.5" />
            {filteredPlayers.length} matched
          </Chip>
          <Chip tone="neutral" className="gap-1">
            <OutlineIcons.ArrowPathIcon className="h-3.5 w-3.5" />
            Showing {firstItemIndex}-{lastItemIndex}
          </Chip>
          {hasActiveFilters ? (
            <Chip tone="amber">
              {activeFilterCount} active filters
            </Chip>
          ) : null}
        </div>
        <Text as="p" variant="caption" tone="muted">
          Open profiles directly from rows, and use quick actions for admin maintenance.
        </Text>
      </Panel>

      <Panel className="overflow-hidden p-0">
        {isLoading ? (
          <PlayersTableSkeleton rows={Math.max(3, elemsPerPage)} />
        ) : currentPlayers.length === 0 ? (
          <div className="p-5">
            <StatusState
              tone="empty"
              title="No players match the current criteria"
              description="Adjust filters or reset to show more players."
            />
          </div>
        ) : (
          <PlayersTable
            players={currentPlayers}
            handleDeleteAndUpdate={setPlayerToDeleteId}
            isLoggedIn={isLoggedIn}
            isAdmin={isAdmin}
          />
        )}
      </Panel>

      <ConfirmDialog
        open={Boolean(playerToDeleteId)}
        onOpenChange={(open) => {
          if (!open) setPlayerToDeleteId(null)
        }}
        title="Delete player?"
        description={`This will permanently remove ${playerToDeleteName || "this player"} from the database.`}
        confirmLabel="Delete player"
        cancelLabel="Cancel"
        onConfirm={handleDeleteAndUpdate}
        isConfirming={isDeleting}
      />

      <ConfirmDialog
        open={isUpdateAllDialogOpen}
        onOpenChange={setIsUpdateAllDialogOpen}
        title="Update all players?"
        description="This will run a full refresh for all players and may take some time."
        confirmLabel="Start update"
        cancelLabel="Cancel"
        onConfirm={handleUpdateAllPlayers}
        isConfirming={isUpdatingAllPlayers}
      />

      <Panel
        tone="soft"
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
          <Text as="span" variant="body" weight="medium" className="text-slate-700">
            Items per page
          </Text>
          <div className="w-36">
            <Select
              value={String(elemsPerPage)}
              onValueChange={(value) => handleElemsPerPageChange(Number(value))}
              options={[
                { value: "5", label: "5 / page" },
                { value: "10", label: "10 / page" },
                { value: "25", label: "25 / page" },
              ]}
            />
          </div>
          <Text as="span" variant="caption" weight="semibold" tone="muted">
            Page {currentPage} of {totalPages}
          </Text>
        </div>

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            renderElementsOfPage={handlePageChange}
          />
        )}
      </Panel>
    </PageContainer>
  )
}
