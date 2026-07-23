import type { PlayerType } from "@/lib/types/type"

export type SortBy = "default" | "elo" | "age" | "value" | "name" | "timestamp"
export type SortOrder = "asc" | "desc"

export interface PlayerFiltersState {
  selectedPosition: string
  selectedAgeGroup: string
  selectedNationality: string
  clubQuery: string
  minAge: string
  maxAge: string
  minElo: string
  maxElo: string
  minValue: string
  maxValue: string
  sortBy: SortBy
  sortOrder: SortOrder
}

export const defaultPlayerFilters: PlayerFiltersState = {
  selectedPosition: "",
  selectedAgeGroup: "",
  selectedNationality: "",
  clubQuery: "",
  minAge: "",
  maxAge: "",
  minElo: "",
  maxElo: "",
  minValue: "",
  maxValue: "",
  sortBy: "default",
  sortOrder: "desc",
}

export function countActivePlayerFilters(filters: PlayerFiltersState) {
  return [
    Boolean(filters.selectedPosition),
    Boolean(filters.selectedAgeGroup),
    Boolean(filters.selectedNationality),
    Boolean(filters.clubQuery),
    Boolean(filters.minAge),
    Boolean(filters.maxAge),
    Boolean(filters.minElo),
    Boolean(filters.maxElo),
    Boolean(filters.minValue),
    Boolean(filters.maxValue),
    filters.sortBy !== "default",
    filters.sortOrder !== "desc",
  ].filter(Boolean).length
}

function parseNumberInput(value: string) {
  const normalized = value.trim()
  if (!normalized) return undefined
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : undefined
}

