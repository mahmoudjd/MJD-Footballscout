import { useState, useEffect } from "react";
import SearchField from "../components/search/SearchField";
import { PlayerType } from "../data/Types";
import { fetchPlayers } from "../apiService";

const SearchPage = () => {
  const [players, setPlayers] = useState<PlayerType[]>([]);

  useEffect(() => {
    fetchPlayers()
      .then((data) => setPlayers(data))
      .catch((error) => console.error(error));
  }, []);

  return <SearchField players={players} setPlayers={setPlayers} />;
};

export default SearchPage;
