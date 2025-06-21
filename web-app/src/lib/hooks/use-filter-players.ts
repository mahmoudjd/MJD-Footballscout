import {PlayerType} from "@/lib/types/type";
import { useEffect, useMemo, useState } from "react";

export function useFilterPlayers(
    players: PlayerType[],
    setCurrentPage: (value: number | ((prev: number) => number)) => void
) {
    const [selectedPosition, setSelectedPosition] = useState("");
    const [selectedAgeGroup, setSelectedAgeGroup] = useState("");
    const [selectedNationality, setSelectedNationality] = useState("");

    const filteredPlayers = useMemo(() => {
        return players.filter((player) => {
            const matchPosition = selectedPosition
                ? player.position.includes(selectedPosition)
                : true;

            const matchAgeGroup = (() => {
                const age = player.age;
                switch (selectedAgeGroup) {
                    case "<20":
                        return age < 20;
                    case "20-30":
                        return age >= 20 && age <= 30;
                    case "30-40":
                        return age > 30 && age <= 40;
                    case ">40":
                        return age > 40;
                    default:
                        return true;
                }
            })();

            const matchNationality = selectedNationality
                ? player.country.toLowerCase() === selectedNationality.toLowerCase()
                : true;

            return matchPosition && matchAgeGroup && matchNationality;
        });
    }, [players, selectedPosition, selectedAgeGroup, selectedNationality]);

    // Reset Page on Filter Change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedPosition, selectedAgeGroup, selectedNationality, setCurrentPage]);

    return {
        filteredPlayers,
        selectedPosition,
        setSelectedPosition,
        selectedAgeGroup,
        setSelectedAgeGroup,
        selectedNationality,
        setSelectedNationality
    };
}
