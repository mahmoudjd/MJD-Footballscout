import type { PlayerType } from "@/lib/types/type"
import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react"
import {
  countActivePlayerFilters,
  defaultPlayerFilters,
  filterAndSortPlayers,
  type PlayerFiltersState,
  type SortBy,
  type SortOrder,
} from "@/features/players/lib/player-filtering"

type SetCurrentPage = (value: number | ((prev: number) => number)) => void
type FilterKey = keyof PlayerFiltersState

function createFilterSetter<K extends FilterKey>(
  key: K,
  setFilters: Dispatch<SetStateAction<PlayerFiltersState>>,
) {
  return (value: PlayerFiltersState[K]) => {
    setFilters((current) => (current[key] === value ? current : { ...current, [key]: value }))
  }
}

export function usePlayerFilters(players: PlayerType[], setCurrentPage: SetCurrentPage) {
  const [filters, setFilters] = useState<PlayerFiltersState>(defaultPlayerFilters)

  const filteredPlayers = useMemo(() => filterAndSortPlayers(players, filters), [players, filters])

  const activeFilterCount = useMemo(() => countActivePlayerFilters(filters), [filters])
  const hasActiveFilters = activeFilterCount > 0

  useEffect(() => {
    setCurrentPage(1)
  }, [filters, setCurrentPage])

  const resetFilters = () => {
    setFilters(defaultPlayerFilters)
  }

  return {
    filteredPlayers,
    activeFilterCount,
    hasActiveFilters,
    selectedPosition: filters.selectedPosition,
    setSelectedPosition: createFilterSetter("selectedPosition", setFilters),
    selectedAgeGroup: filters.selectedAgeGroup,
    setSelectedAgeGroup: createFilterSetter("selectedAgeGroup", setFilters),
    selectedNationality: filters.selectedNationality,
    setSelectedNationality: createFilterSetter("selectedNationality", setFilters),
    clubQuery: filters.clubQuery,
    setClubQuery: createFilterSetter("clubQuery", setFilters),
    minAge: filters.minAge,
    setMinAge: createFilterSetter("minAge", setFilters),
    maxAge: filters.maxAge,
    setMaxAge: createFilterSetter("maxAge", setFilters),
    minElo: filters.minElo,
    setMinElo: createFilterSetter("minElo", setFilters),
    maxElo: filters.maxElo,
    setMaxElo: createFilterSetter("maxElo", setFilters),
    minValue: filters.minValue,
    setMinValue: createFilterSetter("minValue", setFilters),
    maxValue: filters.maxValue,
    setMaxValue: createFilterSetter("maxValue", setFilters),
    sortBy: filters.sortBy,
    setSortBy: createFilterSetter("sortBy", setFilters) as (value: SortBy) => void,
    sortOrder: filters.sortOrder,
    setSortOrder: createFilterSetter("sortOrder", setFilters) as (value: SortOrder) => void,
    resetFilters,
  }
}
