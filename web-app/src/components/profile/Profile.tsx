"use client";

import {useEffect} from "react";
import {useUpdateMutation} from "@/lib/hooks/mutations/use-update-player";
import {Spinner} from "@/components/spinner";
import ProfileHeader from "@/components/profile/profile-components/ProfileHeader";
import ProfileInfo from "@/components/profile/profile-components/ProfileInfo";
import Transfers from "@/components/profile/profile-components/Transfers";
import Attributes from "@/components/profile/profile-components/attributes";
import Titles from "@/components/profile/profile-components/Titles";
import Awards from "@/components/profile/profile-components/awards";
import {OutlineIcons} from "@/components/outline-icons";
import {notFound, useRouter} from "next/navigation";
import {useQueryClient} from "@tanstack/react-query";
import {useGetPlayer} from "@/lib/hooks/queries/use-get-player";
import {ScrollToTopButton} from "@/components/scroll-to-top-button";
import {useToast} from "@/lib/hooks/use-toast";

interface Props {
    playerId: string;
}

export function Profile({playerId}: Props) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const toast = useToast()
    const {data: player, error, isError, isLoading} = useGetPlayer({playerId});

    const {mutateAsync: updatePlayerMutation, isPending: isUpdating} = useUpdateMutation({
        onSuccess: async () => {
            await queryClient.refetchQueries({queryKey: ["player", {playerId}]});
            toast.success(`${player?.name} data updated successfully!`)
        },
        onError: () => {
            toast.error("Failed to update player data!")
        },
    });
    if (isError) {
        throw error;
    }
    useEffect(() => {
        if (typeof window !== "undefined" && window.scrollY > 0) {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, []);

    async function handleClick() {
        await updatePlayerMutation({playerId});
    }

    if (isLoading || isUpdating) return <Spinner/>;
    if (!player) return notFound();

    const lastUpdated = player ? new Date(player?.timestamp).toLocaleString() : "-";

    return (
        <div className="mx-auto px-4 py-6 space-y-6 bg-white min-h-screen">
        <button
                onClick={() => router.back()}
                className="mb-4 inline-flex items-center text-sm font-medium cursor-pointer text-cyan-700 hover:text-cyan-800 transition"
            >
                <OutlineIcons.ArrowLeftIcon className="w-5 h-5 mr-1"/>
                Back
            </button>

            <ProfileHeader
                name={player.name}
                title={player.title}
                number={player.number}
                image={player.image}
                position={player.position}
            />

            <div
                className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-600 shadow-sm">
                <div className="flex items-center gap-2">
                    <OutlineIcons.ClockIcon className="w-5 h-5 text-gray-400"/>
                    <span className="text-gray-600">Last updated:</span>
                    <span className="font-medium text-gray-800">{lastUpdated}</span>
                </div>

                <button
                    onClick={handleClick}
                    disabled={isUpdating}
                    className="inline-flex items-center cursor-pointer gap-2 text-sm font-medium text-cyan-700 hover:text-cyan-800 transition disabled:opacity-50"
                >
                    <OutlineIcons.ArrowPathIcon className="w-5 h-5"/>
                    {isUpdating ? "Updating..." : "Update Data"}
                </button>
            </div>

            <hr className="border-gray-300"/>
            <ProfileInfo player={player}/>
            <hr className="border-gray-300"/>

            {player.playerAttributes?.length > 0 && (
                <>
                    <Attributes attributes={player.playerAttributes}/>
                    <hr className="border-gray-300"/>
                </>
            )}

            {player.transfers?.length > 0 && (
                <>
                    <Transfers transfers={player.transfers}/>
                    <hr className="border-gray-300"/>
                </>
            )}

            {player.titles?.length > 0 && <Titles titles={player.titles}/>}

            {player.awards?.length > 0 && (
                <>
                    <hr className="border-gray-300"/>
                    <Awards awards={player.awards}/>
                </>
            )}
            <ScrollToTopButton />
        </div>
    );
}