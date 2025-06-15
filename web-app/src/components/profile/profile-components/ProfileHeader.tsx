interface HeaderProps {
    position: string;
    name: string;
    title: string;
    image?: string;
    number: number;
}

const setHeaderGradient = (position: string) => {
    if (position.includes("Forward")) return "from-rose-600 to-pink-700";
    if (position.includes("Midfielder")) return "from-emerald-600 to-green-700";
    if (position.includes("Defender")) return "from-sky-600 to-blue-700";
    return "from-amber-500 to-yellow-600";
};

const setBadgeColor = (position: string) => {
    if (position.includes("Forward")) return "bg-red-100 text-red-800";
    if (position.includes("Midfielder")) return "bg-emerald-100 text-emerald-800";
    if (position.includes("Defender")) return "bg-sky-100 text-sky-800";
    return "bg-amber-100 text-amber-800";
};

const ProfileHeader = ({name, title, position, image, number}: HeaderProps) => {
    return (
        <header
            className={`grid grid-cols-1 md:grid-cols-[auto_1fr] items-center gap-6 p-6 rounded-2xl shadow-lg text-white bg-gradient-to-r ${setHeaderGradient(position)}`}
        >
            {/* Spielerbild */}
            <div className="w-40 h-40 flex items-center justify-center bg-white rounded-full shadow-md overflow-hidden">
                {image ? (
                    <img src={image} alt={name} className="w-full h-full object-cover" loading="lazy"/>
                ) : (
                    <div className="text-gray-300 text-5xl">?</div>
                )}
            </div>

            {/* Spielerinfo */}
            <div className="space-y-3">
                {/* Name und Titel */}
                <h2 className="text-3xl font-bold tracking-tight">
                    {decodeURIComponent(title || name)}
                </h2>

                {/* Position-Badge */}
                <div
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${setBadgeColor(position)} bg-opacity-90 backdrop-blur-sm`}
                >
                    {position}
                </div>

                {/* Trikotnummer */}
                {number > 0 && (
                    <div className="mt-2 flex items-center gap-2 text-base text-white font-medium">
                        <span
                            className="w-9 h-9 flex items-center justify-center rounded-full border-2 border-white text-white bg-white/10 font-bold">
                            #{number}
                        </span>
                        <span className="opacity-90">Shirt Number</span>
                    </div>
                )}
            </div>
        </header>
    );
};

export default ProfileHeader;
