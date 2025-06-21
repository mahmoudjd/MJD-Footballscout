import Image from "next/image";
import {PlayerType} from "@/lib/types/type";

interface Props {
    player: PlayerType;
}

export function Player({player}: Props) {
    return (
        <div className="bg-white flex items-center space-x-4 p-3 shadow-sm">
            <Image
                src={player.image}
                alt={player.name}
                width={96}
                height={96}
                className="w-24 h-24 rounded-full object-cover"
            />
            <div className="flex flex-col space-y-1">
                <h3 className="text-lg font-semibold text-gray-800">
                    {player.name} <span className="text-sm text-gray-500">#{player.number}</span>
                </h3>
                <p className="text-sm text-gray-600">{player.fullName}</p>
                <p className="text-sm text-gray-600">{player.country} • {player.currentClub}</p>
                <p className="text-sm text-gray-500">{player.age} years old</p>
            </div>
        </div>
    )
}
