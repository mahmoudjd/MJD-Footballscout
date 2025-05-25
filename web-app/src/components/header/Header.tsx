import { useEffect, useRef, useState } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import NavBar from "./NavBar";
import { NavLink } from "react-router-dom";
import logo from "../../assets/mjd-logo.png";
import "./Header.css";

const Header = () => {
    const [open, setOpen] = useState(false);
    const navRef = useRef<HTMLDivElement>(null);

    // Schließen beim Klick außerhalb
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (navRef.current && !navRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="header" ref={navRef}>
            <div className="logo">
                <NavLink to="/" className="link" onClick={() => setOpen(false)}>
                    <img src={logo} className="logo-img" alt="logo" />
                </NavLink>
            </div>

            <button className="hamburger" onClick={() => setOpen(!open)}>
                <GiHamburgerMenu size={25} color="var(--btn-color)" />
            </button>

            <NavBar open={open} setOpen={setOpen} />
        </div>
    );
};

export default Header;
