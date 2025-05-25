import { NavLink } from "react-router-dom";
import { IoHomeOutline, IoSearch } from "react-icons/io5";
import { TfiGallery } from "react-icons/tfi";
import { GiBabyfootPlayers } from "react-icons/gi";
import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeProvider";
import { CiSun } from "react-icons/ci";
import { MdModeNight } from "react-icons/md";

interface Props {
  open: boolean;
  setOpen: (value: boolean) => void;
}

const NavBar = ({ open, setOpen }: Props) => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  const handleClick = () => setOpen(false); // jedes Element schließt Menü

  return (
      <nav className={`navbar ${open ? "open" : ""}`}>
        <ul>
          <NavLink className="link" to="/" onClick={handleClick}>
            <IoHomeOutline />
            <p style={{ fontSize: "0.8rem" }}>Home</p>
          </NavLink>
          <NavLink className="link" to="/players" onClick={handleClick}>
            <GiBabyfootPlayers />
            <p style={{ fontSize: "0.8rem" }}>Players</p>
          </NavLink>
          <NavLink className="link" to="/gallery" onClick={handleClick}>
            <TfiGallery />
            <p style={{ fontSize: "0.8rem" }}>Cards</p>
          </NavLink>
          <NavLink className="link" to="/search" onClick={handleClick}>
            <IoSearch />
            <p style={{ fontSize: "0.8rem" }}>Search</p>
          </NavLink>
          <li className="link" style={{ cursor: "pointer" }} onClick={() => {
            toggleTheme();
            setOpen(false);
          }}>
            {theme === "dark" ? <CiSun /> : <MdModeNight />}
            <p style={{ fontSize: "0.8rem" }}>
              {theme === "dark" ? "Light" : "Dark"}
            </p>
          </li>
        </ul>
      </nav>
  );
};

export default NavBar;
