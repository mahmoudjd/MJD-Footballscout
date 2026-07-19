import type { ComponentType, SVGProps } from "react"
import {
  ArrowsPointingOutIcon,
  BoltIcon,
  EyeDropperIcon,
  FireIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline"
import { Text } from "@/components/ui/text"
import type { AttributeType } from "@/lib/types/type"

interface Props {
  attributes: AttributeType[]
}

type AttributeIcon = ComponentType<SVGProps<SVGSVGElement>>

const iconMap: Record<string, AttributeIcon> = {
  pace: BoltIcon,
  shot: RocketLaunchIcon,
  pass: ArrowsPointingOutIcon,
  dribbling: EyeDropperIcon,
  defence: ShieldCheckIcon,
  physical: FireIcon,
}

const toScore = (value: string) => {
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed)) return 0
  return Math.max(0, Math.min(100, parsed))
}

const getScoreTone = (score: number) => {
  if (score >= 85) {
    return {
      label: "Elite",
      bar: "bg-emerald-500",
      badge: "border-emerald-200 bg-emerald-50 text-emerald-800",
      icon: "bg-emerald-100 text-emerald-800",
      score: "text-emerald-700",
    }
  }

  if (score >= 70) {
    return {
      label: "Strong",
      bar: "bg-lime-500",
      badge: "border-lime-300 bg-lime-50 text-emerald-800",
      icon: "bg-lime-100 text-emerald-800",
      score: "text-emerald-800",
    }
  }

  if (score >= 50) {
    return {
      label: "Balanced",
      bar: "bg-amber-400",
      badge: "border-amber-200 bg-amber-50 text-amber-800",
      icon: "bg-amber-100 text-amber-800",
      score: "text-amber-700",
    }
  }

  return {
    label: "Developing",
    bar: "bg-rose-500",
    badge: "border-rose-200 bg-rose-50 text-rose-800",
    icon: "bg-rose-100 text-rose-700",
    score: "text-rose-700",
  }
}

export default function Attributes({ attributes }: Props) {
  const scoredAttributes = attributes.map((attribute) => ({
    ...attribute,
    score: toScore(attribute.value),
  }))
  const totalScore = scoredAttributes.reduce((total, attribute) => total + attribute.score, 0)
  const averageScore = scoredAttributes.length
    ? Math.round(totalScore / scoredAttributes.length)
    : 0
  const strongestAttribute = scoredAttributes.reduce<(typeof scoredAttributes)[number] | null>(
    (strongest, attribute) =>
      !strongest || attribute.score > strongest.score ? attribute : strongest,
    null,
  )

  return (
    <section className="space-y-5">
      <div className="grid gap-4 rounded-3xl border border-emerald-950/8 bg-linear-to-br from-emerald-950 via-emerald-900 to-emerald-800 p-5 text-white shadow-[0_26px_55px_-34px_rgba(6,78,59,0.7)] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-6">
        <div className="min-w-0">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-lime-200/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-lime-100">
            <SparklesIcon className="h-4 w-4" aria-hidden="true" />
            Performance Profile
          </span>
          <Text as="h2" variant="h2" weight="extrabold" className="text-white">
            Player Attributes
          </Text>
          <Text as="p" variant="body-lg" className="mt-2 max-w-2xl text-emerald-50/70">
            A focused view of the player&apos;s technical, physical & tactical strengths.
          </Text>
          {strongestAttribute ? (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-emerald-50/75">
              <span>Top Attribute</span>
              <span className="rounded-full bg-lime-300 px-3 py-1 font-extrabold text-emerald-950 tabular-nums">
                {strongestAttribute.name}: {strongestAttribute.score}
              </span>
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-3 sm:flex-col">
          <div
            className="grid h-24 w-24 shrink-0 place-items-center rounded-full p-2 shadow-[0_18px_36px_-22px_rgba(0,0,0,0.65)]"
            style={{
              background: `conic-gradient(#bef264 ${averageScore * 3.6}deg, rgba(255,255,255,0.14) 0deg)`,
            }}
            role="img"
            aria-label={`Overall attribute score ${averageScore} out of 100`}
          >
            <div className="grid h-full w-full place-items-center rounded-full bg-emerald-950 text-center">
              <div>
                <span className="block text-2xl font-extrabold text-white tabular-nums">
                  {averageScore}
                </span>
                <span className="block text-[9px] font-bold tracking-[0.14em] text-lime-200 uppercase">
                  Overall
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {scoredAttributes.map((attribute, index) => {
          const normalizedName = attribute.name.toLowerCase()
          const Icon = iconMap[normalizedName] ?? SparklesIcon
          const tone = getScoreTone(attribute.score)

          return (
            <article
              key={`${attribute.name}-${index}`}
              className="group min-w-0 overflow-hidden rounded-2xl border border-emerald-950/8 bg-linear-to-br from-white via-white to-emerald-50/45 p-4 shadow-[0_18px_36px_-28px_rgba(15,50,36,0.42)] transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-emerald-700/20 hover:shadow-[0_24px_42px_-28px_rgba(6,78,59,0.42)] motion-reduce:transform-none motion-reduce:transition-none"
            >
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-inner ${tone.icon}`}
                    aria-hidden="true"
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <Text
                      as="h3"
                      variant="title"
                      weight="bold"
                      className="truncate text-emerald-950 capitalize"
                    >
                      {attribute.name}
                    </Text>
                    <span
                      className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${tone.badge}`}
                    >
                      {tone.label}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <span
                    className={`text-3xl leading-none font-extrabold tabular-nums ${tone.score}`}
                  >
                    {attribute.score}
                  </span>
                  <span className="block text-[10px] font-semibold text-emerald-950/40">/ 100</span>
                </div>
              </div>

              <div className="mt-5">
                <div
                  className="h-2.5 w-full overflow-hidden rounded-full bg-emerald-950/8"
                  role="progressbar"
                  aria-label={`${attribute.name} score`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={attribute.score}
                >
                  <div
                    className={`h-full rounded-full ${tone.bar}`}
                    style={{ width: `${attribute.score}%` }}
                  />
                </div>
                <div
                  className="mt-2 flex justify-between text-[10px] font-semibold text-emerald-950/35 tabular-nums"
                  aria-hidden="true"
                >
                  <span>0</span>
                  <span>50</span>
                  <span>100</span>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
