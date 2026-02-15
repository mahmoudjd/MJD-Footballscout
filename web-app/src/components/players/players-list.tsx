"use client"
import { useMemo, useState } from "react"
import Pagination from "@/components/pagination"
import TableOfPlayers from "./TableOfPlayers"
import { useDeletePlayer } from "@/lib/hooks/mutations/use-delete-player"
import { useUpdateAllPlayers } from "@/lib/hooks/mutations/use-update-all-players"
import PlayerFilters from "@/components/players/player-filters"
import { useGetPlayers } from "@/lib/hooks/queries/use-get-players"
import { useQueryClient } from "@tanstack/react-query"
import { useFilterPlayers } from "@/lib/hooks/use-filter-players"
import { useToast } from "@/lib/hooks/use-toast"
import { Panel } from "@/components/ui/panel"
import { SectionHeader } from "@/components/ui/section-header"
import { PageContainer } from "@/components/ui/page-container"
import { PlayersTableSkeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Select } from "@/components/ui/select"
import { useSession } from "next-auth/react"
import { FeatureGuide, type GuideSection } from "@/components/ui/feature-guide"

const playersGuideSections: GuideSection[] = [
  {
    id: "filter",
    label: "1. Filter",
    description: "Narrow the players table using position, age, ELO, value and club criteria.",
    points: [
      "Use quick filters for position, age group, and nationality.",
      "Use min/max fields to target exact scouting ranges.",
      "Reset filters to return to the full list.",
    ],
  },
  {
    id: "sort",
    label: "2. Sort",
    description: "Sort by ELO, age, market value, name, or last update time.",
    points: [
      "Choose Sort By and Order to control ranking direction.",
      "Combine sorting with filters for shortlists.",
      "Pagination keeps the list readable on all devices.",
    ],
  },
  {
    id: "actions",
    label: "3. Actions",
    description: "Use table actions for maintenance and data freshness.",
    points: [
      "Admins can delete players directly from the table.",
      "Admins can trigger Update all players for full refresh.",
      "Non-admin users can still search, filter, and inspect players.",
    ],
  },
]

export default function PlayersList() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "admin"
  const { data: players, isLoading, isError, error } = useGetPlayers()
  const [currentPage, setCurrentPage] = useState(1)
  const [elemsPerPage, setElemsPerPage] = useState(5)
  const [playerToDeleteId, setPlayerToDeleteId] = useState<string | null>(null)
  const [isUpdateAllDialogOpen, setIsUpdateAllDialogOpen] = useState(false)
  const toast = useToast()
  if (isError) {
    throw error
  }
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
  } = useFilterPlayers(players ?? [], setCurrentPage)
  const { mutateAsync: deletePlayer, isPending: isDeleting } = useDeletePlayer()
  const { mutateAsync: updateAllPlayersMutation, isPending: isUpdatingAllPlayers } =
    useUpdateAllPlayers()
  const currentPlayers = useMemo(() => {
    const idxOfLast = currentPage * elemsPerPage
    const idxOfFirst = idxOfLast - elemsPerPage
    return filteredPlayers.slice(idxOfFirst, idxOfLast)
  }, [filteredPlayers, currentPage, elemsPerPage])

  const totalPages = Math.ceil(filteredPlayers.length / elemsPerPage)

  const playerToDeleteName = useMemo(() => {
    if (!playerToDeleteId) return null
    return players?.find((player) => player._id === playerToDeleteId)?.name || null
  }, [players, playerToDeleteId])

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
    } catch (error: any) {
      if (error?.response?.status === 403) {
        toast.error("Only admins can delete players.")
        return
      }
      toast.error("Failed to delete player!")
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
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
    } catch (error: any) {
      if (error?.response?.status === 403) {
        toast.error("Only admins can update all players.")
        return
      }
      toast.error(error?.message || "Failed to update all players.")
    }
  }

  const nationalities = useMemo(() => {
    const all = players
      ?.map((player) => player.country?.trim())
      .filter((country): country is string => Boolean(country))
    return Array.from(new Set(all)).sort((a, b) => a.localeCompare(b))
  }, [players])

  return (
    <PageContainer className="space-y-6" size="wide">
      <SectionHeader
        title="All Players"
        description={`Showing ${filteredPlayers.length} result${filteredPlayers.length !== 1 ? "s" : ""}`}
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
              <button
                type="button"
                onClick={() => setIsUpdateAllDialogOpen(true)}
                disabled={isUpdatingAllPlayers}
                className="rounded-md bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUpdatingAllPlayers ? "Updating all..." : "Update all players"}
              </button>
            ) : null}
          </div>
        }
      />

      <Panel className="p-4">
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

      <Panel className="overflow-hidden p-0">
        {isLoading ? (
          <PlayersTableSkeleton rows={Math.max(3, elemsPerPage)} />
        ) : (
          <TableOfPlayers players={currentPlayers} handleDeleteAndUpdate={setPlayerToDeleteId} />
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

      <Panel className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <label className="text-sm text-gray-600">Items per page:</label>
          <div className="w-28">
            <Select
              value={String(elemsPerPage)}
              onValueChange={(value) => handleElemsPerPageChange(Number(value))}
              options={[
                { value: "5", label: "5" },
                { value: "10", label: "10" },
                { value: "25", label: "25" },
              ]}
            />
          </div>
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
