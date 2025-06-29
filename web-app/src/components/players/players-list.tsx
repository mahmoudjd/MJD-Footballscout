"use client";
import {useMemo, useState} from "react";
import Pagination from "@/components/pagination"
import TableOfPlayers from "./TableOfPlayers";
import {useDeletePlayer} from "@/lib/hooks/mutations/use-delete-player";
import PlayerFilters from "@/components/players/player-filters";
import {Spinner} from "@/components/spinner";
import {useGetPlayers} from "@/lib/hooks/queries/use-get-players";
import {useQueryClient} from "@tanstack/react-query";
import {useFilterPlayers} from "@/lib/hooks/use-filter-players";
import {useToast} from "@/lib/hooks/use-toast";

export default function PlayersList() {
    const queryClient = useQueryClient()
    const {data: players, isLoading, isError, error} = useGetPlayers();
    const [currentPage, setCurrentPage] = useState(1);
    const [elemsPerPage, setElemsPerPage] = useState(5);
    const toast = useToast()
    if (isError) {
        throw error
    }
    const {
        filteredPlayers,
        selectedPosition,
        setSelectedPosition,
        selectedAgeGroup,
        setSelectedAgeGroup,
        selectedNationality,
        setSelectedNationality
    } = useFilterPlayers(players ?? [], setCurrentPage);
    const {mutate: deletePlayer, error: errorDeleting, isError: isErrorDeleting, isPending: isDeleting} = useDeletePlayer({
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["players"]})
            toast.success("Player deleted successfully!")
        },
        onError: () => {
            toast.error("Failed to delete player!")
        }
    });
    const currentPlayers = useMemo(() => {
        const idxOfLast = currentPage * elemsPerPage;
        const idxOfFirst = idxOfLast - elemsPerPage;
        return filteredPlayers.slice(idxOfFirst, idxOfLast);
    }, [filteredPlayers, currentPage, elemsPerPage]);

    const totalPages = Math.ceil(filteredPlayers.length / elemsPerPage);

    const handleDeleteAndUpdate = async (playerId: string) => {
        const confirm = window.confirm("Are you sure you want to delete this player?");
        if (!confirm) return;
        deletePlayer({playerId});
        if (isErrorDeleting) {
            throw errorDeleting;
        }

        if (currentPlayers.length === 1 && currentPage > 1) {
            setCurrentPage((prev) => Math.max(1, prev - 1));
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
        const all = players?.map((p) => p.country);
        return Array.from(new Set(all)).sort();
    }, [players]);

    return (
        <div className="flex flex-col px-6 py-4 w-full space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
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
            <div className="rounded border border-gray-200 shadow-sm overflow-x-auto">
                {isDeleting || isLoading ? (
                    <Spinner/>
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
                        className="border border-gray-300 cursor-pointer rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-cyan-500"
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
