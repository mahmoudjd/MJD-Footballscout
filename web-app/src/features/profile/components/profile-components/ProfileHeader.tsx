import { OutlineIcons } from "@/components/icons/outline-icons"
import {
  getPlayerDisplayName,
  safeDecode,
} from "@/features/profile/components/profile-components/player-display"
import { Text } from "@/components/ui/text"
import Image from "next/image"
import { getPlayerImageSrc } from "@/lib/player-image"

interface HeaderProps {
  position: string
  name: string
  title: string
  fullName?: string
  image?: string
  number: number
  age?: number
  currentClub?: string
}

export default function ProfileHeader({
  name,
  title,
  fullName,
  position,
  image,
  number,
  age,
  currentClub,
}: HeaderProps) {
  const displayName = getPlayerDisplayName({
    title,
    name,
    fullName: fullName || "",
  })
  const subtitle = safeDecode(fullName).trim()

  return (
    <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-emerald-950 via-emerald-900 to-emerald-700 p-5 text-white shadow-[0_30px_70px_-34px_rgba(6,78,59,0.72)] sm:p-7">
      <div
        className="pointer-events-none absolute -top-24 -left-16 h-56 w-56 rounded-full bg-lime-300/12 blur-sm"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-20 -bottom-32 h-72 w-72 rounded-full bg-white/10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-lime-300/70 to-transparent"
        aria-hidden="true"
      />

      <div className="relative grid items-center gap-5 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-7">
        <div className="mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl border border-white/25 bg-white/15 p-1.5 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.65)] sm:mx-0 sm:h-32 sm:w-32">
          {image ? (
            <Image
              src={getPlayerImageSrc(image)}
              alt={displayName}
              width={128}
              height={128}
              priority
              className="h-full w-full rounded-[1.15rem] object-cover"
              sizes="(max-width: 640px) 112px, 128px"
            />
          ) : (
            <Text as="div" variant="display" className="text-white/70">
              ?
            </Text>
          )}
        </div>

        <div className="min-w-0 text-center sm:text-left">
          <Text as="p" variant="overline" weight="bold" className="mb-2 text-lime-200">
            Player Profile
          </Text>
          <Text as="h1" variant="h1" weight="extrabold" className="break-words text-white">
            {displayName}
          </Text>
          {subtitle && subtitle !== displayName ? (
            <Text as="p" variant="body-lg" className="mt-2 text-white/72">
              {subtitle}
            </Text>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            {position ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/12 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
                <OutlineIcons.ShieldCheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
                {position}
              </span>
            ) : null}
            {currentClub ? (
              <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/15 bg-white/12 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
                <OutlineIcons.TrophyIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{currentClub}</span>
              </span>
            ) : null}
          </div>
        </div>

        <div className="mx-auto flex items-center gap-2 sm:mx-0 sm:flex-col sm:items-end">
          {number > 0 ? (
            <div className="flex h-16 min-w-16 flex-col items-center justify-center rounded-2xl border border-lime-200/25 bg-lime-300/15 px-3 text-lime-50 backdrop-blur-sm sm:h-20 sm:min-w-20">
              <span className="text-[10px] font-bold tracking-[0.16em] text-lime-200 uppercase">
                Number
              </span>
              <span className="text-2xl font-extrabold tabular-nums sm:text-3xl">{number}</span>
            </div>
          ) : null}
          {typeof age === "number" ? (
            <span className="text-xs font-semibold text-white/60 tabular-nums">
              {age} years old
            </span>
          ) : null}
        </div>
      </div>
    </header>
  )
}
