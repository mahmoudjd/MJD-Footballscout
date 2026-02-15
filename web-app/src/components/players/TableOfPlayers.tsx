"use client"

import { memo } from "react"
import Link from "next/link"
import RowItem from "./RowItem"
import { PlayerType } from "@/lib/types/type"
import { useSession } from "next-auth/react"
import { OutlineIcons } from "@/components/outline-icons"

interface TableOfPlayersProps {
  players: Array<PlayerType>
  handleDeleteAndUpdate: (id: string) => void
}

function normalizePosition(value: string) {
  const lower = value.toLowerCase()
  if (lower.includes("forward")) return "Forward"
  if (lower.includes("midfielder")) return "Midfielder"
  if (lower.includes("defender")) return "Defender"
  if (lower.includes("goalkeeper")) return "Goalkeeper"
  return "Manager"
}

const TableOfPlayers = memo(({ players, handleDeleteAndUpdate }: TableOfPlayersProps) => {
  const { data: session } = useSession()
  const isLoggedIn = !!session?.user?.email
  const isAdmin = session?.user?.role === "admin"

  if (players.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">No players found matching your criteria.</div>
    )
  }

  return (
    <div>
      <div className="space-y-3 p-3 sm:hidden">
        {players.map((player) => {
          const position = normalizePosition(player.position)
          const profileHref = isLoggedIn
            ? `/players/${player._id}`
            : `/login?callbackUrl=${encodeURIComponent(`/players/${player._id}`)}`

          return (
            <article
              key={player._id}
              className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <img
                  src={player.image}
                  alt={`${player.name}'s profile`}
                  className="h-16 w-16 rounded-full object-cover"
                  loading="lazy"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold text-slate-800">{player.name}</p>
                  <p className="truncate text-xs text-slate-500">
                    {player.country} • {player.currentClub}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    {position} • {player.age} years
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <Link
                  href={profileHref}
                  className="inline-flex items-center gap-1 rounded-md border border-cyan-700 px-3 py-1.5 text-xs font-semibold text-cyan-700 hover:bg-cyan-50"
                >
                  <OutlineIcons.EyeIcon className="h-4 w-4" />
                  Open
                </Link>
                <button
                  type="button"
                  onClick={() => handleDeleteAndUpdate(player._id)}
                  disabled={!isAdmin}
                  title={isAdmin ? "Delete player" : "Only admins can delete players"}
                  className="inline-flex items-center gap-1 rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <OutlineIcons.TrashIcon className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </article>
          )
        })}
      </div>

      <div className="hidden overflow-x-auto shadow-sm sm:block">
        <table className="min-w-full bg-white" aria-label="Players table">
          <thead>
            <tr className="border-y border-l-4 border-y-gray-400 border-l-gray-400 bg-gray-100 text-base text-gray-800">
              <th scope="col" className="px-4 py-3 text-left">
                Name
              </th>
              <th scope="col" className="px-4 py-3 text-left">
                Age
              </th>
              <th scope="col" className="px-4 py-3 text-left">
                Position
              </th>
              <th scope="col" className="px-4 py-3 text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <RowItem key={player._id} player={player} handleDelete={handleDeleteAndUpdate} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
})

TableOfPlayers.displayName = "TableOfPlayers"

export default TableOfPlayers
