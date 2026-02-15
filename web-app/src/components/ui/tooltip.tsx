"use client"

import type { ComponentPropsWithoutRef } from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

type TooltipProviderProps = ComponentPropsWithoutRef<typeof TooltipPrimitive.Provider>
type TooltipProps = ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>
type TooltipTriggerProps = ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>
type TooltipContentProps = ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>

export function TooltipProvider({ delayDuration = 180, ...props }: TooltipProviderProps) {
  return <TooltipPrimitive.Provider delayDuration={delayDuration} {...props} />
}

export function Tooltip(props: TooltipProps) {
  return <TooltipPrimitive.Root {...props} />
}

export function TooltipTrigger(props: TooltipTriggerProps) {
  return <TooltipPrimitive.Trigger {...props} />
}

export function TooltipContent({ className = "", sideOffset = 8, ...props }: TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={`data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 z-50 rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg ${className}`.trim()}
        {...props}
      />
    </TooltipPrimitive.Portal>
  )
}
