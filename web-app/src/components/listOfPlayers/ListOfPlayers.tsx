import { useEffect, useState } from "react";
import ColorsOfPositions from "./ColorOfPosition";
import Pagination from "./Pagination";
import "./ListOfPlayers.css";
import TableOfPlayers from "./TableOfPlayers";
import { PlayerType } from "../../data/Types";
import { deletePlayer } from "../../apiService";

interface Props {
  players: Array<PlayerType>;
}

const ListOfPlayers = ({ players }: Props) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filteredPlayers, setFilteredPlayers] = useState<Array<PlayerType>>([]);

  useEffect(() => {
    setFilteredPlayers(players);
  }, [players]);

  const elemsPerPage = 10;
  const idxOfLast = currentPage * elemsPerPage;
  const idxOfFirst = idxOfLast - elemsPerPage;
  const totalPages = Math.ceil(filteredPlayers.length / elemsPerPage);
  const currentPlayers = filteredPlayers.slice(idxOfFirst, idxOfLast);

  async function handleDeleteAndUpdate(id: string) {
    try {
      await deletePlayer(id);
      const updatedFilteredPlayers = filteredPlayers.filter(
        (player) => player._id !== id,
      );
      const index = players.findIndex((player) => player._id === id);
      if (index !== -1) {
        players.splice(index, 1);
      }
      setFilteredPlayers(updatedFilteredPlayers);
      if (currentPlayers.length === 1) setCurrentPage(currentPage - 1);
    } catch (error) {
      console.error(error);
    }
  }

  const renderPlayersOfPage = (page: number) => {
    setCurrentPage(page);
  };

  const filterByPosition = (position: string) => {
    const filtered = players.filter((player) =>
      player.position.includes(position),
    );
    setFilteredPlayers(filtered);
    setCurrentPage(1);
  };

  return (
    <div className="players">
      <div className="table-mgmt">
        <h1 className="title">All Players</h1>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          renderElementsOfPage={renderPlayersOfPage}
        />
      </div>
      <ColorsOfPositions filterByPosition={filterByPosition} />

      <TableOfPlayers
        players={currentPlayers}
        handleDeleteAndUpdate={handleDeleteAndUpdate}
      />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        renderElementsOfPage={renderPlayersOfPage}
      />
    </div>
  );
};

export default ListOfPlayers;
