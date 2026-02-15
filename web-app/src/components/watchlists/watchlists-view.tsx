"use client"

import { useEffect, useMemo, useState } from "react"
import { signIn, useSession } from "next-auth/react"
import { useQueryClient } from "@tanstack/react-query"
import { useGetWatchlists } from "@/lib/hooks/queries/use-get-watchlists"
import { useGetWatchlist } from "@/lib/hooks/queries/use-get-watchlist"
import { useGetPlayers } from "@/lib/hooks/queries/use-get-players"
import { useCreateWatchlist } from "@/lib/hooks/mutations/use-create-watchlist"
import { useDeleteWatchlist } from "@/lib/hooks/mutations/use-delete-watchlist"
import { useUpdateWatchlist } from "@/lib/hooks/mutations/use-update-watchlist"
import { useAddPlayerToWatchlist } from "@/lib/hooks/mutations/use-add-player-to-watchlist"
import { useRemovePlayerFromWatchlist } from "@/lib/hooks/mutations/use-remove-player-from-watchlist"
import { useReorderWatchlistPlayers } from "@/lib/hooks/mutations/use-reorder-watchlist-players"
import { Panel } from "@/components/ui/panel"
import { SectionHeader } from "@/components/ui/section-header"
import { StatusState } from "@/components/ui/status-state"
import { PlayerSummaryCard } from "@/components/ui/player-summary-card"
import { useToast } from "@/lib/hooks/use-toast"
import { PageContainer } from "@/components/ui/page-container"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { WatchlistDetailsSkeleton, WatchlistsPanelSkeleton } from "@/components/ui/skeleton"
import { Select } from "@/components/ui/select"
import { FeatureGuide, type GuideSection } from "@/components/ui/feature-guide"

const watchlistGuideSections: GuideSection[] = [
  {
    id: "create",
    label: "1. Create",
    description: "Create dedicated boards for different scouting strategies.",
    points: [
      "Set a clear watchlist name (e.g. U23 targets).",
      "Add optional description for scouting context.",
      "Select a board from the left panel to work on it.",
    ],
  },
  {
    id: "manage",
    label: "2. Manage",
    description: "Edit board details and maintain your selected players.",
    points: [
      "Use Add player to include players not in the board.",
      "Remove players that no longer fit your strategy.",
      "Save edits to keep name and description updated.",
    ],
  },
  {
    id: "prioritize",
    label: "3. Prioritize",
    description: "Reorder players to keep your priority list current.",
    points: [
      "Move players up/down to update scouting priority.",
      "Top entries should represent next actions.",
      "Delete board only when it is no longer needed.",
    ],
  },
]

