interface RankedListItem {
  key: string
  label: string
  value: string | number
}

interface RankedListProps {
  title: string
  items: RankedListItem[]
  emptyText: string
}

export function RankedList({ title, items, emptyText }: RankedListProps) {
  return (
    <div className="rounded-xl border border-white/20 bg-black/20 p-4">
      <h4 className="text-sm font-semibold tracking-wider text-gray-200 uppercase">{title}</h4>
      <ul className="mt-3 space-y-2">
        {items.length > 0 ? (
          items.map((entry) => (
            <li key={entry.key} className="flex items-center justify-between text-sm">
              <span>{entry.label}</span>
              <span className="rounded-md bg-cyan-500/20 px-2 py-0.5 text-cyan-200">
                {entry.value}
              </span>
            </li>
          ))
        ) : (
          <li className="text-sm text-gray-300">{emptyText}</li>
        )}
      </ul>
    </div>
  )
}
