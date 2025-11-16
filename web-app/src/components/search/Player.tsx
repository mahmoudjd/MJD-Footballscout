import React, { useState, useEffect } from "react";
import Image from "next/image";
import { PlayerType } from "@/lib/types/type";
import { OutlineIcons } from "@/components/outline-icons";
import { useSavePlayer } from "@/lib/hooks/mutations/use-save-player";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {useToast} from "@/lib/hooks/use-toast";

interface Props {
    player: PlayerType;
}

export function Player({ player }: Props) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const toast = useToast();
    // Lokaler State, um zu tracken, ob Spieler bereits hinzugefügt wurde
    const [isSaved, setIsSaved] = useState(!!player._id);

    const {
        mutate: savePlayer,
        isError,
        error,
        isPending: isSaving,
    } = useSavePlayer({
        onSuccess: (savedPlayer) => {
            setIsSaved(true);
            queryClient.refetchQueries({ queryKey: ["players"] });
            toast.success(`${savedPlayer.name} saved successfully!`);
        },
        onError: () => {
            toast.error("Faield to save player!");
        },
    });


    function handleAddToFavorites() {
        if (isSaved) {
            toast.info("Player already added to favorites!");
            queryClient.invalidateQueries({ queryKey: ["players"] });
            return;
        }
        savePlayer({ player });
    }

    if (isError) {
        throw error;
    }

    function toProfile() {
        router.push("/players/" + player._id);
    }

    return (
        <div className="bg-white flex items-center space-x-4 p-3 shadow-sm rounded-md">
            <Image
                src={player.image}
                alt={player.name}
                width={96}
                height={96}
                className="w-24 h-24 rounded-full object-cover"
            />

            <div className="flex flex-col space-y-1 flex-1">
                <h3 className="text-lg font-semibold text-gray-800">
                    {player.name}
                    <span className="text-sm text-gray-500 ml-2">#{player.number}</span>
                </h3>
                <p className="text-sm text-gray-600">{player.fullName}</p>
                <p className="text-sm text-gray-600">
                    {player.country}
                    {player.currentClub ? ` • ${player.currentClub}` : ""}
                </p>
                <p className="text-sm text-gray-500">{player.age} years old</p>
            </div>

            <div className="flex flex-col space-y-2 items-end">
                {!!player._id ? (
                    <button
                        onClick={toProfile}
                        title="Show profile"
                        className="flex items-center gap-2 p-2 rounded-full
              hover:bg-cyan-100 hover:text-cyan-600
              transition cursor-pointer disabled:opacity-50"
                    >
                        <OutlineIcons.EyeIcon className="w-5 h-5 stroke-cyan-500 group-hover:fill-cyan-500" />
                        <span className="text-sm text-cyan-600">Show profile</span>
                    </button>
                ) : (
                    <button
                        onClick={handleAddToFavorites}
                        disabled={isSaving}
                        title="Add to player list"
                        className="flex items-center gap-2 p-2 rounded-full
              hover:bg-cyan-100 hover:text-cyan-600
              transition cursor-pointer disabled:opacity-50"
                    >
                        <OutlineIcons.HeartIcon className="w-5 h-5 stroke-cyan-500 group-hover:fill-cyan-500" />
                        <span className="text-sm text-cyan-600">Add to player list</span>
                    </button>
                )}
            </div>
        </div>
    );
}
