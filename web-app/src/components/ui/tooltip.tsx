"use client"

import type { ComponentPropsWithoutRef } from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from "@/lib/cn"

type TooltipProviderProps = ComponentPropsWithoutRef<typeof TooltipPrimitive.Provider>
type TooltipProps = ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>
type TooltipTriggerProps = ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>
type TooltipContentProps = ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & {
  tone?: "dark" | "light"
}

export function TooltipProvider({ delayDuration = 180, ...props }: TooltipProviderProps) {
  return <TooltipPrimitive.Provider delayDuration={delayDuration} {...props} />
}

export function Tooltip(props: TooltipProps) {
  return <TooltipPrimitive.Root {...props} />
}

export function TooltipTrigger(props: TooltipTriggerProps) {
  return <TooltipPrimitive.Trigger {...props} />
}

const toneClasses: Record<NonNullable<TooltipContentProps["tone"]>, string> = {
  dark: "bg-slate-900 text-white",
  light: "border border-slate-200 bg-white text-slate-700",
}

export function TooltipContent({
  className,
  sideOffset = 8,
  tone = "dark",
  ...props
}: TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          "data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 z-50 rounded-md px-2.5 py-1.5 text-xs font-medium shadow-lg",
          toneClasses[tone],
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  )
}
