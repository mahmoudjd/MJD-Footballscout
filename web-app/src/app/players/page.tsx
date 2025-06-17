"use client";

import { useEffect, useState } from "react";
import { fetchPlayers } from "@/lib/hooks/queries/get-players";
import PlayersList from "@/components/players/players-list";
import {Loader} from "@/components/loader";
import PlayerType from "@/lib/types/type";

export default function PlayersPage() {
    const [players, setPlayers] = useState<PlayerType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchPlayers().then(data => {
            setPlayers(data);
            setIsLoading(false);
        });
    }, []);

    if (isLoading) {
        return <Loader />;
    }

    return <PlayersList players={players} />;
}
