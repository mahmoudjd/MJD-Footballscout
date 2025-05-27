import "./SearchField.css";
import Player from "./Player";
import { useState, type KeyboardEvent, type ChangeEvent, useEffect } from "react";
import { Link } from "react-router-dom";
import type { PlayerType } from "../../data/Types";
import { convert } from "../../convert";
import { searchPlayers, fetchPlayers } from "../../apiService";

interface Props {
  players: Array<PlayerType>;
  setPlayers: React.Dispatch<React.SetStateAction<PlayerType[]>>;
}

function SearchField({ players, setPlayers }: Props) {
  const [name, setName] = useState<string>("");
  const [isLoading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<Array<PlayerType>>([]);

  useEffect(() => {
    setName("");
    setResults([]);
  }, []);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    console.log(e.target.value?.toString().trim());
    setName(convert(e.target.value.trim()));
    const foundPlayers = players.filter((player) => {
          const convertedSearch = convert(name).toLowerCase().trim();
          return (
              convert(player?.name).toLowerCase().includes(convertedSearch) ||
              convert(player?.fullName).toLowerCase().includes(convertedSearch)
          );
    });
    if (foundPlayers.length > 0) {
      setResults(foundPlayers);
    } else {
      setResults([]);
    }
  }

  const handlePress = async (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      await handleClick();
    }
  };
  const handleClick = async () => {
    if (name.trim().length < 3) {
      alert("not correct name!");
      return;
    }
    try {
      setLoading(true);
      setResults(await searchPlayers(name));
      setPlayers(await fetchPlayers());
    } catch (error) {
      console.error("Error searching for player:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-content">
      <div className="search">
        <input
          type="search"
          className="searchField"
          onChange={handleChange}
          onKeyDown={handlePress}
          placeholder="Enter name of player..."
        />
        <button className="btn-search" onClick={handleClick}>
          search
        </button>
      </div>

      {isLoading && <div className="loader"></div>}
      {results.length > 0 && (
        <div className="results">
          {results.map((player, index) => (
            <Link
              key={index}
              className="list-item"
              to={`/profiles/${player._id}`}
            >
              <Player player={player} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchField;
