import { PlayerType } from "@/lib/types/type"

export function safeDecode(value: string | null | undefined) {
  if (typeof value !== "string") return ""
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export function getPlayerDisplayName(
  player:
    | Pick<PlayerType, "title" | "name" | "fullName">
    | null
    | undefined,
) {
  if (!player) return "Unknown Player"
  const title = safeDecode(player.title).trim()
  const name = safeDecode(player.name).trim()
  const fullName = safeDecode(player.fullName).trim()
  return title || name || fullName || "Unknown Player"
}
