import type { PlayerType } from "@/lib/types/type"
import { useCallback, useEffect, useMemo, useState } from "react"
import {
  countActivePlayerFilters,
  defaultPlayerFilters,
  filterAndSortPlayers,
  normalizePlayersForFiltering,
  type PlayerFiltersState,
  type SortBy,
  type SortOrder,
} from "@/features/players/lib/player-filtering"
import { useDebounce } from "@/lib/hooks/useDebounce"

type SetCurrentPage = (value: number | ((prev: number) => number)) => void
type FilterKey = keyof PlayerFiltersState

const FILTER_DEBOUNCE_MS = 250

export function usePlayerFilters(players: PlayerType[], setCurrentPage: SetCurrentPage) {
  const [filters, setFilters] = useState<PlayerFiltersState>(defaultPlayerFilters)

  // The inputs stay bound to `filters` so typing echoes instantly; only the
  // O(n) filter/sort pass runs on the debounced value.
  const debouncedFilters = useDebounce(filters, FILTER_DEBOUNCE_MS)

  const normalizedPlayers = useMemo(() => normalizePlayersForFiltering(players), [players])

  const filteredPlayers = useMemo(
    () => filterAndSortPlayers(normalizedPlayers, debouncedFilters),
    [normalizedPlayers, debouncedFilters],
  )

  const activeFilterCount = useMemo(() => countActivePlayerFilters(filters), [filters])
  const hasActiveFilters = activeFilterCount > 0

  useEffect(() => {
    setCurrentPage(1)
  }, [filters, setCurrentPage])

  const setField = useCallback(<K extends FilterKey>(key: K, value: PlayerFiltersState[K]) => {
    setFilters((current) => (current[key] === value ? current : { ...current, [key]: value }))
  }, [])

  // One stable callback per field, allocated once.
  const [setters] = useState(() => ({
    selectedPosition: (value: string) => setField("selectedPosition", value),
    selectedAgeGroup: (value: string) => setField("selectedAgeGroup", value),
    selectedNationality: (value: string) => setField("selectedNationality", value),
    clubQuery: (value: string) => setField("clubQuery", value),
    minAge: (value: string) => setField("minAge", value),
    maxAge: (value: string) => setField("maxAge", value),
    minElo: (value: string) => setField("minElo", value),
    maxElo: (value: string) => setField("maxElo", value),
    minValue: (value: string) => setField("minValue", value),
    maxValue: (value: string) => setField("maxValue", value),
    sortBy: (value: SortBy) => setField("sortBy", value),
    sortOrder: (value: SortOrder) => setField("sortOrder", value),
  }))

  const resetFilters = useCallback(() => {
    setFilters(defaultPlayerFilters)
  }, [])

  return {
    filteredPlayers,
    activeFilterCount,
    hasActiveFilters,
    selectedPosition: filters.selectedPosition,
    setSelectedPosition: setters.selectedPosition,
    selectedAgeGroup: filters.selectedAgeGroup,
    setSelectedAgeGroup: setters.selectedAgeGroup,
    selectedNationality: filters.selectedNationality,
    setSelectedNationality: setters.selectedNationality,
    clubQuery: filters.clubQuery,
    setClubQuery: setters.clubQuery,
    minAge: filters.minAge,
    setMinAge: setters.minAge,
    maxAge: filters.maxAge,
    setMaxAge: setters.maxAge,
    minElo: filters.minElo,
    setMinElo: setters.minElo,
    maxElo: filters.maxElo,
    setMaxElo: setters.maxElo,
    minValue: filters.minValue,
    setMinValue: setters.minValue,
    maxValue: filters.maxValue,
    setMaxValue: setters.maxValue,
    sortBy: filters.sortBy,
    setSortBy: setters.sortBy,
    sortOrder: filters.sortOrder,
    setSortOrder: setters.sortOrder,
    resetFilters,
  }
}
