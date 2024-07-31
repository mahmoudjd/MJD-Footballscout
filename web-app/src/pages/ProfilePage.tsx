import { useParams } from "react-router-dom";
import Profile from "../components/profile/Profile";
import { PlayerType } from "../data/Types";
import { useEffect, useState } from "react";
import { getPlayer } from "../apiService";

const ProfilePage = () => {
  const { id } = useParams();
  const [player, setPlayer] = useState<PlayerType>();

  useEffect(() => {
    getPlayer(`${id}`)
      .then((data) => setPlayer(data))
      .catch((error) => console.error(error));
  }, [id]);

  return player ? <Profile person={player} /> : null;
};

export default ProfilePage;
