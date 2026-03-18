"use client"
import React, { memo, useCallback, useMemo } from "react"
import { PlayerType } from "@/lib/types/type"
import { useRouter } from "next/navigation"
import { OutlineIcons } from "@/components/icons/outline-icons"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import Image from "next/image"
import {
  type KnownPosition,
  formatAge,
  formatElo,
  getPlayerDisplayName,
  getProtectedPlayerProfileHref,
  normalizePosition,
  toText,
} from "@/features/players/components/player-utils"
import { getPlayerImageSrc } from "@/lib/player-image"

const positionStyles: Record<KnownPosition, { badge: string; dot: string }> = {
  Forward: {
    badge: "border-rose-200 bg-rose-50 text-rose-700",
    dot: "bg-rose-500",
  },
  Midfielder: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  Defender: {
    badge: "border-blue-200 bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
  },
  Goalkeeper: {
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  Manager: {
    badge: "border-stone-200 bg-stone-100 text-stone-700",
    dot: "bg-stone-400",
  },
}

interface PlayerTableRowProps {
  player: PlayerType
  onRequestDelete: (id: string) => void
  isLoggedIn: boolean
  isAdmin: boolean
}

const PlayerTableRow = memo(({ player, onRequestDelete, isLoggedIn, isAdmin }: PlayerTableRowProps) => {
  const router = useRouter()

  const navigateToProfile = useCallback(() => {
    router.push(getProtectedPlayerProfileHref(player._id, isLoggedIn))
  }, [router, player._id, isLoggedIn])

  const onDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onRequestDelete(player._id)
    },
    [onRequestDelete, player._id],
  )

  const onOpen = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation()
      navigateToProfile()
    },
    [navigateToProfile],
  )

  const position = useMemo(() => normalizePosition(player.position), [player.position])
  const styles = useMemo(() => positionStyles[position], [position])
  const displayName = useMemo(
    () => getPlayerDisplayName({ name: player.name, title: player.title }),
    [player.name, player.title],
  )
  const country = useMemo(() => toText(player.country, "Unknown country"), [player.country])
  const club = useMemo(() => toText(player.currentClub, "-"), [player.currentClub])
  const age = useMemo(() => formatAge(player.age), [player.age])
  const elo = useMemo(() => formatElo(player.elo), [player.elo])

  return (
    <tr
      className="group h-24 cursor-pointer border-b border-stone-200/80 bg-white align-middle transition-colors duration-150 even:bg-stone-50/50 hover:bg-stone-100/70"
      onClick={navigateToProfile}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          navigateToProfile()
        }
      }}
      role="button"
      tabIndex={0}
      data-testid={`player-row-${player._id}`}
      aria-label={`Open profile of ${displayName}`}
    >
      <td className="min-w-[320px] px-4 py-3">
        <div className="flex w-full items-center gap-3">
          <Image
            src={getPlayerImageSrc(player.image)}
            alt={`${displayName}'s profile`}
            width={56}
            height={56}
            className="h-14 w-14 rounded-full border border-stone-200 object-cover"
            sizes="56px"
          />
          <div className="min-w-0">
            <Text as="p" weight="semibold" className="truncate text-slate-800">
              {displayName}
            </Text>
            <Text as="p" variant="caption" tone="subtle" className="truncate">
              {country}
            </Text>
          </div>
          <div
            className={`hidden h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white sm:flex ${styles.dot}`}
            aria-hidden="true"
          >
            {toText(player.number, "#")}
          </div>
        </div>
      </td>
      <td className="min-w-[180px] px-4 py-3">
        <Text as="p" variant="body" className="text-slate-700">
          {club}
        </Text>
      </td>
      <td className="px-4 py-3 text-center">
        <Text as="p" variant="body" weight="semibold" className="text-slate-700">
          {age}
        </Text>
      </td>
      <td className="px-4 py-3 text-center">
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold ${styles.badge}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
          {position}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        <Text as="p" variant="body" weight="semibold" className="text-emerald-700">
          {elo}
        </Text>
      </td>
      <td className="w-[150px] px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-1.5">
          <Button
            onClick={onOpen}
            variant="outline"
            size="xs"
            className="rounded-lg border-stone-300 text-stone-700 hover:bg-stone-100"
            aria-label={`Open ${displayName} profile`}
          >
            <OutlineIcons.EyeIcon className="h-4 w-4" />
            Open
          </Button>
          <Button
            onClick={onDelete}
            disabled={!isAdmin}
            title={isAdmin ? "Delete player" : "Only admins can delete players"}
            variant="outline"
            size="icon-sm"
            className="rounded-lg border-red-200 text-red-700 hover:bg-red-50"
            aria-label={`Delete ${displayName}`}
          >
            <OutlineIcons.TrashIcon className="h-4 w-4 stroke-red-700" />
          </Button>
        </div>
      </td>
    </tr>
  )
})

PlayerTableRow.displayName = "PlayerTableRow"

export default PlayerTableRow
