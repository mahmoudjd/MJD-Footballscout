"use client";
import React, {memo, useCallback, useMemo} from "react";
import {PlayerType} from "@/lib/types/type";
import {useRouter} from "next/navigation";
import {OutlineIcons} from "@/components/outline-icons";
import {useSession} from "next-auth/react";

// Move helper types and constants outside component for better performance
type KnownPosition = "Forward" | "Midfielder" | "Defender" | "Goalkeeper" | "Manager";

const positionStyles: Record<KnownPosition, { border: string; bg: string }> = {
    Forward: {
        border: "border-l-4 border-l-red-700",
        bg: "bg-red-700",
    },
    Midfielder: {
        border: "border-l-4 border-l-green-600",
        bg: "bg-green-600",
    },
    Defender: {
        border: "border-l-4 border-l-blue-700",
        bg: "bg-blue-700",
    },
    Goalkeeper: {
        border: "border-l-4 border-l-yellow-600",
        bg: "bg-yellow-600",
    },
    Manager: {
        border: "border-l-4 border-l-gray-400",
        bg: "bg-gray-400",
    },
};

/**
 * Normalizes a position string to one of the known positions
 */
function normalizePosition(pos: string): KnownPosition {
    const lower = pos.toLowerCase();
    if (lower.includes("forward")) return "Forward";
    if (lower.includes("midfielder")) return "Midfielder";
    if (lower.includes("defender")) return "Defender";
    if (lower.includes("goalkeeper")) return "Goalkeeper";
    return "Manager";
}

interface RowItemProps {
    player: PlayerType;
    handleDelete: (id: string) => void;
}

const RowItem = memo(({player, handleDelete}: RowItemProps) => {
    const {data: session} = useSession()
    const isLoggedIn = !!session?.user?.email;
    const router = useRouter();

    const navigateToProfile = useCallback(() => {
        if (!isLoggedIn) {
            const loginUrl = `/login?callbackUrl=${encodeURIComponent(`/players/${player._id}`)}`;
            router.push(loginUrl)
            return;
        }
        router.push(`/players/${player._id}`);
    }, [router, player._id]);

    const onDelete = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        handleDelete(player._id);
    }, [handleDelete, player._id]);

    const position = useMemo(() => normalizePosition(player.position), [player.position]);
    const styles = useMemo(() => positionStyles[position], [position]);

    return (
        <tr
            className={`h-28 ${styles.border} cursor-pointer bg-white border-b border-b-gray-400 even:bg-gray-100 hover:bg-blue-50 transition-colors duration-150`}
            onClick={navigateToProfile}
            data-testid={`player-row-${player._id}`}
        >
            <td className="px-2">
                <div className="flex space-x-2 items-center justify-start w-full">
                    <div
                        className={`hidden sm:flex sm:w-7 sm:h-7 text-sm sm:text-lg items-center justify-center ${styles.bg} text-white rounded-full font-semibold`}
                        aria-hidden="true"
                    >
                        {player.number}
                    </div>
                    <img
                        src={player.image}
                        alt={`${player.name}'s profile`}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover"
                        loading="lazy"
                    />
                    <div className="flex flex-col justify-between">
                        <p className="text-gray-800 font-medium text-sm sm:text-lg">{player.name}</p>
                        <p className="text-gray-500 text-sm">{player.country}</p>
                        <p className="text-gray-500 text-sm">{player.currentClub}</p>
                    </div>
                </div>
            </td>
            <td className="px-2 hidden sm:table-cell">{player.age}</td>
            <td className="px-2 hidden sm:table-cell">{position}</td>
            <td className="px-2 text-center">
                <button
                    onClick={onDelete}
                    disabled={!session?.user?.email}
                    title="Delete player"
                    className="hover:scale-110 transition-transform cursor-pointer p-2"
                    aria-label={`Delete ${player.name}`}
                >
                    <OutlineIcons.TrashIcon className="w-6 h-6 stroke-red-700 hover:stroke-red-600"/>
                </button>
            </td>
        </tr>
    );
});

RowItem.displayName = 'RowItem';

export default RowItem;
