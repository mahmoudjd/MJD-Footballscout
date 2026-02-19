import { AwardType } from "@/lib/types/type"
import { SolidIcons } from "@/components/solid-icons"
import { Text } from "@/components/ui/text"

interface AwardProps {
  awards: Array<AwardType>
}

export default function Awards({ awards }: AwardProps) {
  return (
    <section className="space-y-3">
      <Text as="h3" variant="h3" weight="semibold" className="text-slate-900">
        Awards
      </Text>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {awards.map((award, idx) => (
          <div
            key={`${award.name}-${award.number}-${idx}`}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-cyan-200"
          >
            <SolidIcons.StarIcon className="h-6 w-6 text-amber-500" />
            <div className="flex flex-1 items-center justify-between">
              <Text as="span" weight="semibold" className="text-slate-800">
                {award.name}
              </Text>
              <span className="rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-xs font-bold text-cyan-700">
                {award.number}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
