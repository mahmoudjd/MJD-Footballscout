"use client";
import {useEffect, useRef, useState} from "react";
import Link from "next/link";
import Image from "next/image";
import {SolidIcons} from "@/components/solid-icons";
import {Navbar} from "@/components/header/navbar"; // Bars4Icon

const Header = () => {
    const [open, setOpen] = useState(false);
    const navRef = useRef<HTMLDivElement>(null);

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
        <header className="bg-cyan-600 text-white shadow-md w-full z-50 sticky top-0">
            <div
                ref={navRef}
                className="max-w-7xl mx-auto px-6 sm:px-10 py-4 flex items-center justify-between"
            >
                {/* Logo */}
                <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-3">
                    <Image
                        src="/mjd-logo.png"
                        alt="Logo"
                        width={60}
                        height={60}
                        className="rounded-full shadow-md"
                        priority
                    />
                    <span className="font-extrabold text-xl tracking-wide select-none">
            MJD
          </span>
                </Link>

                {/* Mobile Menu Button */}
                <button
                    className="sm:hidden p-2 rounded-md hover:bg-cyan-500 transition"
                    onClick={() => setOpen((prev) => !prev)}
                    aria-label="Toggle navigation"
                    aria-expanded={open}
                >
                    <SolidIcons.Bars4Icon className="h-7 w-7 text-white"/>
                </button>

                {/* Desktop Nav */}
                <nav className="hidden sm:flex space-x-8 items-center font-medium text-lg">
                    <NavLinks onClick={() => setOpen(false)}/>
                </nav>
            </div>

            <Navbar open={open} setOpen={setOpen}/>
        </header>
    );
};

export default Header;

function NavLinks({onClick}: { onClick: () => void }) {
    return (
        <>
            <Link
                href="/"
                onClick={onClick}
                className="hover:text-cyan-300 transition"
            >
                Home
            </Link>
            <Link
                href="/players"
                onClick={onClick}
                className="hover:text-cyan-300 transition"
            >
                Players
            </Link>
            <Link
                href="/search"
                onClick={onClick}
                className="hover:text-cyan-300 transition"
            >
                Search
            </Link>
        </>
    );
}

