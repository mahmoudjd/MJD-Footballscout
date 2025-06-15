"use client";

import { useState, useEffect, useCallback } from "react";
import PlayerType from "@/lib/types/type";
import { convert } from "@/lib/convert";
import { searchPlayers } from "@/lib/hooks/mutations/search-player";
import Link from "next/link";
import { Loader } from "@/components/loader";
import {Player} from "@/components/search/Player";

interface Props {
    players: PlayerType[];
}

export function SearchField({ players }: Props) {
    const [name, setName] = useState("");
    const [debouncedName, setDebouncedName] = useState("");
    const [isLoading, setLoading] = useState(false);
    const [results, setResults] = useState<PlayerType[]>([]);

    // Reset bei neuem Aufruf
    useEffect(() => {
        setName("");
        setResults([]);
    }, []);

    // Debounce für lokale Suche
    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedName(name);
        }, 300); // 300ms debounce

        return () => clearTimeout(timeout);
    }, [name]);

    // Lokale Suche
    useEffect(() => {
        if (debouncedName.length === 0) {
            setResults([]);
            return;
        }

        const searchTerm = convert(debouncedName).toLowerCase().trim();
        const filtered = players.filter((player) =>
            [player.name, player.fullName]
                .map((p) => convert(p).toLowerCase())
                .some((p) => p.includes(searchTerm))
        );
        setResults(filtered);
    }, [debouncedName, players]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    };

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            await handleSearch();
        }
    };

    const handleSearch = useCallback(async () => {
        const query = convert(name.trim());

        if (query.length < 3) {
            alert("Please enter at least 3 characters.");
            return;
        }

        try {
            setLoading(true);
            const serverResults = await searchPlayers(query);
            setResults(serverResults);
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setLoading(false);
        }
    }, [name]);

    return (
        <div className="w-full max-w-3xl mx-auto flex flex-col p-6">
            <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-2">
                <input
                    type="search"
                    className="w-full h-12 px-4 py-2 rounded-xl border border-cyan-600 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    value={name}
                    placeholder="Enter player name..."
                />
                <button
                    className="w-full sm:w-40 h-12 px-4 py-2 rounded-xl bg-cyan-600 text-white font-semibold hover:bg-cyan-500 transition"
                    onClick={handleSearch}
                >
                    Search
                </button>
            </div>

            {isLoading && <Loader />}

            {results.length > 0 && (
                <div className="mt-6 flex flex-col divide-y divide-gray-200">
                    {results.map((player) => (
                        <Link
                            key={player._id}
                            href={`/players/${player._id}`}
                            className="transition"
                        >
                            <Player player={player} />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
