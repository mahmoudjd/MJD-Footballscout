import { JSX } from "react"

interface InfoItemProps {
  icon: JSX.Element
  label: string
  value: string | number
  clickable?: boolean
  onClick?: () => void
}

const ProfileInfoItem = ({ icon, label, value, clickable, onClick }: InfoItemProps) => (
  <div
    onClick={clickable ? onClick : undefined}
    className={`flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm ${
      clickable ? "cursor-pointer transition hover:bg-cyan-50" : ""
    }`}
  >
    <div className="mt-1 h-6 w-6 text-cyan-600">{icon}</div>
    <div className="flex flex-col text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium break-words text-gray-900">{value}</span>
    </div>
  </div>
)

export default ProfileInfoItem
