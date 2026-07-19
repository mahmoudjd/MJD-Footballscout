import type { PlayerType } from "@/lib/types/type"
import { parseCompactCurrency } from "@/features/players/lib/player-filtering"

const CURRENCY_CODES_BY_SYMBOL = {
  "€": "EUR",
  "$": "USD",
  "£": "GBP",
  "¥": "JPY",
} as const

const CURRENCY_SYMBOL_PATTERN = /[€$£¥]/
const MARKET_VALUE_FORMATTERS = new Map<string, Intl.NumberFormat>()

function getMarketValueFormatter(currency: string) {
  const cachedFormatter = MARKET_VALUE_FORMATTERS.get(currency)
  if (cachedFormatter) return cachedFormatter

  const formatter = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 2,
  })
  MARKET_VALUE_FORMATTERS.set(currency, formatter)
  return formatter
}

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
  const amount = parseCompactCurrency(value, currency)
  if (amount <= 0) return "N/A"

  const currencyText = typeof currency === "string" ? currency.trim() : ""
  const sourceText = `${toText(value, "")} ${currencyText}`
  const symbol = sourceText.match(CURRENCY_SYMBOL_PATTERN)?.[0]
  const currencyCode = symbol
    ? CURRENCY_CODES_BY_SYMBOL[symbol as keyof typeof CURRENCY_CODES_BY_SYMBOL]
    : currencyText.match(/\b(?:EUR|USD|GBP|JPY)\b/i)?.[0].toUpperCase()

  if (!currencyCode) return toText(value, "N/A")

  return getMarketValueFormatter(currencyCode)
    .formatToParts(amount)
    .map((part) => (part.type === "compact" ? part.value.toUpperCase() : part.value))
    .join("")
}

export function formatAge(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? String(value) : "N/A"
}

export function formatElo(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.round(value).toLocaleString()
    : "N/A"
}

/** BeSoccer exposes its player ELO as a score from 0 to 100. */
export function getEloProgress(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0
  return Math.min(100, Math.max(0, value))
}

export function getEloProgressColor(progress: number) {
  if (progress >= 80) return "from-lime-400 to-emerald-600"
  if (progress >= 60) return "from-amber-300 to-lime-500"
  return "from-orange-300 to-amber-500"
}

export function getProtectedPlayerProfileHref(playerId: string, isLoggedIn: boolean) {
  const profilePath = `/players/${playerId}`
  return isLoggedIn ? profilePath : `/login?callbackUrl=${encodeURIComponent(profilePath)}`
}
