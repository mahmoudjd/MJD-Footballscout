"use client"

import { memo } from "react"
import PlayerTableRow from "./PlayerTableRow"
import { PlayerType } from "@/lib/types/type"
import { useSession } from "next-auth/react"
import { OutlineIcons } from "@/components/outline-icons"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import { ActionLink } from "@/components/ui/action-link"
import { Chip } from "@/components/ui/chip"
import {
  formatAge,
  formatElo,
  formatMarketValue,
  getPlayerDisplayName,
  getProtectedPlayerProfileHref,
  normalizePosition,
  toText,
} from "@/components/players/player-utils"

interface PlayersTableProps {
  players: Array<PlayerType>
  handleDeleteAndUpdate: (id: string) => void
}

const PlayersTable = memo(({ players, handleDeleteAndUpdate }: PlayersTableProps) => {
  const { data: session } = useSession()
  const isLoggedIn = !!session?.user?.email
  const isAdmin = session?.user?.role === "admin"

  if (players.length === 0) {
    return (
      <div className="p-8 text-center">
        <Text tone="subtle">No players found matching your criteria.</Text>
      </div>
    )
  }

  return (
    <div>
      <div className="space-y-3 p-3 sm:hidden">
        {players.map((player) => {
          const position = normalizePosition(player.position)
          const displayName = getPlayerDisplayName(player)
          const country = toText(player.country, "Unknown country")
          const club = toText(player.currentClub, "Unknown club")
          const marketValue = formatMarketValue(player.value, player.currency)
          const elo = formatElo(player.elo)
          const age = formatAge(player.age)
          const profileHref = getProtectedPlayerProfileHref(player._id, isLoggedIn)

          return (
            <article
              key={player._id}
              className="rounded-2xl border border-cyan-100 bg-linear-to-br from-white to-cyan-50/55 p-3 shadow-[0_12px_28px_-22px_rgba(14,116,144,0.55)]"
            >
              <div className="flex items-center gap-3">
                <img
                  src={player.image}
                  alt={`${displayName}'s profile`}
                  className="h-16 w-16 rounded-full border border-cyan-200/70 object-cover"
                  loading="lazy"
                />
                <div className="min-w-0 flex-1">
                  <Text as="p" variant="body-lg" weight="semibold" className="truncate text-slate-800">
                    {displayName}
                  </Text>
                  <Text as="p" variant="caption" tone="subtle" className="truncate">
                    {country} • {club}
                  </Text>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] font-semibold">
                <Chip tone="cyan" size="xs">
                  {position}
                </Chip>
                <Chip tone="neutral" size="xs">
                  {age} yrs
                </Chip>
                <Chip tone="emerald" size="xs">
                  ELO {elo}
                </Chip>
                <Chip tone="violet" size="xs">
                  {marketValue}
                </Chip>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <ActionLink
                  href={profileHref}
                  variant="outline"
                  size="sm"
                  fullWidth
                  className="gap-1 border-cyan-700 text-cyan-700 hover:bg-cyan-50"
                >
                  <OutlineIcons.EyeIcon className="h-4 w-4" />
                  Open profile
                </ActionLink>
                <Button
                  type="button"
                  onClick={() => handleDeleteAndUpdate(player._id)}
                  disabled={!isAdmin}
                  title={isAdmin ? "Delete player" : "Only admins can delete players"}
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-700 hover:bg-red-50"
                >
                  <OutlineIcons.TrashIcon className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </article>
          )
        })}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm sm:block">
        <table className="min-w-[980px] bg-white" aria-label="Players table">
          <thead>
            <tr className="border-b border-slate-200 bg-linear-to-r from-slate-100 to-slate-50 text-left text-sm font-semibold tracking-wide text-slate-700 uppercase">
              <th scope="col" className="px-4 py-3">
                Player
              </th>
              <th scope="col" className="px-4 py-3">
                Club
              </th>
              <th scope="col" className="px-4 py-3 text-center">
                Age
              </th>
              <th scope="col" className="px-4 py-3 text-center">
                Position
              </th>
              <th scope="col" className="px-4 py-3 text-center">
                ELO
              </th>
              <th scope="col" className="px-4 py-3 text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <PlayerTableRow
                key={player._id}
                player={player}
                handleDelete={handleDeleteAndUpdate}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
})

PlayersTable.displayName = "PlayersTable"

export default PlayersTable
