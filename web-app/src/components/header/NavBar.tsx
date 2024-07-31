import { NavLink } from "react-router-dom";
import { IoHomeOutline, IoSearch } from "react-icons/io5";
import { TfiGallery } from "react-icons/tfi";
import { GiBabyfootPlayers } from "react-icons/gi";
import { useContext, useRef } from "react";
import { ThemeContext } from "../../context/ThemeProvider";
import { CiSun } from "react-icons/ci";
import { MdModeNight } from "react-icons/md";

const NavBar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  useRef<string>(theme);
  return (
    <nav className="navbar">
      <ul>
        <NavLink className="link" to="/">
          <IoHomeOutline />
          <p style={{ fontSize: "0.8rem" }}>Home </p>
        </NavLink>
        <NavLink className="link" to="/players">
          <GiBabyfootPlayers className="icon-home" />
          <p style={{ fontSize: "0.8rem" }}>Players </p>
        </NavLink>
        <NavLink className="link" to="/gallery">
          <TfiGallery />
          <p style={{ fontSize: "0.8rem" }}>Cards </p>
        </NavLink>
        <NavLink className="link" to="/search">
          <IoSearch />
          <p style={{ fontSize: "0.8rem" }}>search </p>
        </NavLink>
        <li
          style={{ cursor: "pointer" }}
          className="link"
          onClick={toggleTheme}
        >
          {theme === "dark" ? <CiSun /> : <MdModeNight />}
          <p style={{ fontSize: "0.8rem" }}>
            {theme === "dark" ? "light" : "dark"}
          </p>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
