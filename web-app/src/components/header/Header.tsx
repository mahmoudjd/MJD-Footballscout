import NavBar from "./NavBar";
import { NavLink } from "react-router-dom";
import logo from "../../assets/mjd-logo.png";
import "./Header.css";

const Header = () => {
  return (
    <div className="header">
      <div className="logo">
        <NavLink to="/" className="link">
          <img src={logo} className="logo-img" alt="logo" />
          {/*
          <p>MJD-FootballScout</p>
            */}
        </NavLink>
      </div>
      <NavBar />
    </div>
  );
};

export default Header;
