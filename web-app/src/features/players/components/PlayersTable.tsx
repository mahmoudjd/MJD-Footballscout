"use client"

import { memo } from "react"
import PlayerTableRow from "./PlayerTableRow"
import { PlayerType } from "@/lib/types/type"
import { OutlineIcons } from "@/components/icons/outline-icons"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import { ActionLink } from "@/components/ui/action-link"
import { Chip } from "@/components/ui/chip"
import Image from "next/image"
import {
  formatAge,
  formatElo,
  formatMarketValue,
  getPlayerDisplayName,
  getProtectedPlayerProfileHref,
  normalizePosition,
  toText,
} from "@/features/players/components/player-utils"
import { getPlayerImageSrc } from "@/lib/player-image"

interface PlayersTableProps {
  players: Array<PlayerType>
  onRequestDelete: (id: string) => void
  isLoggedIn: boolean
  isAdmin: boolean
}

const PlayersTable = memo(({ players, onRequestDelete, isLoggedIn, isAdmin }: PlayersTableProps) => {
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
          const club = toText(player.currentClub, "-")
          const marketValue = formatMarketValue(player.value, player.currency)
          const elo = formatElo(player.elo)
          const age = formatAge(player.age)
          const profileHref = getProtectedPlayerProfileHref(player._id, isLoggedIn)

          return (
            <article
              key={player._id}
              className="rounded-2xl border border-stone-200 bg-white p-3.5 shadow-[0_18px_32px_-26px_rgba(15,23,42,0.4)]"
            >
              <div className="flex items-center gap-3">
                <Image
                  src={getPlayerImageSrc(player.image)}
                  alt={`${displayName}'s profile`}
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-full border border-stone-200 object-cover"
                  sizes="64px"
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
                  className="gap-1 border-stone-300 text-stone-700 hover:bg-stone-100"
                >
                  <OutlineIcons.EyeIcon className="h-4 w-4" />
                  Open profile
                </ActionLink>
                <Button
                  type="button"
                  onClick={() => onRequestDelete(player._id)}
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

      <div className="hidden overflow-x-auto rounded-3xl border border-stone-200/90 bg-white/95 shadow-[0_20px_44px_-30px_rgba(15,23,42,0.35)] ring-1 ring-white/80 sm:block">
        <table className="w-full min-w-[1120px] table-fixed bg-white/95" aria-label="Players table">
          <colgroup>
            <col className="w-[33%]" />
            <col className="w-[23%]" />
            <col className="w-[8%]" />
            <col className="w-[12%]" />
            <col className="w-[8%]" />
            <col className="w-[16%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-stone-200 bg-linear-to-r from-stone-50 to-stone-100/65 text-left text-[11px] font-semibold tracking-[0.08em] text-stone-600 uppercase">
              <th scope="col" className="px-5 py-3.5">
                Player
              </th>
              <th scope="col" className="px-4 py-3.5">
                Club
              </th>
              <th scope="col" className="px-4 py-3.5 text-center">
                Age
              </th>
              <th scope="col" className="px-4 py-3.5 text-center">
                Position
              </th>
              <th scope="col" className="px-4 py-3.5 text-center">
                ELO
              </th>
              <th scope="col" className="px-5 py-3.5 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <PlayerTableRow
                key={player._id}
                player={player}
                onRequestDelete={onRequestDelete}
                isLoggedIn={isLoggedIn}
                isAdmin={isAdmin}
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
