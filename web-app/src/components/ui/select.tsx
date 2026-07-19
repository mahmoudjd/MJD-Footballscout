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
  id?: string
  name?: string
  ariaLabel?: string
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
  id,
  name,
  ariaLabel,
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
        "border-emerald-950/15 bg-white text-emerald-950 shadow-[0_9px_22px_-18px_rgba(15,50,36,0.42)] data-[placeholder]:text-stone-400 hover:border-emerald-900/30",
      icon: "text-stone-500",
      content: "border-emerald-950/10 bg-white",
      scroll: "bg-white text-stone-600",
      item: "text-stone-700 data-[highlighted]:bg-emerald-50 data-[highlighted]:text-emerald-950 data-[state=checked]:font-semibold data-[state=checked]:text-emerald-900",
    },
    glass: {
      trigger:
        "border-white/40 bg-white/15 text-white shadow-[0_6px_18px_-16px_rgba(2,6,23,0.75)] data-[placeholder]:text-slate-100/85",
      icon: "text-slate-100",
      content: "border-white/30 bg-slate-900/90 text-white",
      scroll: "bg-slate-900 text-slate-200",
      item: "text-slate-100 data-[highlighted]:bg-white/15 data-[highlighted]:text-white",
    },
  }[tone]

  return (
    <SelectPrimitive.Root
      name={name}
      value={internalValue}
      onValueChange={(selectedValue) => onValueChange(toExternalValue(selectedValue))}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger
        id={id}
        className={cn(
          "inline-flex h-11 w-full touch-manipulation items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-[border-color,box-shadow,background-color] [-webkit-tap-highlight-color:transparent] focus-visible:border-emerald-700 focus-visible:ring-3 focus-visible:ring-lime-300/35 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-stone-100 disabled:opacity-70",
          toneClasses.trigger,
          triggerClassName,
        )}
        aria-label={ariaLabel || placeholder}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon className={toneClasses.icon}>
          <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          className={cn(
            "z-50 max-h-72 w-[var(--radix-select-trigger-width)] max-w-[calc(100vw-1rem)] overflow-hidden rounded-2xl border p-1 shadow-[0_24px_55px_-28px_rgba(15,50,36,0.42)]",
            toneClasses.content,
            contentClassName,
          )}
        >
          <SelectPrimitive.ScrollUpButton
            className={cn(
              "flex h-7 cursor-default items-center justify-center",
              toneClasses.scroll,
            )}
          >
            <ChevronUpIcon className="h-4 w-4" aria-hidden="true" />
          </SelectPrimitive.ScrollUpButton>

          <SelectPrimitive.Viewport>
            {options.map((option) => (
              <SelectPrimitive.Item
                key={`${option.label}-${option.value}`}
                value={toInternalValue(option.value)}
                disabled={option.disabled}
                className={cn(
                  "relative flex min-h-10 max-w-full min-w-0 cursor-pointer items-center rounded-xl py-2 pr-2 pl-9 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                  toneClasses.item,
                )}
              >
                <SelectPrimitive.ItemIndicator className="absolute left-2 inline-flex items-center">
                  <CheckIcon className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                </SelectPrimitive.ItemIndicator>
                <SelectPrimitive.ItemText>
                  <span className="block min-w-0 truncate">{option.label}</span>
                </SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>

          <SelectPrimitive.ScrollDownButton
            className={cn(
              "flex h-7 cursor-default items-center justify-center",
              toneClasses.scroll,
            )}
          >
            <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}
