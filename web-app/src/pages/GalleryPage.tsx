import { useEffect, useState } from "react";
import { fetchPlayers } from "../apiService";
import Gallery from "../components/gallery/Gallery";
import { PlayerType } from "../data/Types";

export default function GalleryPage() {
  const [players, setPlayers] = useState<PlayerType[]>([]);

  useEffect(() => {
    fetchPlayers()
      .then((data) => setPlayers(data))
      .catch((error) => console.error(error));
  }, [setPlayers]);

  return <Gallery players={players} />;
}
