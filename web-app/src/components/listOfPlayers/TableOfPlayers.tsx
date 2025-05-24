import type {PlayerType} from "../../data/Types";
import RowItem from "./RowItem";

interface Props {
  players: Array<PlayerType>;
  handleDeleteAndUpdate: (id: string) => void;
}

const TableOfPlayers = ({ players, handleDeleteAndUpdate }: Props) => {
  return (
    <table className="players-table">
      <thead>
        <tr>
          <th data-priority="1">Name</th>
          <th>Age</th>
          <th>Position</th>
          <th>Delete</th>
        </tr>
      </thead>

      <tbody>
        {players.map((player: PlayerType, index: number) => (
          <RowItem
            key={index}
            player={player}
            index={index}
            handleDelete={handleDeleteAndUpdate}
          />
        ))}
      </tbody>
    </table>
  );
};

export default TableOfPlayers;
