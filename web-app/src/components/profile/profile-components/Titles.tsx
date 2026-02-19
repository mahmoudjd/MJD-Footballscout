import { SolidIcons } from "@/components/solid-icons"
import { TitleType } from "@/lib/types/type"
import { Text } from "@/components/ui/text"

interface Props {
  titles: Array<TitleType>
}

export default function Titles({ titles }: Props) {
  return (
    <section className="space-y-3">
      <Text as="h3" variant="h3" weight="semibold" className="text-slate-900">
        Titles
      </Text>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {titles.map((title, idx) => (
          <div
            key={`${title.name}-${title.number}-${idx}`}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-cyan-200"
          >
            <SolidIcons.TrophyIcon className="h-6 w-6 text-amber-500" />
            <div className="flex flex-1 items-center justify-between">
              <Text as="span" weight="semibold" className="text-slate-800">
                {title.name}
              </Text>
              <span className="rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-xs font-bold text-cyan-700">
                {title.number}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
