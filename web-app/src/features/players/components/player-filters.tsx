import React, { memo, useMemo } from "react"
import { SolidIcons } from "@/components/icons/solid-icons"
import { OutlineIcons } from "@/components/icons/outline-icons"
import { Select } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import { Input } from "@/components/ui/input"

interface Props {
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
  sortBy: "default" | "elo" | "age" | "value" | "name" | "timestamp"
  sortOrder: "asc" | "desc"
  nationalities: string[]
  onPositionChange: (val: string) => void
  onAgeGroupChange: (val: string) => void
  onNationalityChange: (val: string) => void
  onClubQueryChange: (val: string) => void
  onMinAgeChange: (val: string) => void
  onMaxAgeChange: (val: string) => void
  onMinEloChange: (val: string) => void
  onMaxEloChange: (val: string) => void
  onMinValueChange: (val: string) => void
  onMaxValueChange: (val: string) => void
  onSortByChange: (val: "default" | "elo" | "age" | "value" | "name" | "timestamp") => void
  onSortOrderChange: (val: "asc" | "desc") => void
  onReset: () => void
}

const positionOptions = [
  { value: "", label: "All" },
  { value: "Forward", label: "Forward" },
  { value: "Midfielder", label: "Midfielder" },
  { value: "Defender", label: "Defender" },
  { value: "Goalkeeper", label: "Goalkeeper" },
  { value: "Manager", label: "Manager" },
]

const ageOptions = [
  { value: "", label: "All" },
  { value: "<20", label: "< 20" },
  { value: "20-30", label: "20 - 30" },
  { value: "30-40", label: "30 - 40" },
  { value: ">40", label: "> 40" },
]

const sortByOptions = [
  { value: "default", label: "Default" },
  { value: "elo", label: "ELO" },
  { value: "age", label: "Age" },
  { value: "value", label: "Market Value" },
  { value: "name", label: "Name" },
  { value: "timestamp", label: "Last Update" },
]

const sortOrderOptions = [
  { value: "desc", label: "Descending" },
  { value: "asc", label: "Ascending" },
]

function FilterLabel({ label, hint, htmlFor }: { label: string; hint: string; htmlFor: string }) {
  return (
    <div className="flex items-center gap-1">
      <label htmlFor={htmlFor} className="text-xs font-semibold text-stone-700">
        {label}
      </label>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="h-6 w-6 rounded text-stone-500 hover:bg-transparent hover:text-stone-700"
            aria-label={`${label} help`}
          >
            <OutlineIcons.InformationCircleIcon className="h-4 w-4" aria-hidden="true" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">{hint}</TooltipContent>
      </Tooltip>
    </div>
  )
}

