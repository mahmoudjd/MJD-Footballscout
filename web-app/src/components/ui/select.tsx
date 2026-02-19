"use client"

import * as SelectPrimitive from "@radix-ui/react-select"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid"
import { cn } from "@/lib/cn"

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
  tone?: "default" | "glass"
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
  tone = "default",
  triggerClassName,
  contentClassName,
}: SelectProps) {
  const internalValue = toInternalValue(value)
  const toneClasses = {
    default: {
      trigger:
        "border-slate-300 bg-white text-slate-800 shadow-[0_6px_18px_-16px_rgba(15,23,42,0.5)] data-[placeholder]:text-slate-500",
      icon: "text-slate-500",
      content: "border-slate-200 bg-white",
      scroll: "bg-white text-slate-600",
      item:
        "text-slate-700 data-[highlighted]:bg-cyan-50 data-[highlighted]:text-cyan-800",
    },
    glass: {
      trigger:
        "border-white/40 bg-white/15 text-white shadow-[0_6px_18px_-16px_rgba(2,6,23,0.75)] data-[placeholder]:text-slate-100/85",
      icon: "text-slate-100",
      content: "border-white/30 bg-slate-900/90 text-white",
      scroll: "bg-slate-900 text-slate-200",
      item:
        "text-slate-100 data-[highlighted]:bg-white/15 data-[highlighted]:text-white",
    },
  }[tone]

  return (
    <SelectPrimitive.Root
      value={internalValue}
      onValueChange={(selectedValue) => onValueChange(toExternalValue(selectedValue))}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger
        className={cn(
          "inline-flex h-10 w-full items-center justify-between rounded-xl border px-3 py-2 text-sm font-medium transition outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-60",
          toneClasses.trigger,
          triggerClassName,
        )}
        aria-label={placeholder}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon className={toneClasses.icon}>
          <ChevronDownIcon className="h-4 w-4" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          className={cn(
            "z-50 max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border shadow-[0_20px_40px_-22px_rgba(15,23,42,0.5)]",
            toneClasses.content,
            contentClassName,
          )}
        >
          <SelectPrimitive.ScrollUpButton className={cn("flex h-7 cursor-default items-center justify-center", toneClasses.scroll)}>
            <ChevronUpIcon className="h-4 w-4" />
          </SelectPrimitive.ScrollUpButton>

          <SelectPrimitive.Viewport className="p-1">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={`${option.label}-${option.value}`}
                value={toInternalValue(option.value)}
                disabled={option.disabled}
                className={cn(
                  "relative flex cursor-pointer items-center rounded-md py-2 pr-2 pl-8 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                  toneClasses.item,
                )}
              >
                <SelectPrimitive.ItemIndicator className="absolute left-2 inline-flex items-center">
                  <CheckIcon className="h-4 w-4 text-cyan-700" />
                </SelectPrimitive.ItemIndicator>
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>

          <SelectPrimitive.ScrollDownButton className={cn("flex h-7 cursor-default items-center justify-center", toneClasses.scroll)}>
            <ChevronDownIcon className="h-4 w-4" />
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}
