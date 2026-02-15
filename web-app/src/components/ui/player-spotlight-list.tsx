"use client"

import Link from "next/link"
import { PlayerHighlightItemType } from "@/lib/types/type"
import { useSession } from "next-auth/react"

interface PlayerSpotlightListProps {
  title: string
  players: PlayerHighlightItemType[]
  emptyText: string
}

export function PlayerSpotlightList({ title, players, emptyText }: PlayerSpotlightListProps) {
  const { data: session } = useSession()
  const isLoggedIn = !!session?.user?.email

  return (
    <div className="rounded-xl border border-white/20 bg-black/20 p-4">
      <h4 className="text-sm font-semibold tracking-wider text-gray-200 uppercase">{title}</h4>
      {players.length > 0 ? (
        <ul className="mt-3 space-y-3">
          {players.map((player) => (
            <li key={player._id} className="flex items-center justify-between gap-3 text-sm">
              <div className="min-w-0">
                <p className="truncate font-semibold text-white">{player.name}</p>
                <p className="truncate text-xs text-gray-300">
                  {player.currentClub || player.country}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="rounded-md bg-cyan-500/20 px-2 py-0.5 text-cyan-200">
                  ELO {player.elo}
                </span>
                <Link
                  href={
                    isLoggedIn
                      ? `/players/${player._id}`
                      : `/login?callbackUrl=${encodeURIComponent(`/players/${player._id}`)}`
                  }
                  className="rounded-md border border-cyan-300/40 px-2 py-0.5 text-xs text-cyan-100 hover:bg-cyan-500/20"
                >
                  Open
                </Link>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-gray-300">{emptyText}</p>
      )}
    </div>
  )
}
