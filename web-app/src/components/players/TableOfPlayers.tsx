import {memo} from "react";
import RowItem from "./RowItem";
import {PlayerType} from "@/lib/types/type";

interface TableOfPlayersProps {
    players: Array<PlayerType>;
    handleDeleteAndUpdate: (id: string) => void;
}

const TableOfPlayers = memo(({players, handleDeleteAndUpdate}: TableOfPlayersProps) => {
    if (players.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500">
                No players found matching your criteria.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto shadow-sm">
            <table className="min-w-full bg-white" aria-label="Players table">
                <thead>
                <tr className="bg-gray-100 text-gray-800 text-base border-l-4 border-l-gray-400 border-y border-y-gray-400">
                    <th scope="col" className="px-4 py-3 text-left">Name</th>
                    <th scope="col" className="px-4 py-3 text-left hidden sm:table-cell">Age</th>
                    <th scope="col" className="px-4 py-3 text-left hidden sm:table-cell">Position</th>
                    <th scope="col" className="px-4 py-3 text-center">Actions</th>
                </tr>
                </thead>
                <tbody>
                {players.map((player) => (
                    <RowItem
                        key={player._id}
                        player={player}
                        handleDelete={handleDeleteAndUpdate}
                    />
                ))}
                </tbody>
            </table>
        </div>
    );
});

TableOfPlayers.displayName = 'TableOfPlayers';

export default TableOfPlayers;
