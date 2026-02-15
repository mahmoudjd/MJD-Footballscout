import { SolidIcons } from "@/components/solid-icons"
import { TitleType } from "@/lib/types/type"

interface Props {
  titles: Array<TitleType>
}

export default function Titles({ titles }: Props) {
  return (
    <section className="mt-6 rounded-2xl bg-gray-50 p-4 shadow-lg sm:p-6">
      <h3 className="mb-6 pb-2 text-xl font-semibold text-gray-800 sm:text-2xl">Titles</h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {titles.map((title, idx) => (
          <div
            key={`${title.name}-${title.number}-${idx}`}
            className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            <SolidIcons.TrophyIcon className="h-8 w-8 text-yellow-400" />
            <div className="flex flex-1 items-center justify-between">
              <span className="text-lg font-semibold text-gray-800">{title.name}</span>
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-bold text-indigo-700">
                {title.number}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
