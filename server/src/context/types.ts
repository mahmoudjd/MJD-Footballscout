import {Collection} from "mongodb";
import type {AxiosInstance} from "axios";
import {PlayerType} from "../modules/players/player.model";
import {User} from "../modules/auth/user.model";
import {ScoutingReport} from "../modules/players/scouting-report.model";
import {PlayerHistory} from "../modules/players/player-history.model";
import {Watchlist} from "../modules/watchlists/watchlist.model";
import {ShadowTeam} from "../modules/shadow-teams/shadow-team.model";

export interface AppContext {
    players: Collection<PlayerType>;
    users: Collection<User>;
    scoutingReports: Collection<ScoutingReport>;
    playerHistories: Collection<PlayerHistory>;
    watchlists: Collection<Watchlist>;
    shadowTeams: Collection<ShadowTeam>;
    config: Config;
    httpClient: AxiosInstance;
}

export interface Config {
    env: string;
    clientUrl: string;
}
