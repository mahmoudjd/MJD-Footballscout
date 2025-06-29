import Link from "next/link";
import { signIn, signOut } from "next-auth/react";

interface NavbarProps {
    status: string;
    open: boolean;
    setOpen: (value: boolean) => void;
}

export function Navbar({ status, open, setOpen }: NavbarProps) {
    return (
        <nav
            className={`sm:hidden fixed top-0 left-0 h-full w-64 bg-gradient-to-r from-cyan-800 to-cyan-600 text-white z-40 shadow-lg transition-transform duration-300 ease-in-out ${
                open ? "translate-x-0" : "-translate-x-full"
            } rounded-r-md flex flex-col justify-between`}
            aria-hidden={!open}
        >
            {/* Navigation Links */}
            <ul className="flex flex-col mt-24 space-y-6 pl-8 text-lg font-semibold">
                <Link href="/" prefetch={false} onClick={() => setOpen(false)} className="hover:text-cyan-300 transition">
                    Home
                </Link>
                <Link href="/players" prefetch={false} onClick={() => setOpen(false)} className="hover:text-cyan-300 transition">
                    Players
                </Link>
                <Link href="/search" prefetch={false} onClick={() => setOpen(false)} className="hover:text-cyan-300 transition">
                    Search
                </Link>
            </ul>

            <div className="py-6 pl-8">
                {status === "authenticated" ? (
                    <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="hover:text-red-300 transition cursor-pointer text-left"
                    >
                        Logout
                    </button>
                ) : (
                    <button
                        onClick={() => signIn()}
                        className="hover:text-cyan-300 transition cursor-pointer text-left"
                    >
                        Login
                    </button>
                )}
            </div>
        </nav>
    );
}