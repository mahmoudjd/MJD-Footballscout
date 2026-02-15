"use client"

import * as SelectPrimitive from "@radix-ui/react-select"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid"

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  triggerClassName?: string
  contentClassName?: string
}

const EMPTY_VALUE_SENTINEL = "__radix_select_empty__"

function toInternalValue(value: string) {
  return value === "" ? EMPTY_VALUE_SENTINEL : value
}

function toExternalValue(value: string) {
  return value === EMPTY_VALUE_SENTINEL ? "" : value
}

export function Select({
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  disabled = false,
  triggerClassName = "",
  contentClassName = "",
}: SelectProps) {
  const internalValue = toInternalValue(value)

  return (
    <SelectPrimitive.Root
      value={internalValue}
      onValueChange={(selectedValue) => onValueChange(toExternalValue(selectedValue))}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger
        className={`inline-flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-60 data-[placeholder]:text-gray-500 ${triggerClassName}`.trim()}
        aria-label={placeholder}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon className="text-gray-500">
          <ChevronDownIcon className="h-4 w-4" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          className={`z-50 max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg ${contentClassName}`.trim()}
        >
          <SelectPrimitive.ScrollUpButton className="flex h-7 cursor-default items-center justify-center bg-white text-gray-600">
            <ChevronUpIcon className="h-4 w-4" />
          </SelectPrimitive.ScrollUpButton>

          <SelectPrimitive.Viewport className="p-1">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={`${option.label}-${option.value}`}
                value={toInternalValue(option.value)}
                disabled={option.disabled}
                className="relative flex cursor-pointer items-center rounded-sm py-2 pr-2 pl-8 text-sm text-gray-700 outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-cyan-50 data-[highlighted]:text-cyan-800"
              >
                <SelectPrimitive.ItemIndicator className="absolute left-2 inline-flex items-center">
                  <CheckIcon className="h-4 w-4 text-cyan-700" />
                </SelectPrimitive.ItemIndicator>
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>

          <SelectPrimitive.ScrollDownButton className="flex h-7 cursor-default items-center justify-center bg-white text-gray-600">
            <ChevronDownIcon className="h-4 w-4" />
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}