function detectUnitMultiplier(input: unknown) {
  if (input === null || input === undefined) return 1
  const tokens = String(input)
    .toLowerCase()
    .replace(/[0-9.,'’`+\-_/]/g, " ")
    .replace(/[€$£¥]/g, " ")
    .split(/\s+/)
    .filter(Boolean)

  if (
    tokens.some(
      (token) =>
        token === "mrd" ||
        token === "bn" ||
        token === "b" ||
        token.startsWith("billion") ||
        token.startsWith("milliard"),
    )
  )
    return 1_000_000_000

  if (tokens.some((token) => token === "m" || token === "mio" || token.startsWith("million")))
    return 1_000_000

  if (
    tokens.some(
      (token) =>
        token === "k" ||
        token === "tsd" ||
        token === "th" ||
        token.startsWith("thousand") ||
        token.startsWith("tausend"),
    )
  )
    return 1_000

  return 1
}

function normalizeNumberString(input: string) {
  let normalized = input.trim().replace(/\s+/g, "").replace(/['’`]/g, "")

  if (!normalized) return ""

  const hasComma = normalized.includes(",")
  const hasDot = normalized.includes(".")

  if (hasComma && hasDot) {
    const decimalSeparator = normalized.lastIndexOf(",") > normalized.lastIndexOf(".") ? "," : "."
    const thousandSeparatorRegex = decimalSeparator === "," ? /\./g : /,/g
    normalized = normalized.replace(thousandSeparatorRegex, "")
    if (decimalSeparator === ",") normalized = normalized.replace(",", ".")
    return normalized
  }

  if (hasComma) {
    const parts = normalized.split(",")
    if (parts.length > 2) return parts.join("")
    const [left, right] = parts
    if (!right) return left
    if (right.length === 3 && left.length <= 3) return left + right
    return `${left}.${right}`
  }

  if (hasDot) {
    const parts = normalized.split(".")
    if (parts.length > 2) return parts.join("")
    const [left, right] = parts
    if (!right) return left
    if (right.length === 3 && left.length <= 3) return left + right
    return `${left}.${right}`
  }

  return normalized
}

export function parseCompactCurrency(value: unknown, unitHint?: unknown) {
  if (value === null || value === undefined) return 0
  const valueMultiplier = detectUnitMultiplier(value)
  const hintMultiplier = detectUnitMultiplier(unitHint)
  const multiplier = valueMultiplier !== 1 ? valueMultiplier : hintMultiplier
  const numericPart = String(value).match(/[-+]?\d[\d.,'’`\s]*/)?.[0] || String(value)
  const amount = typeof value === "number" ? value : Number(normalizeNumberString(numericPart))
  if (!Number.isFinite(amount)) return 0
  return Math.max(0, Math.round(amount * multiplier))
}

function matchesAgeGroup(age: number, selectedAgeGroup: string) {
  switch (selectedAgeGroup) {
    case "<20":
      return age < 20
    case "20-30":
      return age >= 20 && age <= 30
    case "30-40":
      return age > 30 && age <= 40
    case ">40":
      return age > 40
    default:
      return true
  }
}

export interface NormalizedPlayer {
  player: PlayerType
  positionLower: string
  countryLower: string
  clubLower: string
  marketValue: number
  timestampMs: number
}

/**
 * Depends only on `players`, so callers can memoize it once per fetch instead of
 * re-running the currency parsing for every player on every filter keystroke.
 */
export function normalizePlayersForFiltering(players: PlayerType[]): NormalizedPlayer[] {
  return players.map((player) => ({
    player,
    positionLower: (player.position || "").toLowerCase(),
    countryLower: (player.country || "").toLowerCase(),
    clubLower: (player.currentClub || "").toLowerCase(),
    marketValue: parseCompactCurrency(player.value, player.currency),
    timestampMs: player.timestamp ? new Date(player.timestamp).getTime() : 0,
  }))
}

export function filterAndSortPlayers(
  normalizedPlayers: NormalizedPlayer[],
  filters: PlayerFiltersState,
) {
  const normalizedPosition = filters.selectedPosition.trim().toLowerCase()
  const normalizedNationality = filters.selectedNationality.trim().toLowerCase()
  const normalizedClubQuery = filters.clubQuery.trim().toLowerCase()
  const minAgeValue = parseNumberInput(filters.minAge)
  const maxAgeValue = parseNumberInput(filters.maxAge)
  const minEloValue = parseNumberInput(filters.minElo)
  const maxEloValue = parseNumberInput(filters.maxElo)
  const minValueAmount = parseNumberInput(filters.minValue)
  const maxValueAmount = parseNumberInput(filters.maxValue)

  const filtered = normalizedPlayers.filter(
    ({ player, positionLower, countryLower, clubLower, marketValue }) => {
      const matchPosition = normalizedPosition ? positionLower.includes(normalizedPosition) : true
      const matchAgeGroup = matchesAgeGroup(player.age, filters.selectedAgeGroup)
      const matchNationality = normalizedNationality ? countryLower === normalizedNationality : true
      const matchClub = normalizedClubQuery ? clubLower.includes(normalizedClubQuery) : true
      const matchMinAge = minAgeValue !== undefined ? player.age >= minAgeValue : true
      const matchMaxAge = maxAgeValue !== undefined ? player.age <= maxAgeValue : true
      const matchMinElo = minEloValue !== undefined ? player.elo >= minEloValue : true
      const matchMaxElo = maxEloValue !== undefined ? player.elo <= maxEloValue : true
      const matchMinValue = minValueAmount !== undefined ? marketValue >= minValueAmount : true
      const matchMaxValue = maxValueAmount !== undefined ? marketValue <= maxValueAmount : true

      return (
        matchPosition &&
        matchAgeGroup &&
        matchNationality &&
        matchClub &&
        matchMinAge &&
        matchMaxAge &&
        matchMinElo &&
        matchMaxElo &&
        matchMinValue &&
        matchMaxValue
      )
    },
  )

  if (filters.sortBy === "default") {
    return filtered.map((entry) => entry.player)
  }

  const direction = filters.sortOrder === "asc" ? 1 : -1
  return filtered
    .sort((a, b) => {
      if (filters.sortBy === "name") {
        return direction * a.player.name.localeCompare(b.player.name)
      }
      if (filters.sortBy === "age") {
        return direction * (a.player.age - b.player.age)
      }
      if (filters.sortBy === "elo") {
        return direction * (a.player.elo - b.player.elo)
      }
      if (filters.sortBy === "value") {
        return direction * (a.marketValue - b.marketValue)
      }
      return direction * (a.timestampMs - b.timestampMs)
    })
    .map((entry) => entry.player)
}
