import type { PlayerType } from "@/lib/types/type"

export type KnownPosition = "Forward" | "Midfielder" | "Defender" | "Goalkeeper" | "Manager"

export function normalizePosition(pos?: string): KnownPosition {
  const lower = (pos ?? "").toLowerCase()
  if (lower.includes("forward")) return "Forward"
  if (lower.includes("midfielder")) return "Midfielder"
  if (lower.includes("defender")) return "Defender"
  if (lower.includes("goalkeeper")) return "Goalkeeper"
  return "Manager"
}

export function toText(value: unknown, fallback: string) {
  if (typeof value === "string") {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : fallback
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value)
  }

  return fallback
}

export function getPlayerDisplayName(player: Pick<PlayerType, "title" | "name">) {
  return toText(player.title, toText(player.name, "Unknown Player"))
}

export function formatMarketValue(value: unknown, currency?: unknown) {
  const amount = toText(value, "")
  if (!amount) return "N/A"
  if (/[€$£]/.test(amount)) return amount

  const currencyText = typeof currency === "string" ? currency.trim() : ""
  return currencyText ? `${currencyText} ${amount}` : amount
}

export function formatAge(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? String(value) : "N/A"
}

export function formatElo(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.round(value).toLocaleString()
    : "N/A"
}

export function getProtectedPlayerProfileHref(playerId: string, isLoggedIn: boolean) {
  const profilePath = `/players/${playerId}`
  return isLoggedIn ? profilePath : `/login?callbackUrl=${encodeURIComponent(profilePath)}`
}
