"use server"
import {fetchPlayers} from "@/lib/hooks/queries/get-players"
import PlayersList from "@/components/players/players-list";

export default async function PlayersPage() {
    const players = await fetchPlayers()

    return <PlayersList players={players}/>;
}

