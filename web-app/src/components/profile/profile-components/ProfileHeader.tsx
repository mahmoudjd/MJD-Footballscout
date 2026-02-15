interface HeaderProps {
  position: string
  name: string
  title: string
  image?: string
  number: number
}

const setHeaderGradient = (position: string) => {
  if (position.includes("Forward")) return "from-rose-600 to-pink-700"
  if (position.includes("Midfielder")) return "from-emerald-600 to-green-700"
  if (position.includes("Defender")) return "from-sky-600 to-blue-700"
  return "from-amber-500 to-yellow-600"
}

const setBadgeColor = (position: string) => {
  if (position.includes("Forward")) return "bg-red-100 text-red-800"
  if (position.includes("Midfielder")) return "bg-emerald-100 text-emerald-800"
  if (position.includes("Defender")) return "bg-sky-100 text-sky-800"
  return "bg-amber-100 text-amber-800"
}

const ProfileHeader = ({ name, title, position, image, number }: HeaderProps) => {
  return (
    <header
      className={`grid grid-cols-1 items-center gap-5 rounded-2xl bg-gradient-to-r p-4 text-white shadow-lg sm:p-6 md:grid-cols-[auto_1fr] ${setHeaderGradient(position)}`}
    >
      <div className="mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-white shadow-md sm:h-40 sm:w-40 md:mx-0">
        {image ? (
          <img src={image} alt={name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="text-5xl text-gray-300">?</div>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {decodeURIComponent(title || name)}
        </h2>

        <div
          className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${setBadgeColor(position)} bg-opacity-90 backdrop-blur-sm`}
        >
          {position}
        </div>

        {number > 0 && (
          <div className="mt-2 flex items-center gap-2 text-base font-medium text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-white/10 font-bold text-white">
              #{number}
            </span>
            <span className="opacity-90">Shirt Number</span>
          </div>
        )}
      </div>
    </header>
  )
}

export default ProfileHeader
