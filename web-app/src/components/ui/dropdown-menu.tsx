"use client"

import type { ComponentPropsWithoutRef } from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { cn } from "@/lib/cn"

type DropdownMenuProps = ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Root>
type DropdownMenuTriggerProps = ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Trigger>
type DropdownMenuContentProps = ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> & {
  tone?: "default" | "glass"
}
type DropdownMenuItemProps = ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean
  tone?: "default" | "danger"
}
type DropdownMenuLabelProps = ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>
type DropdownMenuSeparatorProps = ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>

export function DropdownMenu(props: DropdownMenuProps) {
  return <DropdownMenuPrimitive.Root {...props} />
}

export function DropdownMenuTrigger(props: DropdownMenuTriggerProps) {
  return <DropdownMenuPrimitive.Trigger {...props} />
}

const contentToneClasses: Record<NonNullable<DropdownMenuContentProps["tone"]>, string> = {
  default: "border-emerald-950/10 bg-white",
  glass: "border-white/30 bg-slate-900/80 text-white backdrop-blur-md",
}

export function DropdownMenuContent({
  className,
  sideOffset = 8,
  tone = "default",
  ...props
}: DropdownMenuContentProps) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 z-50 min-w-52 overflow-hidden rounded-2xl border p-1.5 shadow-[0_22px_50px_-26px_rgba(15,50,36,0.48)]",
          contentToneClasses[tone],
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

export function DropdownMenuItem({
  className,
  inset = false,
  tone = "default",
  ...props
}: DropdownMenuItemProps) {
  const toneClasses = {
    default: "text-stone-700 data-[highlighted]:bg-emerald-50 data-[highlighted]:text-emerald-950",
    danger: "text-red-700 data-[highlighted]:bg-red-50 data-[highlighted]:text-red-800",
  }[tone]

  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        "relative flex min-h-10 cursor-pointer items-center rounded-xl px-3 py-2 text-sm font-medium transition-colors outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        toneClasses,
        inset && "pl-8",
        className,
      )}
      {...props}
    />
  )
}

export function DropdownMenuLabel({ className, ...props }: DropdownMenuLabelProps) {
  return (
    <DropdownMenuPrimitive.Label
      className={cn(
        "px-2.5 py-2 text-xs font-semibold tracking-wide text-stone-500 uppercase",
        className,
      )}
      {...props}
    />
  )
}

export function DropdownMenuSeparator({ className, ...props }: DropdownMenuSeparatorProps) {
  return (
    <DropdownMenuPrimitive.Separator
      className={cn("my-1 h-px bg-stone-200", className)}
      {...props}
    />
  )
}
