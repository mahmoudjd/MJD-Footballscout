import {OutlineIcons} from "@/components/outline-icons";
import PlayerType from "@/lib/types/type";
import ProfileInfoItem from "@/components/profile/profile-components/ProfileInfoItem";

interface Props {
    player: PlayerType;
}

const ProfileInfo = ({player}: Props) => {
    const openWebsite = () =>
        player.website && window.open(player.website, "_blank", "noopener noreferrer");

    const items = [
        {
            icon: <OutlineIcons.UserIcon/>,
            label: "Name",
            value: decodeURIComponent(player.name),
        },
        {
            icon: <OutlineIcons.SparklesIcon/>,
            label: "Title",
            value: decodeURIComponent(player.title),
        },
        {
            icon: <OutlineIcons.UserIcon/>,
            label: "Full Name",
            value: decodeURIComponent(player.fullName),
        },
        {
            icon: <OutlineIcons.CakeIcon/>,
            label: "Age",
            value: `${player.age} years`,
        },
        {
            icon: <OutlineIcons.CalendarIcon/>,
            label: "Born",
            value: `${player.born} / ${player.birthCountry}`,
        },
        {
            icon: <OutlineIcons.FlagIcon/>,
            label: "Country",
            value: player.country,
        },
        {
            icon: <OutlineIcons.GlobeAltIcon/>,
            label: "Other Nationality",
            value: player.otherNation || "–",
        },
        {
            icon: <OutlineIcons.ArrowTrendingUpIcon/>,
            label: "Highest Market Value",
            value: player.highstValue,
        },
        {
            icon: <OutlineIcons.CurrencyEuroIcon/>,
            label: "Current Market Value",
            value: `${player.value} ${player.currency}`,
        },
        {
            icon: <OutlineIcons.ChartBarIcon/>,
            label: "ELO Rating",
            value: player.elo || "–",
        },
        {
            icon: <OutlineIcons.TrophyIcon/>,
            label: "Current Club",
            value: player.currentClub,
        },
        {
            icon: <OutlineIcons.ShieldCheckIcon/>,
            label: "Position",
            value: player.position,
        },
        {
            icon: <OutlineIcons.EyeDropperIcon/>,
            label: "Preferred Foot",
            value: player.preferredFoot || "–",
        },
        {
            icon: <OutlineIcons.HashtagIcon/>,
            label: "Jersey Number",
            value: player.number > 0 ? player.number : "-",
        },
        {
            icon: <OutlineIcons.ArrowsRightLeftIcon/>,
            label: "Caps",
            value:
                player.position.includes("Goal")
                    ? `${player.caps} conceded`
                    : player.caps,
        },
        {
            icon: <OutlineIcons.ScaleIcon/>,
            label: "Weight",
            value: `${player.weight} kg`,
        },
        {
            icon: <OutlineIcons.ArrowTrendingDownIcon/>,
            label: "Height",
            value: `${player.height} cm`,
        },
        {
            icon: <OutlineIcons.LinkIcon/>,
            label: "Website",
            value: player.website || "–",
            clickable: !!player.website,
            onClick: openWebsite,
        },
        {
            icon: <OutlineIcons.SparklesIcon/>,
            label: "Status",
            value: player.status || "–",
        },
    ];

    return (
        <section className="bg-gray-50 p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Player Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items
                    .filter((item) => item.value && item.value !== "–" && item.value !== 0)
                    .map(({icon, label, value, clickable, onClick}) => (
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
        </section>
    );
};

export default ProfileInfo;