"use client";

import {useState, useCallback, useMemo} from "react";
import {convert} from "@/lib/convert";
import {useGetPlayers} from "@/lib/hooks/queries/use-get-players";
import {useSearchPlayers} from "@/lib/hooks/mutations/use-search-players";
import {useDebounce} from "@/lib/hooks/use-debounce";
import {PlayerType} from "@/lib/types/type";
import {Spinner} from "@/components/spinner";
import {SearchResultsList} from "@/components/search/search-results-list";
import {useQueryClient} from "@tanstack/react-query";

export function SearchField() {
    const {data: players, error, isError} = useGetPlayers();
    const [name, setName] = useState("");
    const [showServerResults, setShowServerResults] = useState(false);
    const queryClient = useQueryClient();
    const debouncedName = useDebounce(convert(name.trim()), 300);

    if (isError) {
        throw error;
    }

    const localResults = useMemo(() => {
        if (!players || debouncedName.length === 0) return [];

        const searchTerm = debouncedName.toLowerCase();
        return players.filter((player) =>
            [player.name, player.fullName]
                .map((p) => convert(p).toLowerCase())
                .some((p) => p.includes(searchTerm))
        );
    }, [players, debouncedName]);

    const {
        mutate,
        data: serverResults,
        isPending,
        error: searchingError,
        isError: isSearchingError
    } = useSearchPlayers();

    if (isSearchingError) {
        throw searchingError;
    }
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
        setShowServerResults(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    const handleSearch = useCallback(() => {
        const query = convert(name.trim());

        if (query.length < 3) {
            alert("Please enter at least 3 characters.");
            return;
        }
        setShowServerResults(true);
        mutate(query, {
            onSuccess: () => queryClient.refetchQueries({queryKey: ["players"]}),
        });
    }, [name, mutate]);

    const results: PlayerType[] = showServerResults
        ? serverResults ?? []
        : localResults;

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
                    className="w-full sm:w-40 h-12 cursor-pointer px-4 py-2 rounded-xl bg-cyan-600 text-white font-semibold hover:bg-cyan-500 transition"
                    onClick={handleSearch}
                >
                    Search
                </button>
            </div>

            {isPending && (<div className="flex w-full justify-center items-center">
                <Spinner/>
            </div>)}

            <SearchResultsList players={results}/>
        </div>
    );
}
