import { useState, useEffect } from "react";
import { fetchPlayers } from "../apiService";
import type { PlayerType } from "../data/Types";
import ListOfPlayers from "../components/listOfPlayers/ListOfPlayers";

const PlayersPage = () => {
  const [players, setPlayers] = useState<PlayerType[]>([]);

  useEffect(() => {
    fetchPlayers()
      .then((data) => setPlayers(data))
      .catch((error) => console.error(error));
  }, [setPlayers]);

  return <ListOfPlayers players={players} />;
};
export default PlayersPage;
