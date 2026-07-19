import { SolidIcons } from "@/components/icons/solid-icons"
import { TitleType } from "@/lib/types/type"
import { Text } from "@/components/ui/text"

interface Props {
  titles: Array<TitleType>
}

export default function Titles({ titles }: Props) {
  return (
    <section className="space-y-3">
      <Text as="h2" variant="h3" weight="bold" className="text-emerald-950">
        Titles
      </Text>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {titles.map((title, idx) => (
          <div
            key={`${title.name}-${title.number}-${idx}`}
            className="flex items-center gap-3 rounded-2xl border border-emerald-950/8 bg-linear-to-br from-white to-lime-50/40 p-4 shadow-[0_16px_30px_-26px_rgba(15,50,36,0.38)] transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-emerald-700/20 hover:shadow-[0_20px_38px_-28px_rgba(6,78,59,0.4)] motion-reduce:transform-none motion-reduce:transition-none"
          >
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime-200/70 text-emerald-900">
              <SolidIcons.TrophyIcon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
              <Text as="span" weight="semibold" className="min-w-0 break-words text-emerald-950">
                {title.name}
              </Text>
              <span className="shrink-0 rounded-full border border-lime-300/70 bg-lime-100 px-2.5 py-1 text-xs font-bold text-emerald-900 tabular-nums">
                {title.number}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
