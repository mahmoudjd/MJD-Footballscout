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
  default: "border-slate-200 bg-slate-100/90",
  glass: "border-white/30 bg-white/12 text-white backdrop-blur-md",
}

const triggerToneClasses: Record<NonNullable<TabsTriggerProps["tone"]>, string> = {
  default:
    "text-slate-600 hover:text-slate-900 data-[state=active]:bg-white data-[state=active]:text-cyan-700 data-[state=active]:shadow-sm",
  glass:
    "text-slate-200 hover:text-white data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-none",
}

export function Tabs({ className, ...props }: TabsProps) {
  return <TabsPrimitive.Root className={cn(className)} {...props} />
}

export function TabsList({ className, tone = "default", ...props }: TabsListProps) {
  return (
    <TabsPrimitive.List
      className={cn("inline-flex items-center rounded-xl border p-1", listToneClasses[tone], className)}
      {...props}
    />
  )
}

export function TabsTrigger({ className, tone = "default", ...props }: TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "inline-flex min-h-9 items-center justify-center rounded-lg px-3 py-1.5 text-sm font-semibold transition",
        triggerToneClasses[tone],
        className,
      )}
      {...props}
    />
  )
}

export function TabsContent({ className, ...props }: TabsContentProps) {
  return <TabsPrimitive.Content className={cn("mt-4", className)} {...props} />
}
