import type { PlayerType } from "@/lib/types/type"
import { useEffect, useMemo, useState } from "react"

type SortBy = "default" | "elo" | "age" | "value" | "name" | "timestamp"
type SortOrder = "asc" | "desc"

const defaultFilters = {
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
  sortBy: "default" as SortBy,
  sortOrder: "desc" as SortOrder,
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

function parseCompactCurrency(value: unknown, unitHint?: unknown) {
  if (value === null || value === undefined) return 0
  const valueMultiplier = detectUnitMultiplier(value)
  const hintMultiplier = detectUnitMultiplier(unitHint)
  const multiplier = valueMultiplier !== 1 ? valueMultiplier : hintMultiplier
  const numericPart = String(value).match(/[-+]?\d[\d.,'’`\s]*/)?.[0] || String(value)
  const amount = typeof value === "number" ? value : Number(normalizeNumberString(numericPart))
  if (!Number.isFinite(amount)) return 0
  return Math.max(0, Math.round(amount * multiplier))
}

export function usePlayerFilters(
  players: PlayerType[],
  setCurrentPage: (value: number | ((prev: number) => number)) => void,
) {
  const [selectedPosition, setSelectedPosition] = useState("")
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("")
  const [selectedNationality, setSelectedNationality] = useState("")
  const [clubQuery, setClubQuery] = useState("")
  const [minAge, setMinAge] = useState("")
  const [maxAge, setMaxAge] = useState("")
  const [minElo, setMinElo] = useState("")
  const [maxElo, setMaxElo] = useState("")
  const [minValue, setMinValue] = useState("")
  const [maxValue, setMaxValue] = useState("")
  const [sortBy, setSortBy] = useState<SortBy>("default")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  const normalizedPlayers = useMemo(() => {
    return players.map((player) => ({
      player,
      positionLower: (player.position || "").toLowerCase(),
      countryLower: (player.country || "").toLowerCase(),
      clubLower: (player.currentClub || "").toLowerCase(),
      marketValue: parseCompactCurrency(player.value, player.currency),
      timestampMs: player.timestamp ? new Date(player.timestamp).getTime() : 0,
    }))
  }, [players])

  const filteredPlayers = useMemo(() => {
    const normalizedPosition = selectedPosition.trim().toLowerCase()
    const normalizedNationality = selectedNationality.trim().toLowerCase()
    const normalizedClubQuery = clubQuery.trim().toLowerCase()
    const minAgeValue = parseNumberInput(minAge)
    const maxAgeValue = parseNumberInput(maxAge)
    const minEloValue = parseNumberInput(minElo)
    const maxEloValue = parseNumberInput(maxElo)
    const minValueAmount = parseNumberInput(minValue)
    const maxValueAmount = parseNumberInput(maxValue)

    const filtered = normalizedPlayers.filter(
      ({ player, positionLower, countryLower, clubLower, marketValue }) => {
        const matchPosition = normalizedPosition ? positionLower.includes(normalizedPosition) : true

        const matchAgeGroup = (() => {
          const age = player.age
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
        })()

        const matchNationality = normalizedNationality
          ? countryLower === normalizedNationality
          : true

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

    if (sortBy === "default") {
      return filtered.map((entry) => entry.player)
    }

    const direction = sortOrder === "asc" ? 1 : -1
    return [...filtered]
      .sort((a, b) => {
        if (sortBy === "name") {
          return direction * a.player.name.localeCompare(b.player.name)
        }
        if (sortBy === "age") {
          return direction * (a.player.age - b.player.age)
        }
        if (sortBy === "elo") {
          return direction * (a.player.elo - b.player.elo)
        }
        if (sortBy === "value") {
          return direction * (a.marketValue - b.marketValue)
        }
        return direction * (a.timestampMs - b.timestampMs)
      })
      .map((entry) => entry.player)
  }, [
    normalizedPlayers,
    selectedPosition,
    selectedAgeGroup,
    selectedNationality,
    clubQuery,
    minAge,
    maxAge,
    minElo,
    maxElo,
    minValue,
    maxValue,
    sortBy,
    sortOrder,
  ])

  // Reset Page on Filter Change
  useEffect(() => {
    setCurrentPage(1)
  }, [
    selectedPosition,
    selectedAgeGroup,
    selectedNationality,
    clubQuery,
    minAge,
    maxAge,
    minElo,
    maxElo,
    minValue,
    maxValue,
    sortBy,
    sortOrder,
    setCurrentPage,
  ])

  const resetFilters = () => {
    setSelectedPosition(defaultFilters.selectedPosition)
    setSelectedAgeGroup(defaultFilters.selectedAgeGroup)
    setSelectedNationality(defaultFilters.selectedNationality)
    setClubQuery(defaultFilters.clubQuery)
    setMinAge(defaultFilters.minAge)
    setMaxAge(defaultFilters.maxAge)
    setMinElo(defaultFilters.minElo)
    setMaxElo(defaultFilters.maxElo)
    setMinValue(defaultFilters.minValue)
    setMaxValue(defaultFilters.maxValue)
    setSortBy(defaultFilters.sortBy)
    setSortOrder(defaultFilters.sortOrder)
  }

  return {
    filteredPlayers,
    selectedPosition,
    setSelectedPosition,
    selectedAgeGroup,
    setSelectedAgeGroup,
    selectedNationality,
    setSelectedNationality,
    clubQuery,
    setClubQuery,
    minAge,
    setMinAge,
    maxAge,
    setMaxAge,
    minElo,
    setMinElo,
    maxElo,
    setMaxElo,
    minValue,
    setMinValue,
    maxValue,
    setMaxValue,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    resetFilters,
  }
}
