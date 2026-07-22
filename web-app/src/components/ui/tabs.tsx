"use client"

import type { ComponentPropsWithoutRef } from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/cn"

type TabsProps = ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
type TabsListProps = ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
  tone?: "default" | "glass"
}
type TabsTriggerProps = ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
  tone?: "default" | "glass"
}
type TabsContentProps = ComponentPropsWithoutRef<typeof TabsPrimitive.Content>

const listToneClasses: Record<NonNullable<TabsListProps["tone"]>, string> = {
  default: "border-emerald-950/10 bg-emerald-950/[0.04]",
  glass: "border-white/30 bg-white/12 text-white backdrop-blur-md",
}

const triggerToneClasses: Record<NonNullable<TabsTriggerProps["tone"]>, string> = {
  default:
    "text-stone-600 hover:bg-white/70 hover:text-emerald-950 data-[state=active]:bg-emerald-950 data-[state=active]:text-white data-[state=active]:shadow-sm",
  glass:
    "text-stone-200 hover:text-white data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-none",
}

export function Tabs({ className, ...props }: TabsProps) {
  return <TabsPrimitive.Root className={cn(className)} {...props} />
}

export function TabsList({ className, tone = "default", ...props }: TabsListProps) {
  return (
    <TabsPrimitive.List
      className={cn(
        "inline-flex items-center rounded-xl border p-1",
        listToneClasses[tone],
        className,
      )}
      {...props}
    />
  )
}

export function TabsTrigger({ className, tone = "default", ...props }: TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "inline-flex min-h-10 touch-manipulation items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold tracking-[0.01em] transition-[background-color,color,box-shadow] focus-visible:ring-2 focus-visible:ring-lime-500/60 focus-visible:outline-none",
        triggerToneClasses[tone],
        className,
      )}
      {...props}
    />
  )
}

export function TabsContent({ className, ...props }: TabsContentProps) {
  return (
    <TabsPrimitive.Content
      className={cn("mt-4 focus-visible:outline-none", className)}
      {...props}
    />
  )
}
