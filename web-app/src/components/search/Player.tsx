import { memo } from "react";
import { PlayerType } from "../../data/Types";
import "./Player.css";
interface Props {
  player: PlayerType;
}
const Player = memo(function Player({ player }: Props) {
  return (
    <li className="row-search">
      <img src={player.image} alt={player.name} />
      <div className="infos">
        <div>
          {player.name} <span className="number">{player.number}</span>
        </div>
        <div>{player.fullName}</div>
        <div>{player.country}</div>
        <div>{player.currentClub}</div>
        <div>{player.age} years</div>
      </div>
    </li>
  );
});

export default Player;
