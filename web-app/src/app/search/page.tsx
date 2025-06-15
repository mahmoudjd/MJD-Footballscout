import {use} from "react";
import {SearchField} from "@/components/search/SearchField";
import {fetchPlayers} from "@/lib/hooks/queries/get-players";

export default function SearchPage() {

    const players = use(fetchPlayers())

    return <SearchField players={players}/>;
};
