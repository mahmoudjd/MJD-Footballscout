"use client"

import { useEffect, useMemo, useState, type FormEvent } from "react"
import { useSession } from "next-auth/react"
import { useQueryClient } from "@tanstack/react-query"
import { useWatchlistsQuery } from "@/features/watchlists/hooks/useWatchlistsQuery"
import { useWatchlistQuery } from "@/features/watchlists/hooks/useWatchlistQuery"
import { usePlayersQuery } from "@/features/players/hooks/usePlayersQuery"
import { useCreateWatchlistMutation } from "@/features/watchlists/hooks/useCreateWatchlistMutation"
import { useDeleteWatchlistMutation } from "@/features/watchlists/hooks/useDeleteWatchlistMutation"
import { useUpdateWatchlistMutation } from "@/features/watchlists/hooks/useUpdateWatchlistMutation"
import { useAddPlayerToWatchlistMutation } from "@/features/watchlists/hooks/useAddPlayerToWatchlistMutation"
import { useRemovePlayerFromWatchlistMutation } from "@/features/watchlists/hooks/useRemovePlayerFromWatchlistMutation"
import { useReorderWatchlistPlayersMutation } from "@/features/watchlists/hooks/useReorderWatchlistPlayersMutation"
import { Panel } from "@/components/ui/panel"
import { SectionHeader } from "@/components/ui/section-header"
import { StatusState } from "@/components/ui/status-state"
import { PlayerSummaryCard } from "@/components/ui/player-summary-card"
import { useToast } from "@/lib/hooks/useToast"
import { PageContainer } from "@/components/ui/page-container"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { WatchlistDetailsSkeleton, WatchlistsPanelSkeleton } from "@/components/ui/skeleton"
import { Select } from "@/components/ui/select"
import { FeatureGuide } from "@/components/ui/feature-guide"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/cn"
import { Text } from "@/components/ui/text"
import { Input } from "@/components/ui/input"
import { FormField } from "@/components/ui/form-field"
import { Textarea } from "@/components/ui/textarea"
import { LoginRequiredState } from "@/components/ui/login-required-state"
import { watchlistGuideSections } from "@/features/watchlists/components/watchlists-guide"
import { queryKeys } from "@/lib/react-query/query-keys"

