import { FaSearch } from "react-icons/fa";
import { useState, useLayoutEffect, useMemo } from "react";
import { TfiGallery } from "react-icons/tfi";
import { GiBabyfootPlayers } from "react-icons/gi";
import { Link } from "react-router-dom";
import "./Home.css";

import img0 from "./../assets/fotos/0.jpg";
import img1 from "./../assets/fotos/1.jpg";
import img2 from "./../assets/fotos/6.jpeg";
import img3 from "./../assets/fotos/3.jpg";
import img4 from "./../assets/fotos/4.jpg";
import img5 from "./../assets/fotos/5.jpg";
import img6 from "./../assets/fotos/6.jpg";
import img7 from "./../assets/fotos/7.jpg";

const Home = () => {
  // Array mit den Bild-Dateinamen
  const images = useMemo(
    () => [img0, img1, img2, img3, img4, img5, img6, img7],
    [],
  );
  // Zustand für das aktuelle Bild
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useLayoutEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 15000);

    return () => clearInterval(interval);
  }, [images]);

  const imageUrl = `${images[currentImageIndex]}`;

  return (
    <div
      className="background-image"
      style={{
        height: "100%",
        backgroundImage: `url(${imageUrl})`,
        width: "auto",
        objectFit: "contain",
        backgroundPosition: "center",
        backgroundSize: "cover",
        transition: "all 0.3s ease",
      }}
    >
      <div className="main">
        <div>
          <div className="heading-home">
            <h2 style={{ color: "#fff" }}>
              Welcome to
              <span className="mjd-name"> MJD-FootballScout</span>
            </h2>
            <p className="descreption-home" style={{ color: "#ddd" }}>
              Discover and explore talented football players
            </p>
          </div>
        </div>
        <div className="btn-list">
          <ul className="list-home">
            <li className="btn-home">
              <Link className="link-home" to="/players">
                <GiBabyfootPlayers className="icon-home" />
                <span>Show all players</span>
              </Link>
            </li>
            <li className="btn-home">
              <Link className="link-home" to="/gallery">
                <TfiGallery className="icon-home" />
                <span>Cards of players</span>
              </Link>
            </li>
            <li className="btn-home">
              <Link className="link-home" to="/search">
                <FaSearch className="icon-home" />
                <span>Search for players</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Home;
