"use client"

import PlayerType from "@/lib/types/type";
import {useState} from "react";
import {updatePlayer} from "@/lib/hooks/mutations/update-player";
import {Loader} from "@/components/loader";
import ProfileHeader from "@/components/profile/profile-components/ProfileHeader";
import ProfileInfo from "@/components/profile/profile-components/ProfileInfo";
import Transfers from "@/components/profile/profile-components/Transfers";
import Attributes from "@/components/profile/profile-components/attributes";
import Titles from "@/components/profile/profile-components/Titles";
import Awards from "@/components/profile/profile-components/awards";
import {OutlineIcons} from "@/components/outline-icons";

interface Props {
    person: PlayerType;
}

const Profile = ({person}: Props) => {
    const [player, setPlayer] = useState<PlayerType>(person);
    const [loading, setLoading] = useState<boolean>(false);

    async function handleClick() {
        try {
            setLoading(true);
            const updated = await updatePlayer(player._id);
            setPlayer(updated);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const lastUpdated = new Date(player.timestamp).toLocaleString();
    if (loading) return <Loader/>;

    return (
        <div className="mx-auto px-4 py-6 space-y-6 bg-white">
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
                    className="inline-flex items-center cursor-pointer gap-2 text-sm font-medium text-cyan-700 hover:text-cyan-800 transition"
                >
                    <OutlineIcons.ArrowPathIcon className="w-5 h-5"/>
                    Update Data
                </button>
            </div>

            <hr className="border-gray-300"/>
            <ProfileInfo player={player}/>
            <hr className="border-gray-300"/>

            {player.playerAttributes.length > 0 && (<>
                <Attributes attributes={player.playerAttributes}/>
                <hr className="border-gray-300"/>
            </>)}

            {player.transfers.length > 0 && (<>
                <Transfers transfers={player.transfers}/>
                <hr className="border-gray-300"/>
            </>)}


            {player.titles.length > 0 && (
                <Titles titles={player.titles}/>
            )}

            {player.awards.length > 0 && (<>
                    <hr className="border-gray-300"/>
                    <Awards awards={player.awards}/>
                </>
            )}
        </div>
    );
};

export default Profile;
