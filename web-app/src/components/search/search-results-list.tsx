import {PlayerType} from "@/lib/types/type";
import Link from "next/link";
import {Player} from "@/components/search/Player";

export function SearchResultsList({ players }: { players: PlayerType[] }) {
    if (players.length === 0) return null;

    return (
        <div className="mt-6 flex flex-col divide-y divide-gray-200">
            {players.map((player) => (
                    <Player player={player} key={player.fullName} />
            ))}
        </div>
    );
}