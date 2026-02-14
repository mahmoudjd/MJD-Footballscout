import {Collection} from "mongodb";
import type {AxiosInstance} from "axios";
import {PlayerType} from "./player";
import {User} from "./user";
import {ScoutingReport} from "./scoutingReport";
import {PlayerHistory} from "./playerHistory";
import {Watchlist} from "./watchlist";

export interface AppContext {
    players: Collection<PlayerType>;
    users: Collection<User>;
    scoutingReports: Collection<ScoutingReport>;
    playerHistories: Collection<PlayerHistory>;
    watchlists: Collection<Watchlist>;
    config: Config;
    httpClient: AxiosInstance;
}

export interface Config {
    env: string;
    clientUrl: string;
}
