interface StatTileProps {
  label: string
  value: string | number
  className?: string
}

export function StatTile({ label, value, className = "" }: StatTileProps) {
  return (
    <div className={`rounded-xl border border-white/20 bg-black/20 p-4 ${className}`.trim()}>
      <p className="text-xs tracking-wider text-gray-300 uppercase">{label}</p>
      <p className="mt-2 text-3xl font-bold text-cyan-300">{value}</p>
    </div>
  )
}
