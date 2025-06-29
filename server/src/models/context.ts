import {Collection} from "mongodb";
import type {AxiosInstance} from "axios";
import {PlayerType} from "./player";
import {User} from "./user";

export interface AppContext {
    players: Collection<PlayerType>;
    users: Collection<User>
    config: Config;
    httpClient: AxiosInstance;
}

export interface Config {
    env: string;
    clientUrl: string;
}
