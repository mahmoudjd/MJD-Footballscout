import RowItem from "./RowItem";
import PlayerType from "@/lib/types/type";

interface Props {
    players: Array<PlayerType>;
    handleDeleteAndUpdate: (id: string) => void;
}

const TableOfPlayers = ({players, handleDeleteAndUpdate}: Props) => {
    return (
        <div className="overflow-x-auto shadow-sm">
            <table className="min-w-full bg-white">
                <thead>
                <tr className="bg-gray-100 text-gray-800 text-base border-l-4 border-l-gray-400 border-y border-y-gray-400">
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left hidden sm:table-cell ">Age</th>
                    <th className="px-4 py-3 text-left hidden sm:table-cell">Position</th>
                    <th className="px-4 py-3 text-center">Delete</th>
                </tr>
                </thead>
                <tbody>
                {players.map((player, index) => (
                    <RowItem
                        key={index}
                        player={player}
                        index={index}
                        handleDelete={handleDeleteAndUpdate}
                    />
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default TableOfPlayers;
