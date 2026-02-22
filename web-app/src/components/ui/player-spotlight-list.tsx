"use client"

import Link from "next/link"
import { PlayerHighlightItemType } from "@/lib/types/type"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/cn"
import { Text } from "@/components/ui/text"
import Image from "next/image"
import { getPlayerImageSrc } from "@/lib/player-image"

interface PlayerSpotlightListProps {
  title: string
  players: PlayerHighlightItemType[]
  emptyText: string
  className?: string
  tone?: "default" | "glass"
}

export function PlayerSpotlightList({
  title,
  players,
  emptyText,
  className,
  tone = "default",
}: PlayerSpotlightListProps) {
  const { data: session } = useSession()
  const isLoggedIn = !!session?.user?.email
  const toneClasses = {
    default: {
      container: "border-slate-200 bg-white",
      title: "text-slate-700",
      row: "border-slate-200 bg-slate-50/70",
      name: "text-slate-900",
      meta: "text-slate-500",
      badge: "border-cyan-200 bg-cyan-50 text-cyan-700",
      link: "border-cyan-300 text-cyan-700 hover:bg-cyan-50",
      empty: "text-slate-500",
    },
    glass: {
      container: "border-white/30 bg-white/12 text-white backdrop-blur-md",
      title: "text-slate-100",
      row: "border-white/25 bg-white/12",
      name: "text-white",
      meta: "text-slate-200",
      badge: "border-cyan-200/40 bg-cyan-200/20 text-cyan-100",
      link: "border-cyan-200/50 text-cyan-100 hover:bg-cyan-100/15",
      empty: "text-slate-200/90",
    },
  }[tone]

  return (
    <div className={cn("rounded-2xl border p-4 shadow-sm", toneClasses.container, className)}>
      <Text as="h4" variant="overline" weight="bold" className={cn("tracking-wider", toneClasses.title)}>
        {title}
      </Text>
      {players.length > 0 ? (
        <ul className="mt-3 space-y-3">
          {players.map((player) => (
            <li
              key={player._id}
              className={cn("flex items-center justify-between gap-3 rounded-xl border p-2.5 text-sm", toneClasses.row)}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <Image
                  src={getPlayerImageSrc(player.image)}
                  alt={player.name}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full border border-white/35 object-cover bg-slate-200"
                  sizes="40px"
                />
                <div className="min-w-0">
                  <Text as="p" weight="semibold" className={cn("truncate", toneClasses.name)}>
                    {player.name}
                  </Text>
                  <Text as="p" variant="caption" className={cn("truncate", toneClasses.meta)}>
                    {player.currentClub || player.country}
                  </Text>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className={cn("rounded-full border px-2 py-0.5 text-xs font-semibold", toneClasses.badge)}>
                  ELO {player.elo}
                </span>
                <Link
                  href={
                    isLoggedIn
                      ? `/players/${player._id}`
                      : `/login?callbackUrl=${encodeURIComponent(`/players/${player._id}`)}`
                  }
                  className={cn(
                    "rounded-lg border px-2 py-0.5 text-xs font-semibold transition",
                    toneClasses.link,
                  )}
                >
                  Open
                </Link>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <Text as="p" className={cn("mt-3", toneClasses.empty)}>
          {emptyText}
        </Text>
      )}
    </div>
  )
}
