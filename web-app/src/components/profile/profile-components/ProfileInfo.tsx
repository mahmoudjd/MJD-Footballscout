import { OutlineIcons } from "@/components/outline-icons"
import { PlayerType } from "@/lib/types/type"
import ProfileInfoItem from "@/components/profile/profile-components/ProfileInfoItem"
import { getPlayerDisplayName, safeDecode } from "@/components/profile/profile-components/player-display"

interface Props {
  player: PlayerType
  maxItems?: number
}

const ProfileInfo = ({ player, maxItems }: Props) => {
  const openWebsite = () =>
    player.website && window.open(player.website, "_blank", "noopener noreferrer")

  const ageValue = typeof player.age === "number" ? `${player.age} years` : "-"
  const bornValue = [player.born, player.birthCountry].filter(Boolean).join(" / ") || "-"
  const currentValue = `${player.value || "-"} ${player.currency || ""}`.trim()
  const capsValue =
    !player.caps || player.caps === "played  /  Goals"
      ? "-"
      : player.position.includes("Goal")
        ? `${player.caps} conceded`
        : player.caps

  const items = [
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
      clickable: !!player.website,
      onClick: openWebsite,
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
  const renderedItems = typeof maxItems === "number" ? visibleItems.slice(0, maxItems) : visibleItems

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {renderedItems.map(({ icon, label, value, clickable, onClick }) => (
        <ProfileInfoItem
          key={label}
          icon={icon}
          label={label}
          value={value}
          clickable={clickable}
          onClick={onClick}
        />
      ))}
    </div>
  )
}

export default ProfileInfo
