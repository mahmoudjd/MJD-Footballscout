import { useContext, useState } from "react";
import type { PlayerType } from "../../data/Types";
import "./Profile.css";
import ProfileHeader from "./profileComponents/ProfileHeader";
import ProfileInfo from "./profileComponents/ProfileInfo";
import Transfers from "./profileComponents/Transfers";
import Titles from "./profileComponents/Titles";
import Awards from "./profileComponents/Awards";
import { ThemeContext } from "../../context/ThemeProvider";
import { updatePlayer } from "../../apiService";
import Attributes from "./profileComponents/Attributes";

interface Props {
  person: PlayerType;
}

const Profile = ({ person }: Props) => {
  const [player, setPlayer] = useState<PlayerType>(person);
  const [loading, setLoading] = useState<boolean>(false);
  const { theme } = useContext(ThemeContext);

  async function handleClick() {
    try {
      setLoading(true);
      setPlayer(await updatePlayer(player._id));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }
  const lastUpdated = new Date(player.timestamp).toLocaleString();

  return loading ? (
    <div className="loader"></div>
  ) : (
    <div className="profile-page">
      <ProfileHeader
        name={player.name}
        title={player.title}
        number={player.number}
        image={player.image}
        position={player.position}
      />

      <div className="datum-container">
        <p
          style={{
            fontSize: 12,
            color: theme === "dark" ? "#ccc" : "#666",
            paddingLeft: 5,
          }}
        >
          Data last updated:{lastUpdated}{" "}
          <span
            className="update-cilck"
            style={{
              color: "#008fb3",
              cursor: "pointer",
              textDecoration: "underline",
            }}
            onClick={handleClick}
          >
            update
          </span>
        </p>
      </div>
      <hr />
      <ProfileInfo player={player} />
      <hr />
      {player.transfers.length > 0 && (
        <>
          <Transfers transfers={player.transfers} />
          <hr />
        </>
      )}

      {player.playerAttributes.length > 0 && (
        <>
          <Attributes attributes={player.playerAttributes} />
          <hr />
        </>
      )}

      {player.titles.length > 0 && (
        <>
          <Titles titles={player.titles} />
          <hr />
        </>
      )}

      {player.awards.length > 0 && <Awards awards={player.awards} />}
    </div>
  );
};

export default Profile;
