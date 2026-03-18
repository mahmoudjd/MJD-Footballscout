"use client"

import { useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import { useQueryClient } from "@tanstack/react-query"
import Pagination from "@/components/common/pagination"
import PlayersTable from "@/features/players/components/PlayersTable"
import PlayerFilters from "@/features/players/components/player-filters"
import { useDeletePlayerMutation } from "@/features/players/hooks/useDeletePlayerMutation"
import { useUpdateAllPlayersMutation } from "@/features/players/hooks/useUpdateAllPlayersMutation"
import { usePlayersQuery } from "@/features/players/hooks/usePlayersQuery"
import { usePlayerFilters } from "@/features/players/hooks/usePlayerFilters"
import { useToast } from "@/lib/hooks/useToast"
import { getAxiosErrorMessage, getAxiosErrorStatus } from "@/lib/http/axios-errors"
import { Panel } from "@/components/ui/panel"
import { SectionHeader } from "@/components/ui/section-header"
import { PageContainer } from "@/components/ui/page-container"
import { PlayersTableSkeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Select } from "@/components/ui/select"
import { FeatureGuide } from "@/components/ui/feature-guide"
import { StatusState } from "@/components/ui/status-state"
import { OutlineIcons } from "@/components/icons/outline-icons"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import { playersGuideSections } from "@/features/players/components/players-guide"
import { Chip } from "@/components/ui/chip"
import { queryKeys } from "@/lib/react-query/query-keys"

const PAGE_SIZE_OPTIONS = [5, 10, 25] as const
const DEFAULT_PAGE_SIZE = PAGE_SIZE_OPTIONS[0]

type PageSize = (typeof PAGE_SIZE_OPTIONS)[number]

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export default function PlayersPageView() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const isLoggedIn = Boolean(session?.user?.id)
  const isAdmin = session?.user?.role === "admin"
  const toast = useToast()

  const { data: players, isLoading, isError, error } = usePlayersQuery()
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState<PageSize>(DEFAULT_PAGE_SIZE)
  const [playerToDeleteId, setPlayerToDeleteId] = useState<string | null>(null)
  const [isUpdateAllDialogOpen, setIsUpdateAllDialogOpen] = useState(false)

  const {
    filteredPlayers,
    activeFilterCount,
    hasActiveFilters,
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

  const playersById = useMemo(() => {
    return new Map((players ?? []).map((player) => [player._id, player]))
  }, [players])

  const pagination = useMemo(() => {
    const totalPages = Math.max(1, Math.ceil(filteredPlayers.length / itemsPerPage))
    const lastIndex = currentPage * itemsPerPage
    const firstIndex = lastIndex - itemsPerPage
    const currentPlayers = filteredPlayers.slice(firstIndex, lastIndex)
    const firstItemIndex = filteredPlayers.length === 0 ? 0 : firstIndex + 1
    const lastItemIndex = Math.min(lastIndex, filteredPlayers.length)

    return {
      totalPages,
      currentPlayers,
      firstItemIndex,
      lastItemIndex,
    }
  }, [filteredPlayers, currentPage, itemsPerPage])

  const totalPlayersCount = players?.length ?? 0

  const headerDescription =
    filteredPlayers.length === 0
      ? `No players match your current criteria. ${totalPlayersCount} records are available in total.`
      : `Showing ${pagination.firstItemIndex}-${pagination.lastItemIndex} of ${filteredPlayers.length} filtered players from ${totalPlayersCount} total records.`

  const playerToDeleteName = playerToDeleteId
    ? playersById.get(playerToDeleteId)?.name || null
    : null

  useEffect(() => {
    if (currentPage > pagination.totalPages) {
      setCurrentPage(pagination.totalPages)
    }
  }, [currentPage, pagination.totalPages])

  const handleDeleteAndUpdate = async () => {
    if (!playerToDeleteId) return

    const deletingPlayerId = playerToDeleteId
    setPlayerToDeleteId(null)

    try {
      await deletePlayer({ playerId: deletingPlayerId })
      await queryClient.invalidateQueries({ queryKey: queryKeys.players.all })
      toast.success("Player deleted successfully!")

      if (pagination.currentPlayers.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => Math.max(1, prev - 1))
      }
    } catch (error: unknown) {
      if (getAxiosErrorStatus(error) === 403) {
        toast.error("Only admins can delete players.")
        return
      }
      toast.error("Failed to delete player!")
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(clamp(page, 1, pagination.totalPages))
  }

  const handleItemsPerPageChange = (value: number) => {
    const nextValue = PAGE_SIZE_OPTIONS.includes(value as PageSize)
      ? (value as PageSize)
      : DEFAULT_PAGE_SIZE
    setItemsPerPage(nextValue)
    setCurrentPage(1)
  }

  const handleUpdateAllPlayers = async () => {
    try {
      const response = await updateAllPlayersMutation()
      await queryClient.invalidateQueries({ queryKey: queryKeys.players.all })
      toast.success(response.message || "All players updated successfully!")
      setIsUpdateAllDialogOpen(false)
    } catch (error: unknown) {
      if (getAxiosErrorStatus(error) === 403) {
        toast.error("Only admins can update all players.")
        return
      }
      toast.error(getAxiosErrorMessage(error) || "Failed to update all players.")
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
          hasActiveFilters
            ? `${activeFilterCount} filters active`
            : `${filteredPlayers.length} found`
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
          <Chip tone="amber" className="gap-1">
            <OutlineIcons.ChartBarIcon className="h-3.5 w-3.5" />
            {filteredPlayers.length} matched
          </Chip>
          <Chip tone="neutral" className="gap-1">
            <OutlineIcons.ArrowPathIcon className="h-3.5 w-3.5" />
            Showing {pagination.firstItemIndex}-{pagination.lastItemIndex}
          </Chip>
          {hasActiveFilters ? <Chip tone="amber">{activeFilterCount} active filters</Chip> : null}
        </div>
        <Text as="p" variant="caption" tone="muted">
          Open profiles directly from rows, and use quick actions for admin maintenance.
        </Text>
      </Panel>

      <Panel className="overflow-hidden p-0">
        {isLoading ? (
          <PlayersTableSkeleton rows={Math.max(3, itemsPerPage)} />
        ) : pagination.currentPlayers.length === 0 ? (
          <div className="p-5">
            <StatusState
              tone="empty"
              title="No players match the current criteria"
              description="Adjust filters or reset to show more players."
            />
          </div>
        ) : (
          <PlayersTable
            players={pagination.currentPlayers}
            onRequestDelete={setPlayerToDeleteId}
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

      <Panel tone="soft" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
          <Text as="span" variant="body" weight="medium" className="text-stone-700">
            Items per page
          </Text>
          <div className="w-36">
            <Select
              value={String(itemsPerPage)}
              onValueChange={(value) => handleItemsPerPageChange(Number(value))}
              options={PAGE_SIZE_OPTIONS.map((size) => ({
                value: String(size),
                label: `${size} / page`,
              }))}
            />
          </div>
          <Text as="span" variant="caption" weight="semibold" tone="muted">
            Page {currentPage} of {pagination.totalPages}
          </Text>
        </div>

        {pagination.totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            renderElementsOfPage={handlePageChange}
          />
        )}
      </Panel>
    </PageContainer>
  )
}
