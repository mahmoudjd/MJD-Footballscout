import { OutlineIcons } from "@/components/outline-icons"
import { getPlayerDisplayName, safeDecode } from "@/components/profile/profile-components/player-display"
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

type HeroTone = {
  gradient: string
  badge: string
}

const setHeroTone = (position: string): HeroTone => {
  if (position.includes("Forward")) {
    return {
      gradient: "from-rose-700 via-rose-600 to-red-700",
      badge: "bg-white/18 text-white",
    }
  }
  if (position.includes("Midfielder")) {
    return {
      gradient: "from-teal-700 via-emerald-600 to-green-700",
      badge: "bg-white/18 text-white",
    }
  }
  if (position.includes("Defender")) {
    return {
      gradient: "from-sky-700 via-blue-600 to-indigo-700",
      badge: "bg-white/18 text-white",
    }
  }
  return {
    gradient: "from-amber-600 via-amber-500 to-orange-600",
    badge: "bg-white/22 text-white",
  }
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
  const tone = setHeroTone(position || "")
  const displayName = getPlayerDisplayName({
    title,
    name,
    fullName: fullName || "",
  })

  return (
    <header
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br p-4 text-white shadow-[0_20px_40px_-24px_rgba(15,23,42,0.6)] sm:p-6 ${tone.gradient}`}
    >
      <div className="pointer-events-none absolute -top-20 -left-14 h-44 w-44 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -right-14 -bottom-24 h-52 w-52 rounded-full bg-white/10" />

      <div className="relative">
        <div className="mb-4 flex min-h-7 items-center justify-between gap-2">
          {number > 0 ? (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${tone.badge}`}
            >
              <OutlineIcons.HashtagIcon className="h-3.5 w-3.5" />
              {number}
            </span>
          ) : (
            <span />
          )}
          {typeof age === "number" ? (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${tone.badge}`}
            >
              <OutlineIcons.CakeIcon className="h-3.5 w-3.5" />
              {age}y
            </span>
          ) : null}
        </div>

        <div className="grid items-center gap-4 sm:grid-cols-[auto_1fr]">
          <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-white/20 p-1.5 shadow-md sm:mx-0 sm:h-28 sm:w-28">
            {image ? (
              <Image
                src={getPlayerImageSrc(image)}
                alt={displayName}
                width={112}
                height={112}
                className="h-full w-full rounded-full object-cover"
                sizes="(max-width: 640px) 96px, 112px"
              />
            ) : (
              <Text as="div" variant="display" className="text-white/70">
                ?
              </Text>
            )}
          </div>

          <div className="min-w-0 space-y-2">
            <Text as="h2" variant="h2" weight="extrabold" className="leading-tight tracking-tight text-white sm:text-3xl">
              {displayName}
            </Text>
            {title ? (
              <Text as="p" className="text-white/85 sm:text-[15px]">
                {safeDecode(title)}
              </Text>
            ) : null}

            <div className="mt-2 flex flex-wrap items-center gap-2">
              {position ? (
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${tone.badge}`}>
                  <OutlineIcons.ShieldCheckIcon className="h-3.5 w-3.5" />
                  {position}
                </span>
              ) : null}
              {currentClub ? (
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${tone.badge}`}>
                  <OutlineIcons.TrophyIcon className="h-3.5 w-3.5" />
                  {currentClub}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