export function WatchlistsPageView() {
  const { status, data: session } = useSession()
  const isLoggedIn = Boolean(session?.user?.id)
  const queryClient = useQueryClient()
  const toast = useToast()

  const [selectedWatchlistId, setSelectedWatchlistId] = useState("")
  const [newName, setNewName] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [selectedPlayerId, setSelectedPlayerId] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const watchlistsQuery = useWatchlistsQuery(isLoggedIn)
  const watchlistDetailsQuery = useWatchlistQuery(
    selectedWatchlistId,
    isLoggedIn && Boolean(selectedWatchlistId),
  )
  const playersQuery = usePlayersQuery(isLoggedIn)
  const watchlists = useMemo(() => watchlistsQuery.data ?? [], [watchlistsQuery.data])

  const invalidateWatchlistQueries = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.watchlists.all })
  }

  const createWatchlistMutation = useCreateWatchlistMutation({
    onSuccess: async (created) => {
      await invalidateWatchlistQueries()
      setSelectedWatchlistId(created._id)
      setNewName("")
      setNewDescription("")
      toast.success("Watchlist created")
    },
    onError: () => toast.error("Failed to create watchlist"),
  })

  const updateWatchlistMutation = useUpdateWatchlistMutation({
    onSuccess: async () => {
      await invalidateWatchlistQueries()
      toast.success("Watchlist updated")
    },
    onError: () => toast.error("Failed to update watchlist"),
  })

  const deleteWatchlistMutation = useDeleteWatchlistMutation({
    onSuccess: async () => {
      await invalidateWatchlistQueries()
      setSelectedWatchlistId("")
      toast.success("Watchlist deleted")
    },
    onError: () => toast.error("Failed to delete watchlist"),
  })

  const addPlayerMutation = useAddPlayerToWatchlistMutation({
    onSuccess: async () => {
      await invalidateWatchlistQueries()
      setSelectedPlayerId("")
      toast.success("Player added")
    },
    onError: () => toast.error("Failed to add player"),
  })

  const removePlayerMutation = useRemovePlayerFromWatchlistMutation({
    onSuccess: async () => {
      await invalidateWatchlistQueries()
      toast.success("Player removed")
    },
    onError: () => toast.error("Failed to remove player"),
  })

  const reorderMutation = useReorderWatchlistPlayersMutation({
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

  const selectedWatchlist = watchlistDetailsQuery.data
  const selectedWatchlistName = selectedWatchlist?.name || "this watchlist"
  const hasSelection = Boolean(selectedWatchlistId)

  const availablePlayers = useMemo(() => {
    const selectedIds = new Set(watchlistDetailsQuery.data?.playerIds || [])
    return (playersQuery.data || []).filter((player) => !selectedIds.has(player._id))
  }, [playersQuery.data, watchlistDetailsQuery.data?.playerIds])

  const playerOptions = useMemo(
    () => [
      { value: "", label: "Choose a player" },
      ...availablePlayers.map((player) => ({
        value: player._id,
        label: `${player.name} (${player.currentClub || player.country})`,
      })),
    ],
    [availablePlayers],
  )

  const canCreate = newName.trim().length > 0
  const canUpdate = Boolean(selectedWatchlist && editName.trim())
  const canAddPlayer = Boolean(selectedWatchlist && selectedPlayerId)

  const handleCreateWatchlist = (event: FormEvent) => {
    event.preventDefault()
    if (!canCreate) return
    createWatchlistMutation.mutate({
      name: newName.trim(),
      description: newDescription.trim(),
    })
  }

  const handleUpdateWatchlist = (event: FormEvent) => {
    event.preventDefault()
    if (!selectedWatchlist || !canUpdate) return
    updateWatchlistMutation.mutate({
      watchlistId: selectedWatchlist._id,
      payload: { name: editName.trim(), description: editDescription.trim() },
    })
  }

  const handleAddPlayer = () => {
    if (!selectedWatchlist || !selectedPlayerId) return
    addPlayerMutation.mutate({
      watchlistId: selectedWatchlist._id,
      playerId: selectedPlayerId,
    })
  }

  const handleDeleteWatchlist = () => {
    if (!selectedWatchlist) return
    setIsDeleteDialogOpen(false)
    deleteWatchlistMutation.mutate({ watchlistId: selectedWatchlist._id })
  }

  const movePlayer = (index: number, direction: -1 | 1) => {
    if (!selectedWatchlist) return
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= selectedWatchlist.playerIds.length) return
    const reordered = [...selectedWatchlist.playerIds]
    ;[reordered[index], reordered[nextIndex]] = [reordered[nextIndex], reordered[index]]
    reorderMutation.mutate({ watchlistId: selectedWatchlist._id, playerIds: reordered })
  }

  const handleRemovePlayer = (playerId: string) => {
    if (!selectedWatchlist) return
    removePlayerMutation.mutate({ watchlistId: selectedWatchlist._id, playerId })
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
          icon="HeartIcon"
        />
        <LoginRequiredState
          callbackUrl="/watchlists"
          description="You need an account to manage personal watchlists."
          className="mt-4"
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer className="space-y-6" size="wide">
      <SectionHeader
        title="Watchlist Boards"
        description="Build custom boards, add players and reorder priorities."
        icon="HeartIcon"
        badge={`${watchlists.length} boards`}
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
        <Panel tone="soft" className="space-y-3 lg:col-span-1">
          <Text as="h2" variant="title" weight="semibold" className="text-emerald-950">
            Your watchlists
          </Text>

          <form className="space-y-2" onSubmit={handleCreateWatchlist}>
            <FormField label="Watchlist Name" htmlFor="new-watchlist-name" required>
              <Input
                id="new-watchlist-name"
                name="watchlistName"
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                placeholder="e.g. Summer Targets…"
                autoComplete="off"
                inputSize="sm"
                required
              />
            </FormField>
            <FormField
              label="Description"
              htmlFor="new-watchlist-description"
              hint="Optional scouting context for this board."
            >
              <Textarea
                id="new-watchlist-description"
                name="watchlistDescription"
                value={newDescription}
                onChange={(event) => setNewDescription(event.target.value)}
                placeholder="e.g. High-priority midfield targets…"
                autoComplete="off"
                textareaSize="sm"
                className="h-20"
              />
            </FormField>
            <Button type="submit" variant="primary" size="sm" fullWidth disabled={!canCreate}>
              Create watchlist
            </Button>
          </form>

          {watchlistsQuery.isLoading && <WatchlistsPanelSkeleton rows={4} />}
          {watchlistsQuery.isError && (
            <StatusState tone="error" title="Failed to load watchlists" />
          )}

          <div className="space-y-2">
            {watchlists.map((watchlist) => (
              <Button
                key={watchlist._id}
                type="button"
                onClick={() => setSelectedWatchlistId(watchlist._id)}
                variant={selectedWatchlistId === watchlist._id ? "secondary" : "outline"}
                size="sm"
                fullWidth
                className={cn(
                  "justify-start rounded-xl border px-3 py-2.5 text-left",
                  selectedWatchlistId === watchlist._id
                    ? "border-stone-900 bg-stone-900 text-stone-50 shadow-sm hover:bg-stone-800"
                    : "border-stone-200 bg-white text-stone-900 hover:bg-stone-50",
                )}
              >
                <Text as="p" weight="semibold" className="text-current">
                  {watchlist.name}
                </Text>
                <Text as="p" variant="caption" tone="inherit" className="opacity-80">
                  {watchlist.playerCount || 0} players
                </Text>
              </Button>
            ))}
          </div>
        </Panel>

        <Panel className="space-y-4 lg:col-span-2">
          {!hasSelection ? (
            <StatusState tone="empty" title="No watchlist selected" />
          ) : watchlistDetailsQuery.isLoading ? (
            <WatchlistDetailsSkeleton rows={4} />
          ) : watchlistDetailsQuery.isError || !selectedWatchlist ? (
            <StatusState tone="error" title="Failed to load selected watchlist" />
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Text as="h2" variant="title" weight="semibold" className="text-emerald-950">
                    {selectedWatchlist.name}
                  </Text>
                  <Text as="p" variant="body" tone="muted">
                    {selectedWatchlist.players.length} player
                    {selectedWatchlist.players.length !== 1 ? "s" : ""}
                  </Text>
                </div>
                <Button
                  type="button"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-700 hover:bg-red-50"
                  disabled={deleteWatchlistMutation.isPending}
                >
                  Delete
                </Button>
              </div>

              <form
                className="space-y-3 rounded-2xl border border-emerald-950/8 bg-emerald-50/35 p-4"
                onSubmit={handleUpdateWatchlist}
              >
                <Text as="p" weight="semibold" className="text-stone-800">
                  Edit watchlist
                </Text>
                <FormField label="Watchlist Name" htmlFor="edit-watchlist-name" required>
                  <Input
                    id="edit-watchlist-name"
                    name="editWatchlistName"
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                    autoComplete="off"
                    inputSize="sm"
                    required
                  />
                </FormField>
                <FormField label="Description" htmlFor="edit-watchlist-description">
                  <Textarea
                    id="edit-watchlist-description"
                    name="editWatchlistDescription"
                    value={editDescription}
                    onChange={(event) => setEditDescription(event.target.value)}
                    autoComplete="off"
                    textareaSize="sm"
                    className="h-20"
                  />
                </FormField>
                <Button type="submit" variant="secondary" size="sm" disabled={!canUpdate}>
                  Save changes
                </Button>
              </form>

              <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3.5">
                <Text as="p" weight="semibold" className="mb-2 text-stone-800">
                  Add player
                </Text>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="w-full">
                    <Select
                      value={selectedPlayerId}
                      onValueChange={setSelectedPlayerId}
                      options={playerOptions}
                      placeholder="Choose a Player…"
                      ariaLabel="Choose a player to add"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddPlayer}
                    variant="primary"
                    size="md"
                    fullWidth
                    className="sm:w-auto"
                    disabled={!canAddPlayer}
                  >
                    Add
                  </Button>
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
                          <Button
                            type="button"
                            onClick={() => movePlayer(index, -1)}
                            disabled={index === 0}
                            variant="outline"
                            size="xs"
                            className="rounded-lg px-2 py-1 text-slate-700 hover:bg-slate-100"
                          >
                            Up
                          </Button>
                          <Button
                            type="button"
                            onClick={() => movePlayer(index, 1)}
                            disabled={index === selectedWatchlist.players.length - 1}
                            variant="outline"
                            size="xs"
                            className="rounded-lg px-2 py-1 text-slate-700 hover:bg-slate-100"
                          >
                            Down
                          </Button>
                          <Button
                            type="button"
                            onClick={() => handleRemovePlayer(player._id)}
                            variant="outline"
                            size="xs"
                            className="rounded-lg border-red-200 px-2 py-1 text-red-700 hover:bg-red-50"
                          >
                            Remove
                          </Button>
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
        description={`This removes ${selectedWatchlistName} and its player order permanently.`}
        confirmLabel="Delete watchlist"
        cancelLabel="Cancel"
        onConfirm={handleDeleteWatchlist}
        isConfirming={deleteWatchlistMutation.isPending}
      />
    </PageContainer>
  )
}