const PlayerFilters = memo(function PlayerFilters({
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
  nationalities,
  onPositionChange,
  onAgeGroupChange,
  onNationalityChange,
  onClubQueryChange,
  onMinAgeChange,
  onMaxAgeChange,
  onMinEloChange,
  onMaxEloChange,
  onMinValueChange,
  onMaxValueChange,
  onSortByChange,
  onSortOrderChange,
  onReset,
}: Props) {
  const nationalityOptions = useMemo(
    () => [
      { value: "", label: "All" },
      ...nationalities.map((nation) => ({ value: nation, label: nation })),
    ],
    [nationalities],
  )

  return (
    <TooltipProvider>
      <div className="w-full space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <SolidIcons.AdjustmentsVerticalIcon
              className="h-5 w-5 text-emerald-700"
              aria-hidden="true"
            />
            <Text as="h2" variant="title" weight="bold" className="text-emerald-950">
              Filter Players
            </Text>
          </div>
          <Button type="button" onClick={onReset} variant="outline" size="sm">
            Reset filters
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <Text as="p" variant="overline" className="text-stone-500">
              Quick Filters
            </Text>
            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1 rounded-xl border border-stone-200 bg-white/80 p-3">
                <FilterLabel
                  label="Position"
                  htmlFor="filter-position"
                  hint="Filter by player role such as forward, midfielder, defender, and goalkeeper."
                />
                <Select
                  id="filter-position"
                  name="position"
                  ariaLabel="Filter by position"
                  value={selectedPosition}
                  onValueChange={onPositionChange}
                  options={positionOptions}
                  placeholder="Select Position…"
                />
              </div>

              <div className="space-y-1 rounded-xl border border-stone-200 bg-white/80 p-3">
                <FilterLabel
                  label="Age Group"
                  htmlFor="filter-age-group"
                  hint="Quickly filter players into broad age ranges."
                />
                <Select
                  id="filter-age-group"
                  name="ageGroup"
                  ariaLabel="Filter by age group"
                  value={selectedAgeGroup}
                  onValueChange={onAgeGroupChange}
                  options={ageOptions}
                  placeholder="Select Age Group…"
                />
              </div>

              <div className="space-y-1 rounded-xl border border-stone-200 bg-white/80 p-3">
                <FilterLabel
                  label="Nationality"
                  htmlFor="filter-nationality"
                  hint="Show only players from one specific country."
                />
                <Select
                  id="filter-nationality"
                  name="nationality"
                  ariaLabel="Filter by nationality"
                  value={selectedNationality}
                  onValueChange={onNationalityChange}
                  options={nationalityOptions}
                  placeholder="Select Nationality…"
                />
              </div>

              <div className="space-y-1 rounded-xl border border-stone-200 bg-white/80 p-3">
                <FilterLabel
                  label="Club"
                  htmlFor="filter-club"
                  hint="Type part of the club name to narrow down the list."
                />
                <Input
                  id="filter-club"
                  name="club"
                  value={clubQuery}
                  onChange={(event) => onClubQueryChange(event.target.value)}
                  placeholder="e.g. Barcelona…"
                  autoComplete="off"
                  inputSize="sm"
                />
              </div>
            </div>
          </div>

          <div>
            <Text as="p" variant="overline" className="text-stone-500">
              Advanced Filters & Sorting
            </Text>
            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1 rounded-xl border border-stone-200 bg-white/80 p-3">
                <FilterLabel
                  label="Min Age"
                  htmlFor="filter-min-age"
                  hint="Only keep players at or above this age."
                />
                <Input
                  id="filter-min-age"
                  name="minAge"
                  type="number"
                  value={minAge}
                  onChange={(event) => onMinAgeChange(event.target.value)}
                  inputMode="numeric"
                  placeholder="e.g. 18…"
                  autoComplete="off"
                  inputSize="sm"
                />
              </div>

              <div className="space-y-1 rounded-xl border border-stone-200 bg-white/80 p-3">
                <FilterLabel
                  label="Max Age"
                  htmlFor="filter-max-age"
                  hint="Only keep players at or below this age."
                />
                <Input
                  id="filter-max-age"
                  name="maxAge"
                  type="number"
                  value={maxAge}
                  onChange={(event) => onMaxAgeChange(event.target.value)}
                  inputMode="numeric"
                  placeholder="e.g. 32…"
                  autoComplete="off"
                  inputSize="sm"
                />
              </div>

              <div className="space-y-1 rounded-xl border border-stone-200 bg-white/80 p-3">
                <FilterLabel
                  label="Sort By"
                  htmlFor="filter-sort-by"
                  hint="Choose which metric defines the table order."
                />
                <Select
                  id="filter-sort-by"
                  name="sortBy"
                  ariaLabel="Sort players by"
                  value={sortBy}
                  onValueChange={(value) => onSortByChange(value as Props["sortBy"])}
                  options={sortByOptions}
                />
              </div>

              <div className="space-y-1 rounded-xl border border-stone-200 bg-white/80 p-3">
                <FilterLabel
                  label="Order"
                  htmlFor="filter-sort-order"
                  hint="Set ascending or descending sort direction."
                />
                <Select
                  id="filter-sort-order"
                  name="sortOrder"
                  ariaLabel="Player sort order"
                  value={sortOrder}
                  onValueChange={(value) => onSortOrderChange(value as Props["sortOrder"])}
                  options={sortOrderOptions}
                />
              </div>

              <div className="space-y-1 rounded-xl border border-stone-200 bg-white/80 p-3">
                <FilterLabel
                  label="Min ELO"
                  htmlFor="filter-min-elo"
                  hint="Only keep players at or above this ELO value."
                />
                <Input
                  id="filter-min-elo"
                  name="minElo"
                  type="number"
                  value={minElo}
                  onChange={(event) => onMinEloChange(event.target.value)}
                  inputMode="numeric"
                  placeholder="e.g. 1500…"
                  autoComplete="off"
                  inputSize="sm"
                />
              </div>

              <div className="space-y-1 rounded-xl border border-stone-200 bg-white/80 p-3">
                <FilterLabel
                  label="Max ELO"
                  htmlFor="filter-max-elo"
                  hint="Only keep players at or below this ELO value."
                />
                <Input
                  id="filter-max-elo"
                  name="maxElo"
                  type="number"
                  value={maxElo}
                  onChange={(event) => onMaxEloChange(event.target.value)}
                  inputMode="numeric"
                  placeholder="e.g. 2500…"
                  autoComplete="off"
                  inputSize="sm"
                />
              </div>

              <div className="space-y-1 rounded-xl border border-stone-200 bg-white/80 p-3">
                <FilterLabel
                  label="Min Market Value"
                  htmlFor="filter-min-value"
                  hint="Use plain numbers (e.g. 1000000) to set a minimum value."
                />
                <Input
                  id="filter-min-value"
                  name="minValue"
                  type="number"
                  value={minValue}
                  onChange={(event) => onMinValueChange(event.target.value)}
                  inputMode="numeric"
                  placeholder="e.g. 1000000…"
                  autoComplete="off"
                  inputSize="sm"
                />
              </div>

              <div className="space-y-1 rounded-xl border border-stone-200 bg-white/80 p-3">
                <FilterLabel
                  label="Max Market Value"
                  htmlFor="filter-max-value"
                  hint="Use plain numbers (e.g. 50000000) to set a maximum value."
                />
                <Input
                  id="filter-max-value"
                  name="maxValue"
                  type="number"
                  value={maxValue}
                  onChange={(event) => onMaxValueChange(event.target.value)}
                  inputMode="numeric"
                  placeholder="e.g. 50000000…"
                  autoComplete="off"
                  inputSize="sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
})

export default PlayerFilters
