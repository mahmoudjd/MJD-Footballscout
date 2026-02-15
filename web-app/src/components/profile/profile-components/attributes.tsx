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

const getColor = (value: string) => {
  const numOfValue = parseInt(value, 10)
  if (numOfValue >= 80) return "bg-green-500"
  if (numOfValue >= 60) return "bg-yellow-400"
  return "bg-red-500"
}

export default function Attributes({ attributes }: Props) {
  return (
    <section className="rounded-2xl bg-gray-50 p-4 shadow-lg sm:p-6">
      <h3 className="mb-4 text-xl font-semibold text-gray-800">Player Attributes</h3>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-6">
        {attributes.map((attr, index) => {
          const name = attr.name.toLowerCase()
          const icon = iconMap[name] ?? <FireIcon className="h-6 w-6 text-gray-400" />

          return (
            <div
              key={`${attr.name}-${attr.value}-${index}`}
              className="mx-auto flex h-24 w-24 flex-col items-center justify-center rounded-full border border-gray-200 bg-white p-3 shadow-md sm:h-28 sm:w-28 sm:p-4"
            >
              <div className="mb-1">{icon}</div>
              <span className="text-sm font-semibold text-gray-700 capitalize">{attr.name}</span>
              <span
                className={`mt-1 text-xl font-bold ${getColor(attr.value)} rounded-full px-3 py-1 text-white`}
              >
                {attr.value}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
