import {Profile} from "@/components/profile/Profile";
import {notFound} from "next/navigation";

interface ProfileProps {
    params: Promise<{ playerId: string }>
}

export default async function ProfilePage({params}: ProfileProps) {
    const {playerId} = await params
    if (!playerId) {
        return notFound();
    }
    return <Profile playerId={playerId}/>
}