export function WatchlistsView() {
  const { status, data: session } = useSession()
  const isLoggedIn = !!session?.user?.id
  const queryClient = useQueryClient()
  const toast = useToast()
  const [selectedWatchlistId, setSelectedWatchlistId] = useState("")
  const [newName, setNewName] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [selectedPlayerId, setSelectedPlayerId] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const watchlistsQuery = useGetWatchlists(isLoggedIn)
  const watchlistDetailsQuery = useGetWatchlist(
    selectedWatchlistId,
    isLoggedIn && Boolean(selectedWatchlistId),
  )
  const playersQuery = useGetPlayers()
  const watchlists = useMemo(() => watchlistsQuery.data ?? [], [watchlistsQuery.data])

  const invalidateWatchlistQueries = async () => {
    await queryClient.invalidateQueries({ queryKey: ["watchlists"] })
  }

  const createWatchlistMutation = useCreateWatchlist({
    onSuccess: async (created) => {
      await invalidateWatchlistQueries()
      setSelectedWatchlistId(created._id)
      setNewName("")
      setNewDescription("")
      toast.success("Watchlist created")
    },
    onError: () => toast.error("Failed to create watchlist"),
  })

  const updateWatchlistMutation = useUpdateWatchlist({
    onSuccess: async () => {
      await invalidateWatchlistQueries()
      toast.success("Watchlist updated")
    },
    onError: () => toast.error("Failed to update watchlist"),
  })

  const deleteWatchlistMutation = useDeleteWatchlist({
    onSuccess: async () => {
      await invalidateWatchlistQueries()
      setSelectedWatchlistId("")
      toast.success("Watchlist deleted")
    },
    onError: () => toast.error("Failed to delete watchlist"),
  })

  const addPlayerMutation = useAddPlayerToWatchlist({
    onSuccess: async () => {
      await invalidateWatchlistQueries()
      setSelectedPlayerId("")
      toast.success("Player added")
    },
    onError: () => toast.error("Failed to add player"),
  })

  const removePlayerMutation = useRemovePlayerFromWatchlist({
    onSuccess: async () => {
      await invalidateWatchlistQueries()
      toast.success("Player removed")
    },
    onError: () => toast.error("Failed to remove player"),
  })

  const reorderMutation = useReorderWatchlistPlayers({
    onSuccess: async () => {
      await invalidateWatchlistQueries()
    },
    onError: () => toast.error("Failed to reorder players"),
  })

  useEffect(() => {
    if (watchlists.length === 0) return
    if (!selectedWatchlistId || !watchlists.some((item) => item._id === selectedWatchlistId)) {
      setSelectedWatchlistId(watchlists[0]._id)
    }
  }, [watchlists, selectedWatchlistId])

  useEffect(() => {
    const details = watchlistDetailsQuery.data
    if (!details) return
    setEditName(details.name)
    setEditDescription(details.description || "")
  }, [watchlistDetailsQuery.data])

  const availablePlayers = useMemo(() => {
    const selectedIds = new Set(watchlistDetailsQuery.data?.playerIds || [])
    return (playersQuery.data || []).filter((player) => !selectedIds.has(player._id))
  }, [playersQuery.data, watchlistDetailsQuery.data?.playerIds])

  const selectedWatchlist = watchlistDetailsQuery.data

  const movePlayer = (index: number, direction: -1 | 1) => {
    if (!selectedWatchlist) return
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= selectedWatchlist.playerIds.length) return
    const reordered = [...selectedWatchlist.playerIds]
    ;[reordered[index], reordered[nextIndex]] = [reordered[nextIndex], reordered[index]]
    reorderMutation.mutate({ watchlistId: selectedWatchlist._id, playerIds: reordered })
  }

  const handleDeleteWatchlist = () => {
    if (!selectedWatchlist) return
    setIsDeleteDialogOpen(false)
    deleteWatchlistMutation.mutate({ watchlistId: selectedWatchlist._id })
  }

  if (status === "loading") {
    return (
      <PageContainer size="default">
        <Panel>
          <StatusState tone="loading" title="Checking session" />
        </Panel>
      </PageContainer>
    )
  }

  if (!isLoggedIn) {
    return (
      <PageContainer size="default">
        <SectionHeader
          title="Watchlist Boards"
          description="Create multiple scouting boards and track players by strategy."
        />
        <Panel className="mt-4">
          <StatusState
            tone="empty"
            title="Login required"
            description="You need an account to manage personal watchlists."
          />
          <button
            type="button"
            onClick={() => signIn(undefined, { callbackUrl: "/watchlists" })}
            className="mt-4 rounded-md bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-600"
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
        title="Watchlist Boards"
        description="Build custom boards, add players and reorder priorities."
        right={
          <FeatureGuide
            guideId="watchlists"
            title="How Watchlists Work"
            description="Use watchlists to organize targets, prioritize actions, and track scouting progress."
            sections={watchlistGuideSections}
            triggerLabel="Watchlist help"
          />
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel className="space-y-3 lg:col-span-1">
          <h3 className="text-lg font-semibold text-gray-900">Your watchlists</h3>

          <form
            className="space-y-2"
            onSubmit={(event) => {
              event.preventDefault()
              if (!newName.trim()) return
              createWatchlistMutation.mutate({
                name: newName.trim(),
                description: newDescription.trim(),
              })
            }}
          >
            <input
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              placeholder="New watchlist name"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
            />
            <textarea
              value={newDescription}
              onChange={(event) => setNewDescription(event.target.value)}
              placeholder="Optional description"
              className="h-20 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
            />
            <button
              type="submit"
              className="w-full rounded-md bg-cyan-700 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-600"
            >
              Create watchlist
            </button>
          </form>

          {watchlistsQuery.isLoading && <WatchlistsPanelSkeleton rows={4} />}
          {watchlistsQuery.isError && (
            <StatusState tone="error" title="Failed to load watchlists" />
          )}

          <div className="space-y-2">
            {watchlists.map((watchlist) => (
              <button
                key={watchlist._id}
                type="button"
                onClick={() => setSelectedWatchlistId(watchlist._id)}
                className={`w-full rounded-md border px-3 py-2 text-left ${
                  selectedWatchlistId === watchlist._id
                    ? "border-cyan-700 bg-cyan-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <p className="text-sm font-semibold text-gray-900">{watchlist.name}</p>
                <p className="text-xs text-gray-600">{watchlist.playerCount || 0} players</p>
              </button>
            ))}
          </div>
        </Panel>

        <Panel className="space-y-4 lg:col-span-2">
          {!selectedWatchlistId ? (
            <StatusState tone="empty" title="No watchlist selected" />
          ) : watchlistDetailsQuery.isLoading ? (
            <WatchlistDetailsSkeleton rows={4} />
          ) : watchlistDetailsQuery.isError || !selectedWatchlist ? (
            <StatusState tone="error" title="Failed to load selected watchlist" />
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedWatchlist.name}</h3>
                  <p className="text-sm text-gray-600">
                    {selectedWatchlist.players.length} player
                    {selectedWatchlist.players.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={deleteWatchlistMutation.isPending}
                >
                  Delete
                </button>
              </div>

              <form
                className="space-y-2 rounded-md border border-gray-200 p-3"
                onSubmit={(event) => {
                  event.preventDefault()
                  if (!selectedWatchlist) return
                  if (!editName.trim()) return
                  updateWatchlistMutation.mutate({
                    watchlistId: selectedWatchlist._id,
                    payload: { name: editName.trim(), description: editDescription.trim() },
                  })
                }}
              >
                <p className="text-sm font-semibold text-gray-800">Edit watchlist</p>
                <input
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
                />
                <textarea
                  value={editDescription}
                  onChange={(event) => setEditDescription(event.target.value)}
                  className="h-20 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-md border border-cyan-700 px-3 py-1.5 text-sm font-semibold text-cyan-700 hover:bg-cyan-50"
                >
                  Save changes
                </button>
              </form>

              <div className="rounded-md border border-gray-200 p-3">
                <p className="mb-2 text-sm font-semibold text-gray-800">Add player</p>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="w-full">
                    <Select
                      value={selectedPlayerId}
                      onValueChange={setSelectedPlayerId}
                      options={[
                        { value: "", label: "Choose a player" },
                        ...availablePlayers.map((player) => ({
                          value: player._id,
                          label: `${player.name} (${player.currentClub || player.country})`,
                        })),
                      ]}
                      placeholder="Choose a player"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!selectedWatchlist || !selectedPlayerId) return
                      addPlayerMutation.mutate({
                        watchlistId: selectedWatchlist._id,
                        playerId: selectedPlayerId,
                      })
                    }}
                    className="w-full rounded-md bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-600 sm:w-auto"
                  >
                    Add
                  </button>
                </div>
              </div>

              {selectedWatchlist.players.length === 0 ? (
                <StatusState
                  tone="empty"
                  title="No players on this board"
                  description="Add players to start tracking priorities."
                />
              ) : (
                <div className="space-y-3">
                  {selectedWatchlist.players.map((player, index) => (
                    <PlayerSummaryCard
                      key={player._id}
                      player={player}
                      compact
                      actions={
                        <div className="flex flex-wrap items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => movePlayer(index, -1)}
                            disabled={index === 0}
                            className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 disabled:opacity-40"
                          >
                            Up
                          </button>
                          <button
                            type="button"
                            onClick={() => movePlayer(index, 1)}
                            disabled={index === selectedWatchlist.players.length - 1}
                            className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 disabled:opacity-40"
                          >
                            Down
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              removePlayerMutation.mutate({
                                watchlistId: selectedWatchlist._id,
                                playerId: player._id,
                              })
                            }
                            className="rounded-md border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                          >
                            Remove
                          </button>
                        </div>
                      }
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </Panel>
      </div>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete watchlist?"
        description={`This removes ${selectedWatchlist?.name || "this watchlist"} and its player order permanently.`}
        confirmLabel="Delete watchlist"
        cancelLabel="Cancel"
        onConfirm={handleDeleteWatchlist}
        isConfirming={deleteWatchlistMutation.isPending}
      />
    </PageContainer>
  )
}
