import { AttributeType } from "@/lib/types/type"
import {
  BoltIcon,
  FireIcon,
  ShieldCheckIcon,
  EyeDropperIcon,
  RocketLaunchIcon,
  ArrowsPointingOutIcon,
} from "@heroicons/react/24/outline"
import { JSX } from "react"
import { Text } from "@/components/ui/text"

interface Props {
  attributes: AttributeType[]
}

const iconMap: Record<string, JSX.Element> = {
  pace: <BoltIcon className="h-6 w-6 text-blue-600" />,
  shot: <RocketLaunchIcon className="h-6 w-6 text-red-600" />,
  pass: <ArrowsPointingOutIcon className="h-6 w-6 text-yellow-500" />,
  dribbling: <EyeDropperIcon className="h-6 w-6 text-violet-500" />,
  defence: <ShieldCheckIcon className="h-6 w-6 text-emerald-600" />,
  physical: <FireIcon className="h-6 w-6 text-orange-500" />,
}

const toScore = (value: string) => {
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed)) return 0
  return Math.max(0, Math.min(100, parsed))
}

const getColor = (score: number) => {
  if (score >= 80) return "bg-emerald-500"
  if (score >= 60) return "bg-amber-400"
  return "bg-rose-500"
}

export default function Attributes({ attributes }: Props) {
  return (
    <section className="space-y-3">
      <Text as="h3" variant="h3" weight="semibold" className="text-slate-900">
        Player Attributes
      </Text>
      <div className="space-y-2">
        {attributes.map((attr, index) => {
          const name = attr.name.toLowerCase()
          const icon = iconMap[name] ?? <FireIcon className="h-6 w-6 text-gray-400" />
          const score = toScore(attr.value)
          const barColor = getColor(score)

          return (
            <div
              key={`${attr.name}-${attr.value}-${index}`}
              className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="h-5 w-5 text-cyan-700">{icon}</span>
                  <Text as="span" weight="semibold" className="truncate text-slate-700 capitalize">
                    {attr.name}
                  </Text>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold text-white ${barColor}`}>
                  {score}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full rounded-full ${barColor}`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
