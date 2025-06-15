import Link from "next/link";
import { ImageBackground } from "@/components/image-background";

export default function HomePage() {
    return (
        <ImageBackground>
            <div className="flex flex-col items-center justify-center min-h-screen bg-black/60 px-4 text-center">
                <div className="max-w-3xl">
                    <h2 className="text-3xl md:text-5xl font-bold text-white">
                        Welcome to
                        <span className="text-cyan-400"> MJD-FootballScout</span>
                    </h2>
                    <p className="mt-4 text-lg text-gray-300">
                        Discover and explore talented football players
                    </p>
                </div>

                <ul className="mt-10 flex flex-col items-center space-y-4">
                    <li>
                        <Link
                            href="/players"
                            className="block w-64 text-center px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl transition"
                        >
                            Show all players
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/search"
                            className="block w-64 text-center px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl transition"
                        >
                            Search for players
                        </Link>
                    </li>
                </ul>

            </div>
        </ImageBackground>
    );
}
