import { Link } from "react-router-dom";
import { useState, useEffect, type ChangeEvent } from "react";
import { FaArrowRightToBracket } from "react-icons/fa6";
import type {PlayerType} from "../../data/Types";
import Filter from "./Filter";
import "./Gallery.css";

interface Props {
  players: Array<PlayerType>;
}

const Gallery = ({ players }: Props) => {
  const [nation, setNation] = useState<string>("");
  const [ageGroup, setAgeGroup] = useState<string>("");
  const [filteredPlayers, setFilteredPlayers] = useState<Array<PlayerType>>([]);
  const [countries, setCountries] = useState<string[]>([]);

  useEffect(() => {
    const uniqueCountriesSet = new Set<string>();
    players.forEach((player) => {
      if (player.country) {
        uniqueCountriesSet.add(player.country);
      }
    });
    // Convert the Set to an array and sort it
    const uniqueCountries = Array.from(uniqueCountriesSet).sort((a, b) =>
      a.localeCompare(b),
    );

    setCountries(uniqueCountries);
    setFilteredPlayers(players);
  }, [players]);

  const handleNationChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setNation(e.target.value.trim());
  };

  const handleAgeGroupChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setAgeGroup(e.target.value);
  };

  const handleClickFilter = () => {
    let filtered = players.filter((player) =>
      player.country.toLowerCase().includes(nation.toLowerCase().trim()),
    );

    filtered = filtered.filter((player) => {
      if (ageGroup === "10-20") {
        return player.age >= 10 && player.age <= 20;
      } else if (ageGroup === "20-30") {
        return player.age >= 20 && player.age <= 30;
      } else if (ageGroup === "30-40") {
        return player.age >= 30 && player.age <= 40;
      } else if (ageGroup === ">40") {
        return player.age >= 40;
      } else {
        return true;
      }
    });
    setFilteredPlayers(filtered);
  };

  return (
    <>
      <Filter
        countries={countries}
        handleChange1={handleNationChange}
        handleChange2={handleAgeGroupChange}
        applyFilter={handleClickFilter}
      />
      <div className="gallery">
        {filteredPlayers.map((player, index) => (
          <div key={index} className="gallery-item">
            <figure className="image-frame">
              <img
                src={player.image}
                alt={player.name}
                className="player-image"
              />
            </figure>
            <div className="player-details">
              <h3 className="player-name">
                {player.name}
                <p className="player-description">{player.age} years</p>
              </h3>
              <Link to={`/profiles/${player._id}`} className="link-photo">
                <p>to profile</p> <FaArrowRightToBracket className="icon" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Gallery;
