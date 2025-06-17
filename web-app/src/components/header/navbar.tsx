import Link from "next/link";


interface NavbarProps {
    open: boolean;
    setOpen: (value: boolean) => void;
}

export function Navbar({open, setOpen}: NavbarProps) {
    return (
        <nav
            className={`sm:hidden fixed top-0 left-0 h-full w-64 bg-gradient-to-r from-cyan-800 to-cyan-600 text-white z-40 shadow-lg transition-transform duration-300 ease-in-out ${
                open ? "translate-x-0" : "-translate-x-full"
            } rounded-r-lg`}
            aria-hidden={!open}
        >
            <ul className="flex flex-col mt-24 space-y-6 pl-8 text-lg font-semibold">
                <Link href="/" onClick={() => setOpen(false)} className="hover:text-cyan-300 transition">
                    Home
                </Link>
                <Link href="/players" onClick={() => setOpen(false)} className="hover:text-cyan-300 transition">
                    Players
                </Link>
                <Link href="/search" onClick={() => setOpen(false)} className="hover:text-cyan-300 transition">
                    Search
                </Link>
            </ul>
        </nav>
    );
}