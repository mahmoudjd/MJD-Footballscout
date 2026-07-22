"use client"

import { memo } from "react"
import Image from "next/image"
import PlayerTableRow from "./PlayerTableRow"
import type { PlayerType } from "@/lib/types/type"
import { OutlineIcons } from "@/components/icons/outline-icons"
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
} from "@/features/players/components/player-utils"
import { getPlayerImageSrc } from "@/lib/player-image"

interface PlayersTableProps {
  players: Array<PlayerType>
  onRequestDelete: (id: string) => void
  isLoggedIn: boolean
  isAdmin: boolean
}

const PlayersTable = memo(
  ({ players, onRequestDelete, isLoggedIn, isAdmin }: PlayersTableProps) => {
    if (players.length === 0) {
      return (
        <div className="p-8 text-center">
          <Text tone="subtle">No players found matching your criteria.</Text>
        </div>
      )
    }

    return (
      <div>
        <div className="grid gap-3 p-3 sm:grid-cols-2 lg:hidden">
          {players.map((player) => {
            const position = normalizePosition(player.position)
            const displayName = getPlayerDisplayName(player)
            const country = toText(player.country, "Unknown country")
            const club = toText(player.currentClub, "Free agent")
            const marketValue = formatMarketValue(player.value, player.currency)
            const elo = formatElo(player.elo)
            const age = formatAge(player.age)
            const profileHref = getProtectedPlayerProfileHref(player._id, isLoggedIn)

            return (
              <article
                key={player._id}
                className="group relative overflow-hidden rounded-3xl border border-emerald-950/9 bg-linear-to-br from-white via-white to-emerald-50/45 p-4 shadow-[0_18px_38px_-30px_rgba(15,50,36,0.48)] transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-emerald-700/20 hover:shadow-[0_24px_44px_-30px_rgba(15,50,36,0.5)] motion-reduce:transform-none"
              >
                <div
                  className="absolute top-0 right-0 h-24 w-24 rounded-bl-full bg-lime-200/20"
                  aria-hidden="true"
                />
                <div className="relative flex items-center gap-3.5">
                  <Image
                    src={getPlayerImageSrc(player.image)}
                    alt=""
                    width={64}
                    height={64}
                    className="h-16 w-16 shrink-0 rounded-2xl border border-emerald-950/10 bg-stone-100 object-cover shadow-[0_12px_26px_-18px_rgba(15,50,36,0.65)]"
                    sizes="64px"
                  />
                  <div className="min-w-0 flex-1">
                    <Text
                      as="p"
                      variant="body-lg"
                      weight="bold"
                      className="truncate text-emerald-950"
                    >
                      {displayName}
                    </Text>
                    <Text as="p" variant="caption" tone="subtle" className="mt-0.5 truncate">
                      {country} · {club}
                    </Text>
                    <Chip tone="cyan" size="xs" className="mt-2">
                      {position}
                    </Chip>
                  </div>
                </div>

                <dl className="relative mt-4 grid grid-cols-3 divide-x divide-emerald-950/8 rounded-2xl border border-emerald-950/7 bg-white/75 px-1 py-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                  <div className="min-w-0 px-2">
                    <dt className="text-[10px] font-bold tracking-[0.08em] text-stone-600 uppercase">
                      Age
                    </dt>
                    <dd className="mt-1 text-sm font-bold text-stone-700 tabular-nums">{age}</dd>
                  </div>
                  <div className="min-w-0 px-2">
                    <dt className="text-[10px] font-bold tracking-[0.08em] text-stone-600 uppercase">
                      ELO
                    </dt>
                    <dd className="mt-1 text-sm font-bold text-emerald-700 tabular-nums">{elo}</dd>
                  </div>
                  <div className="min-w-0 px-2">
                    <dt className="text-[10px] font-bold tracking-[0.08em] text-stone-600 uppercase">
                      Value
                    </dt>
                    <dd
                      className="mt-1 truncate text-sm font-bold text-emerald-950 tabular-nums"
                      title={marketValue}
                    >
                      {marketValue}
                    </dd>
                  </div>
                </dl>

                <div className="relative mt-3 flex gap-2">
                  <ActionLink
                    href={profileHref}
                    variant="primary"
                    size="sm"
                    fullWidth
                    className="gap-1.5 rounded-xl"
                  >
                    View Profile
                    <OutlineIcons.ArrowUpIcon className="h-4 w-4 rotate-45" aria-hidden="true" />
                  </ActionLink>
                  {isAdmin ? (
                    <Button
                      type="button"
                      onClick={() => onRequestDelete(player._id)}
                      title={`Delete ${displayName}`}
                      variant="ghost"
                      size="icon-sm"
                      className="shrink-0 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700"
                      aria-label={`Delete ${displayName}`}
                    >
                      <OutlineIcons.TrashIcon className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  ) : null}
                </div>
              </article>
            )
          })}
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[1180px] table-fixed" aria-label="Players">
            <caption className="sr-only">
              Player directory with club, age, position, ELO, market value, and actions.
            </caption>
            <colgroup>
              <col className="w-[24%]" />
              <col className="w-[18%]" />
              <col className="w-[7%]" />
              <col className="w-[13%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[14%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-emerald-950/10 bg-linear-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-left text-[10px] font-bold tracking-[0.12em] text-emerald-50/75 uppercase">
                <th scope="col" className="px-5 py-4 text-white">
                  Player
                </th>
                <th scope="col" className="px-4 py-4">
                  Club
                </th>
                <th scope="col" className="px-4 py-4 text-center">
                  Age
                </th>
                <th scope="col" className="px-4 py-4 text-center">
                  Position
                </th>
                <th scope="col" className="px-4 py-4 text-center">
                  ELO Rating
                </th>
                <th scope="col" className="px-4 py-4 text-right">
                  Market Value
                </th>
                <th scope="col" className="px-5 py-4 text-right">
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
  },
)

PlayersTable.displayName = "PlayersTable"

export default PlayersTable
