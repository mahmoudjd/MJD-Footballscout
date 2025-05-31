import React from "react";
import {FaTrash} from "react-icons/fa";
import { useNavigate} from "react-router-dom";
import type {PlayerType} from "../../data/Types";

type RowData = {
    player: PlayerType;
    index: number;
    handleDelete: (id: string) => void;
};

const RowItem = ({player, index, handleDelete}: RowData) => {
    const navigate = useNavigate()
    const navigateToProfile = (id: string) => {
        navigate(`/profiles/${id}`)
    }
    return (
        <tr className={`${getPlayerPositionClass(player.position)}`} key={index}
            onClick={() => navigateToProfile(player._id)}>
            <td>
                <div className="player-info">
                    <div className="player-number">{player.number}</div>
                    <img
                        src={player.image}
                        alt={player.name}
                        className="player-avatar"
                    />
                    <div>
                        <p className="player-name">{player.title}</p>
                        <p className="player-country">{player.country}</p>
                        <p className="player-country">{player.currentClub}</p>
                    </div>
                </div>
            </td>
            <td>{player.age}</td>
            <td>{getPosition(player.position)}</td>
            <td>
        <span
            className="trash"
            onClick={async (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
                e.stopPropagation();
                handleDelete(player._id);
            }}
        >
          <FaTrash/>
        </span>
            </td>
        </tr>
    );
};

export default RowItem;

// helper-function to get the Position
const getPosition = (position: string) => {
    if (!position) {
        return "";
    }
    return position.includes("Forward")
        ? "Forward"
        : position.includes("Defender")
            ? "Defender"
            : position.includes("Midfielder")
                ? "Midfielder"
                : position.includes("Goalkeeper")
                    ? "Goalkeeper"
                    : "manager";
};

// Helper-Function to set CSS-Klassen by position
const getPlayerPositionClass = (position: string) => {
    if (!position) {
        return "";
    }
    if (position.includes("Forward")) {
        return "pga";
    } else if (position.includes("Midfielder")) {
        return "mlb";
    } else if (position.includes("Defender")) {
        return "nfl";
    } else {
        return "nhl";
    }
};
