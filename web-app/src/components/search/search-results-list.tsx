import {PlayerType} from "@/lib/types/type";
import Link from "next/link";
import {Player} from "@/components/search/Player";

export function SearchResultsList({ players }: { players: PlayerType[] }) {
    if (players.length === 0) return null;

    return (
        <div className="mt-6 flex flex-col divide-y divide-gray-200">
            {players.map((player) => (
                <Link
                    key={player._id}
                    href={`/players/${player._id}`}
                    className="transition"
                >
                    <Player player={player} />
                </Link>
            ))}
        </div>
    );
}