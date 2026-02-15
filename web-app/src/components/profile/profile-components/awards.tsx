import { AwardType } from "@/lib/types/type"
import { SolidIcons } from "@/components/solid-icons"

interface AwardProps {
  awards: Array<AwardType>
}

export default function Awards({ awards }: AwardProps) {
  return (
    <section className="mt-6 rounded-2xl bg-gray-50 p-4 shadow-lg sm:p-6">
      <h3 className="mb-6 text-xl font-semibold text-gray-800 sm:text-2xl">Awards</h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {awards.map((award, idx) => (
          <div
            key={`${award.name}-${award.number}-${idx}`}
            className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            <SolidIcons.StarIcon className="h-8 w-8 text-yellow-400" />
            <div className="flex flex-1 items-center justify-between">
              <span className="text-lg font-semibold text-gray-800">{award.name}</span>
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-bold text-indigo-600">
                {award.number}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
