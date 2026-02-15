"use client"

import type { ComponentPropsWithoutRef } from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

type TabsProps = ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
type TabsListProps = ComponentPropsWithoutRef<typeof TabsPrimitive.List>
type TabsTriggerProps = ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
type TabsContentProps = ComponentPropsWithoutRef<typeof TabsPrimitive.Content>

export function Tabs({ className = "", ...props }: TabsProps) {
  return <TabsPrimitive.Root className={className} {...props} />
}

export function TabsList({ className = "", ...props }: TabsListProps) {
  return (
    <TabsPrimitive.List
      className={`inline-flex items-center rounded-md border border-slate-200 bg-slate-100 p-1 ${className}`.trim()}
      {...props}
    />
  )
}

export function TabsTrigger({ className = "", ...props }: TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      className={`inline-flex min-h-9 items-center justify-center rounded-sm px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:text-slate-900 data-[state=active]:bg-white data-[state=active]:text-cyan-700 data-[state=active]:shadow-sm ${className}`.trim()}
      {...props}
    />
  )
}

export function TabsContent({ className = "", ...props }: TabsContentProps) {
  return <TabsPrimitive.Content className={`mt-4 ${className}`.trim()} {...props} />
}
