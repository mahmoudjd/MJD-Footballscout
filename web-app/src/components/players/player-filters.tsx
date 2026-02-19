import React from "react"
import { SolidIcons } from "@/components/solid-icons"
import { OutlineIcons } from "@/components/outline-icons"
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

function FilterLabel({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="flex items-center gap-1">
      <Text as="span" weight="semibold" className="text-slate-700">
        {label}
      </Text>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="h-6 w-6 rounded text-slate-400 hover:bg-transparent hover:text-cyan-700"
            aria-label={`${label} help`}
          >
            <OutlineIcons.InformationCircleIcon className="h-4 w-4" />
          </Button>
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
          <div className="flex items-center space-x-2">
            <SolidIcons.AdjustmentsVerticalIcon className="h-5 w-5 text-cyan-600" />
            <Text as="span" variant="title" weight="bold" className="text-slate-800">
              Filter Players
            </Text>
          </div>
          <Button
            type="button"
            onClick={onReset}
            variant="outline"
            size="sm"
          >
            Reset filters
          </Button>
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
            <Input
              value={clubQuery}
              onChange={(event) => onClubQueryChange(event.target.value)}
              placeholder="e.g. Barcelona"
              inputSize="sm"
            />
          </div>

          <div className="space-y-1">
            <FilterLabel label="Min Age" hint="Only keep players at or above this age." />
            <Input
              value={minAge}
              onChange={(event) => onMinAgeChange(event.target.value)}
              inputMode="numeric"
              placeholder="e.g. 18"
              inputSize="sm"
            />
          </div>

          <div className="space-y-1">
            <FilterLabel label="Max Age" hint="Only keep players at or below this age." />
            <Input
              value={maxAge}
              onChange={(event) => onMaxAgeChange(event.target.value)}
              inputMode="numeric"
              placeholder="e.g. 32"
              inputSize="sm"
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
            <Input
              value={minElo}
              onChange={(event) => onMinEloChange(event.target.value)}
              inputMode="numeric"
              placeholder="e.g. 1500"
              inputSize="sm"
            />
          </div>

          <div className="space-y-1">
            <FilterLabel label="Max ELO" hint="Only keep players at or below this ELO value." />
            <Input
              value={maxElo}
              onChange={(event) => onMaxEloChange(event.target.value)}
              inputMode="numeric"
              placeholder="e.g. 2500"
              inputSize="sm"
            />
          </div>

          <div className="space-y-1">
            <FilterLabel
              label="Min Market Value"
              hint="Use plain numbers (e.g. 1000000) to set a minimum value."
            />
            <Input
              value={minValue}
              onChange={(event) => onMinValueChange(event.target.value)}
              inputMode="numeric"
              placeholder="e.g. 1000000"
              inputSize="sm"
            />
          </div>

          <div className="space-y-1">
            <FilterLabel
              label="Max Market Value"
              hint="Use plain numbers (e.g. 50000000) to set a maximum value."
            />
            <Input
              value={maxValue}
              onChange={(event) => onMaxValueChange(event.target.value)}
              inputMode="numeric"
              placeholder="e.g. 50000000"
              inputSize="sm"
            />
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

export default PlayerFilters
