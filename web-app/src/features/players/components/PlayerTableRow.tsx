"use client"

import { memo, useCallback } from "react"
import Image from "next/image"
import { ActionLink } from "@/components/ui/action-link"
import { Button } from "@/components/ui/button"
import { OutlineIcons } from "@/components/icons/outline-icons"
import { Text } from "@/components/ui/text"
import type { PlayerType } from "@/lib/types/type"
import { getPlayerImageSrc } from "@/lib/player-image"
import {
  type KnownPosition,
  formatAge,
  formatElo,
  formatMarketValue,
  getEloProgress,
  getEloProgressColor,
  getPlayerDisplayName,
  getProtectedPlayerProfileHref,
  normalizePosition,
  toText,
} from "@/features/players/components/player-utils"

/**
 * `dot` is decorative — it sits beside the position label, so it only needs to
 * be distinguishable, not readable. `numberBadge` carries white text, so it uses
 * the darker 700 shade: the 500 shades all fail WCAG AA against white
 * (amber-500 is 2.15:1, emerald-500 2.54:1, sky-500 2.77:1, rose-500 3.67:1).
 */
const positionStyles: Record<KnownPosition, { badge: string; dot: string; numberBadge: string }> = {
  Forward: {
    badge: "border-rose-200/80 bg-rose-50 text-rose-700",
    dot: "bg-rose-500",
    numberBadge: "bg-rose-700",
  },
  Midfielder: {
    badge: "border-emerald-200/80 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
    numberBadge: "bg-emerald-700",
  },
  Defender: {
    badge: "border-sky-200/80 bg-sky-50 text-sky-700",
    dot: "bg-sky-500",
    numberBadge: "bg-sky-700",
  },
  Goalkeeper: {
    badge: "border-amber-200/80 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
    numberBadge: "bg-amber-700",
  },
  Manager: {
    badge: "border-stone-200 bg-stone-100 text-stone-700",
    dot: "bg-stone-500",
    numberBadge: "bg-stone-700",
  },
}

interface PlayerTableRowProps {
  player: PlayerType
  onRequestDelete: (id: string) => void
  isLoggedIn: boolean
  isAdmin: boolean
}

const PlayerTableRow = memo(
  ({ player, onRequestDelete, isLoggedIn, isAdmin }: PlayerTableRowProps) => {
    const onDelete = useCallback(() => {
      onRequestDelete(player._id)
    }, [onRequestDelete, player._id])

    const position = normalizePosition(player.position)
    const styles = positionStyles[position]
    const displayName = getPlayerDisplayName(player)
    const country = toText(player.country, "Unknown country")
    const club = toText(player.currentClub, "Free agent")
    const age = formatAge(player.age)
    const elo = formatElo(player.elo)
    const eloProgress = getEloProgress(player.elo)
    const marketValue = formatMarketValue(player.value, player.currency)
    const profileHref = getProtectedPlayerProfileHref(player._id, isLoggedIn)

    return (
      <tr className="group border-b border-emerald-950/7 bg-white transition-colors duration-150 last:border-b-0 hover:bg-emerald-50/45">
        <td className="px-5 py-3.5">
          <div className="flex min-w-0 items-center gap-3.5">
            <div className="relative shrink-0">
              <Image
                src={getPlayerImageSrc(player.image)}
                alt=""
                width={52}
                height={52}
                className="h-13 w-13 rounded-2xl border border-emerald-950/10 bg-stone-100 object-cover shadow-[0_10px_24px_-18px_rgba(15,50,36,0.65)]"
                sizes="52px"
              />
              <span
                className={`absolute -right-1 -bottom-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white px-1 text-[10px] font-bold text-white tabular-nums ${styles.numberBadge}`}
              >
                <span className="sr-only">{`Squad number ${toText(player.number, "unknown")}`}</span>
                <span aria-hidden="true">{toText(player.number, "–")}</span>
              </span>
            </div>
            <div className="min-w-0">
              <ActionLink
                href={profileHref}
                variant="ghost"
                size="sm"
                fullWidth={false}
                className="min-h-0 max-w-full justify-start rounded-md p-0 text-sm font-bold text-emerald-950 shadow-none hover:translate-y-0 hover:bg-transparent hover:text-emerald-700 focus-visible:ring-offset-1"
              >
                <span className="truncate">{displayName}</span>
              </ActionLink>
              <Text as="p" variant="caption" tone="subtle" className="mt-0.5 truncate">
                {country}
              </Text>
            </div>
          </div>
        </td>
        <td className="px-4 py-3.5">
          <Text as="p" variant="body" weight="medium" className="truncate text-stone-700">
            {club}
          </Text>
        </td>
        <td className="px-4 py-3.5 text-center tabular-nums">
          <Text as="span" variant="body" weight="semibold" className="text-stone-700">
            {age}
          </Text>
        </td>
        <td className="px-4 py-3.5 text-center">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${styles.badge}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} aria-hidden="true" />
            {position}
          </span>
        </td>
        <td className="px-4 py-3.5">
          <div className="mx-auto w-20 tabular-nums">
            <div className="flex items-center justify-between gap-2">
              <Text as="span" variant="body" weight="bold" className="text-emerald-800">
                {elo}
              </Text>
              <OutlineIcons.ArrowTrendingUpIcon
                className="h-3.5 w-3.5 text-emerald-600"
                aria-hidden="true"
              />
            </div>
            <div
              className="mt-1 h-1 overflow-hidden rounded-full bg-emerald-950/8"
              role="progressbar"
              aria-label={`${displayName} ELO`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={eloProgress}
            >
              <div
                className={`h-full rounded-full bg-linear-to-r transition-[width] duration-300 motion-reduce:transition-none ${getEloProgressColor(eloProgress)}`}
                style={{ width: `${eloProgress}%` }}
              />
            </div>
          </div>
        </td>
        <td className="px-4 py-3.5 text-right tabular-nums">
          <Text
            as="span"
            variant="body"
            weight="bold"
            className="whitespace-nowrap text-emerald-950"
          >
            {marketValue}
          </Text>
        </td>
        <td className="px-5 py-3.5 text-right">
          <div className="inline-flex items-center justify-end gap-1.5">
            <ActionLink
              href={profileHref}
              variant="outline"
              size="sm"
              fullWidth={false}
              className="rounded-xl px-3 text-xs"
            >
              <OutlineIcons.EyeIcon className="h-4 w-4" aria-hidden="true" />
              Profile
            </ActionLink>
            {isAdmin ? (
              <Button
                onClick={onDelete}
                title={`Delete ${displayName}`}
                variant="ghost"
                size="icon-sm"
                className="rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700"
                aria-label={`Delete ${displayName}`}
              >
                <OutlineIcons.TrashIcon className="h-4 w-4" aria-hidden="true" />
              </Button>
            ) : null}
          </div>
        </td>
      </tr>
    )
  },
)

PlayerTableRow.displayName = "PlayerTableRow"

export default PlayerTableRow
