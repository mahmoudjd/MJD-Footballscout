"use client";
import { useEffect, useMemo, useState } from "react";
import Pagination from "@/components/pagination"
import TableOfPlayers from "./TableOfPlayers";
import PlayerType from "@/lib/types/type";
import { deletePlayer } from "@/lib/hooks/mutations/delete-player";
import PlayerFilters from "@/components/players/player-filters";
import {Loader} from "@/components/loader";
import { fetchPlayers } from "@/lib/hooks/queries/get-players";

interface Props {
    players: Array<PlayerType>;
}

const PlayersList = ({ players: initialPlayers }: Props) => {
    const [players, setPlayers] = useState<PlayerType[]>(initialPlayers);
    const [currentPage, setCurrentPage] = useState(1);
    const [filteredPlayers, setFilteredPlayers] = useState<PlayerType[]>([]);
    const [elemsPerPage, setElemsPerPage] = useState(5);
    const [isLoading, setIsLoading] = useState(false);

    const [selectedPosition, setSelectedPosition] = useState("");
    const [selectedAgeGroup, setSelectedAgeGroup] = useState("");
    const [selectedNationality, setSelectedNationality] = useState("");

    // Initial setup of filteredPlayers is handled by the applyFilters useEffect

    const applyFilters = () => {
        let result = [...players];

        if (selectedPosition) {
            result = result.filter((player) =>
                player.position.includes(selectedPosition)
            );
        }

        if (selectedAgeGroup) {
            result = result.filter((player) => {
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
            });
        }

        if (selectedNationality) {
            result = result.filter(
                (player) =>
                    player.country.toLowerCase() === selectedNationality.toLowerCase()
            );
        }

        setFilteredPlayers(result);
        setCurrentPage(1);
    };

    useEffect(() => {
        applyFilters();
    }, [players, selectedPosition, selectedAgeGroup, selectedNationality]);

    const currentPlayers = useMemo(() => {
        const idxOfLast = currentPage * elemsPerPage;
        const idxOfFirst = idxOfLast - elemsPerPage;
        return filteredPlayers.slice(idxOfFirst, idxOfLast);
    }, [filteredPlayers, currentPage, elemsPerPage]);

    const totalPages = Math.ceil(filteredPlayers.length / elemsPerPage);

    const handleDeleteAndUpdate = async (id: string) => {
        const confirm = window.confirm("Are you sure you want to delete this player?");
        if (!confirm) return;

        try {
            setIsLoading(true);
            await deletePlayer(id);

            // Refresh players data from server
            const refreshedPlayers = await fetchPlayers();
            setPlayers(refreshedPlayers);

            // Update filtered players based on current filters
            // This will happen automatically via useEffect when players changes

            // Zurückblättern, wenn nur ein Eintrag auf Seite war
            if (currentPlayers.length === 1 && currentPage > 1) {
                setCurrentPage((prev) => Math.max(1, prev - 1));
            }
        } catch (error) {
            console.error("Delete error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleElemsPerPageChange = (val: number) => {
        setElemsPerPage(val);
        setCurrentPage(1);
    };

    const nationalities = useMemo(() => {
        const all = players.map((p) => p.country);
        return Array.from(new Set(all)).sort();
    }, [players]);

    return (
        <div className="flex flex-col px-6 py-4 w-full space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl text-gray-800 font-bold tracking-tight">All Players</h1>
                <p className="text-sm text-gray-500">
                    Showing {filteredPlayers.length} result{filteredPlayers.length !== 1 && "s"}
                </p>
            </div>

            {/* Filter */}
            <PlayerFilters
                selectedPosition={selectedPosition}
                selectedAgeGroup={selectedAgeGroup}
                selectedNationality={selectedNationality}
                nationalities={nationalities}
                onPositionChange={setSelectedPosition}
                onAgeGroupChange={setSelectedAgeGroup}
                onNationalityChange={setSelectedNationality}
            />

            {/* Table */}
            <div className="rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
                {isLoading ? (
                    <Loader />
                ) : (
                    <TableOfPlayers
                        players={currentPlayers}
                        handleDeleteAndUpdate={handleDeleteAndUpdate}
                    />
                )}
            </div>

            {/* Pagination + Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                <div className="flex items-center gap-3">
                    <label className="text-sm text-gray-600">Items per page:</label>
                    <select
                        className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-cyan-500"
                        value={elemsPerPage}
                        onChange={(e) => handleElemsPerPageChange(Number(e.target.value))}
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                    </select>
                </div>

                {totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        renderElementsOfPage={handlePageChange}
                    />
                )}
            </div>
        </div>
    );
};

export default PlayersList;
