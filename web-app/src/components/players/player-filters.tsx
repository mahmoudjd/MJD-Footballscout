import React from "react"
import { SolidIcons } from "@/components/solid-icons"
import { OutlineIcons } from "@/components/outline-icons"
import { Select } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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

function FilterLabel({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="flex items-center gap-1">
      <label className="text-sm font-medium text-gray-600">{label}</label>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="rounded text-gray-400 transition hover:text-cyan-700"
            aria-label={`${label} help`}
          >
            <OutlineIcons.InformationCircleIcon className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">{hint}</TooltipContent>
      </Tooltip>
    </div>
  )
}

const PlayerFilters = ({
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
}: Props) => {
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

  const nationalityOptions = [
    { value: "", label: "All" },
    ...nationalities.map((nation) => ({ value: nation, label: nation })),
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

  return (
    <TooltipProvider>
      <div className="w-full space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-lg font-semibold text-gray-700">
            <SolidIcons.AdjustmentsVerticalIcon className="h-5 w-5 text-cyan-600" />
            <span>Filter Players</span>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            Reset filters
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <FilterLabel
              label="Position"
              hint="Filter by player role such as forward, midfielder, defender, and goalkeeper."
            />
            <Select
              value={selectedPosition}
              onValueChange={onPositionChange}
              options={positionOptions}
              placeholder="Select position"
            />
          </div>

          <div className="space-y-1">
            <FilterLabel label="Age Group" hint="Quickly filter players into broad age ranges." />
            <Select
              value={selectedAgeGroup}
              onValueChange={onAgeGroupChange}
              options={ageOptions}
              placeholder="Select age group"
            />
          </div>

          <div className="space-y-1">
            <FilterLabel label="Nationality" hint="Show only players from one specific country." />
            <Select
              value={selectedNationality}
              onValueChange={onNationalityChange}
              options={nationalityOptions}
              placeholder="Select nationality"
            />
          </div>

          <div className="space-y-1">
            <FilterLabel label="Club" hint="Type part of the club name to narrow down the list." />
            <input
              value={clubQuery}
              onChange={(event) => onClubQueryChange(event.target.value)}
              placeholder="e.g. Barcelona"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <FilterLabel label="Min Age" hint="Only keep players at or above this age." />
            <input
              value={minAge}
              onChange={(event) => onMinAgeChange(event.target.value)}
              inputMode="numeric"
              placeholder="e.g. 18"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <FilterLabel label="Max Age" hint="Only keep players at or below this age." />
            <input
              value={maxAge}
              onChange={(event) => onMaxAgeChange(event.target.value)}
              inputMode="numeric"
              placeholder="e.g. 32"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <FilterLabel label="Sort By" hint="Choose which metric defines the table order." />
            <Select
              value={sortBy}
              onValueChange={(value) => onSortByChange(value as Props["sortBy"])}
              options={sortByOptions}
            />
          </div>

          <div className="space-y-1">
            <FilterLabel label="Order" hint="Set ascending or descending sort direction." />
            <Select
              value={sortOrder}
              onValueChange={(value) => onSortOrderChange(value as Props["sortOrder"])}
              options={sortOrderOptions}
            />
          </div>

          <div className="space-y-1">
            <FilterLabel label="Min ELO" hint="Only keep players at or above this ELO value." />
            <input
              value={minElo}
              onChange={(event) => onMinEloChange(event.target.value)}
              inputMode="numeric"
              placeholder="e.g. 1500"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <FilterLabel label="Max ELO" hint="Only keep players at or below this ELO value." />
            <input
              value={maxElo}
              onChange={(event) => onMaxEloChange(event.target.value)}
              inputMode="numeric"
              placeholder="e.g. 2500"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <FilterLabel
              label="Min Market Value"
              hint="Use plain numbers (e.g. 1000000) to set a minimum value."
            />
            <input
              value={minValue}
              onChange={(event) => onMinValueChange(event.target.value)}
              inputMode="numeric"
              placeholder="e.g. 1000000"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <FilterLabel
              label="Max Market Value"
              hint="Use plain numbers (e.g. 50000000) to set a maximum value."
            />
            <input
              value={maxValue}
              onChange={(event) => onMaxValueChange(event.target.value)}
              inputMode="numeric"
              placeholder="e.g. 50000000"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

export default PlayerFilters
