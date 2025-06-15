import {getPlayer} from "@/lib/hooks/queries/get-player";
import Profile from "@/components/profile/Profile";

interface ProfileProps {
    params: Promise<{ playerId: string }>
}

export default async function ProfilePage({params}: ProfileProps) {
    const { playerId } = await params
    const player = await getPlayer(playerId);

    return player ? (
        <Profile person={player}/>
    ) : (
        <p className="text-center p-8 text-gray-500">Player not found.</p>
    );
}
