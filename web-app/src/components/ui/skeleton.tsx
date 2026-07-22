import React from "react"
import { cn } from "@/lib/cn"

interface SkeletonProps {
  className?: string
  tone?: "default" | "light" | "dark"
}

const toneClasses: Record<NonNullable<SkeletonProps["tone"]>, string> = {
  default: "bg-stone-200",
  light: "bg-white/20",
  dark: "bg-stone-700/35",
}

export function Skeleton({ className, tone = "default" }: SkeletonProps) {
  return <div className={cn("animate-pulse rounded-md", toneClasses[tone], className)} />
}

interface PlayersTableSkeletonProps {
  rows?: number
}

export function PlayersTableSkeleton({ rows = 6 }: PlayersTableSkeletonProps) {
  return (
    <div className="grid gap-3 p-3 sm:grid-cols-2 lg:block lg:space-y-0 lg:p-0">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="rounded-3xl border border-emerald-950/8 bg-white p-4 lg:grid lg:min-h-20 lg:grid-cols-12 lg:items-center lg:gap-4 lg:rounded-none lg:border-x-0 lg:border-t-0 lg:px-5 lg:py-3"
        >
          <div className="flex items-center gap-3 lg:col-span-3">
            <Skeleton className="h-14 w-14 shrink-0 rounded-2xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 lg:col-span-7 lg:mt-0 lg:grid-cols-4 lg:gap-4">
            <Skeleton className="h-10 rounded-xl" />
            <Skeleton className="h-10 rounded-xl" />
            <Skeleton className="h-10 rounded-xl" />
            <Skeleton className="hidden h-10 rounded-xl lg:block" />
          </div>
          <Skeleton className="mt-3 h-10 w-full rounded-xl lg:col-span-2 lg:mt-0" />
        </div>
      ))}
    </div>
  )
}

interface WatchlistsPanelSkeletonProps {
  rows?: number
}

export function WatchlistsPanelSkeleton({ rows = 5 }: WatchlistsPanelSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="rounded-lg border border-stone-200 p-3">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="mt-2 h-3 w-1/3" />
        </div>
      ))}
    </div>
  )
}

interface WatchlistDetailsSkeletonProps {
  rows?: number
}

export function WatchlistDetailsSkeleton({ rows = 3 }: WatchlistDetailsSkeletonProps) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-24 w-full" />
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="rounded-lg border border-stone-200 p-3">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="mt-2 h-3 w-1/3" />
        </div>
      ))}
    </div>
  )
}

interface HomeInsightsSkeletonProps {
  statTiles?: number
  listRows?: number
  spotlightRows?: number
}

export function HomeInsightsSkeleton({
  statTiles = 3,
  listRows = 4,
  spotlightRows = 3,
}: HomeInsightsSkeletonProps) {
  return (
    <div className="w-full animate-pulse">
      <Skeleton className="h-7 w-56 bg-white/25" />
      <Skeleton className="mt-2 h-4 w-80 max-w-full bg-white/20" />

      <div className="mt-6 grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
        {Array.from({ length: statTiles }).map((_, index) => (
          <div key={index} className="rounded-xl border border-white/20 bg-black/20 p-4">
            <Skeleton className="h-3 w-20 bg-white/20" />
            <Skeleton className="mt-3 h-8 w-24 bg-white/25" />
          </div>
        ))}
      </div>

      <div className="mt-6 grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="rounded-xl border border-white/20 bg-black/20 p-4">
            <Skeleton className="h-4 w-32 bg-white/20" />
            <div className="mt-3 space-y-2">
              {Array.from({ length: listRows }).map((__, rowIndex) => (
                <div key={rowIndex} className="flex items-center justify-between gap-2">
                  <Skeleton className="h-3 w-28 bg-white/15" />
                  <Skeleton className="h-5 w-10 bg-amber-300/35" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid w-full grid-cols-1 gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-xl border border-white/20 bg-black/20 p-4">
            <Skeleton className="h-4 w-32 bg-white/20" />
            <div className="mt-3 space-y-3">
              {Array.from({ length: spotlightRows }).map((__, rowIndex) => (
                <div key={rowIndex} className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <Skeleton className="h-3 w-32 bg-white/20" />
                    <Skeleton className="mt-1 h-2.5 w-24 bg-white/15" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-14 bg-amber-300/35" />
                    <Skeleton className="h-5 w-10 bg-amber-200/30" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Skeleton className="mt-5 h-3 w-40 bg-white/20" />
    </div>
  )
}

interface ProfilePageSkeletonProps {
  sections?: number
}

export function ProfilePageSkeleton({ sections = 5 }: ProfilePageSkeletonProps) {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-20" />

      <div className="rounded-xl border border-stone-200 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-stone-200 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-4 w-52" />
          <Skeleton className="h-8 w-28" />
        </div>
      </div>

      {Array.from({ length: sections }).map((_, index) => (
        <div key={index} className="rounded-xl border border-stone-200 p-4">
          <Skeleton className="h-5 w-40" />
          <div className="mt-3 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  )
}
