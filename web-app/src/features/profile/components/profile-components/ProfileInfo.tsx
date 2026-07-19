import { OutlineIcons } from "@/components/icons/outline-icons"
import { PlayerType } from "@/lib/types/type"
import ProfileInfoItem from "@/features/profile/components/profile-components/ProfileInfoItem"
import {
  getPlayerDisplayName,
  safeDecode,
} from "@/features/profile/components/profile-components/player-display"
import type { JSX } from "react"

interface Props {
  player: PlayerType
}

const ProfileInfo = ({ player }: Props) => {
  const ageValue = typeof player.age === "number" ? `${player.age} years` : "-"
  const bornValue = [player.born, player.birthCountry].filter(Boolean).join(" / ") || "-"
  const currentValue = `${player.value || "-"} ${player.currency || ""}`.trim()
  const capsValue =
    !player.caps || player.caps === "played  /  Goals"
      ? "-"
      : player.position.includes("Goal")
        ? `${player.caps} conceded`
        : player.caps

  const items: Array<{
    icon: JSX.Element
    label: string
    value: string | number
    href?: string
  }> = [
    {
      icon: <OutlineIcons.UserIcon />,
      label: "Name",
      value: getPlayerDisplayName(player),
    },
    {
      icon: <OutlineIcons.SparklesIcon />,
      label: "Title",
      value: safeDecode(player.title) || "-",
    },
    {
      icon: <OutlineIcons.UserIcon />,
      label: "Full Name",
      value: safeDecode(player.fullName) || "-",
    },
    {
      icon: <OutlineIcons.CakeIcon />,
      label: "Age",
      value: ageValue,
    },
    {
      icon: <OutlineIcons.CalendarIcon />,
      label: "Born",
      value: bornValue,
    },
    {
      icon: <OutlineIcons.FlagIcon />,
      label: "Country",
      value: player.country,
    },
    {
      icon: <OutlineIcons.GlobeAltIcon />,
      label: "Other Nationality",
      value: player.otherNation || "–",
    },
    {
      icon: <OutlineIcons.ArrowTrendingUpIcon />,
      label: "Highest Market Value",
      value: player.highstValue || "-",
    },
    {
      icon: <OutlineIcons.CurrencyEuroIcon />,
      label: "Current Market Value",
      value: currentValue || "-",
    },
    {
      icon: <OutlineIcons.ChartBarIcon />,
      label: "ELO Rating",
      value: player.elo || "–",
    },
    {
      icon: <OutlineIcons.TrophyIcon />,
      label: "Current Club",
      value: player.currentClub,
    },
    {
      icon: <OutlineIcons.ShieldCheckIcon />,
      label: "Position",
      value: player.position,
    },
    {
      icon: <OutlineIcons.EyeDropperIcon />,
      label: "Preferred Foot",
      value: player.preferredFoot || "–",
    },
    {
      icon: <OutlineIcons.HashtagIcon />,
      label: "Jersey Number",
      value: player.number > 0 ? player.number : "-",
    },
    {
      icon: <OutlineIcons.ArrowsRightLeftIcon />,
      label: "Caps",
      value: capsValue,
    },
    {
      icon: <OutlineIcons.ScaleIcon />,
      label: "Weight",
      value: typeof player.weight === "number" ? `${player.weight} kg` : "-",
    },
    {
      icon: <OutlineIcons.ArrowTrendingDownIcon />,
      label: "Height",
      value: typeof player.height === "number" ? `${player.height} cm` : "-",
    },
    {
      icon: <OutlineIcons.LinkIcon />,
      label: "Website",
      value: player.website || "–",
      href: player.website || undefined,
    },
    {
      icon: <OutlineIcons.SparklesIcon />,
      label: "Status",
      value: player.status || "–",
    },
  ]

  const visibleItems = items.filter((item) => {
    const normalized = String(item.value ?? "").trim()
    return normalized !== "" && normalized !== "–" && normalized !== "-" && normalized !== "null"
  })
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {visibleItems.map(({ icon, label, value, href }) => (
        <ProfileInfoItem key={label} icon={icon} label={label} value={value} href={href} />
      ))}
    </div>
  )
}

export default ProfileInfo
