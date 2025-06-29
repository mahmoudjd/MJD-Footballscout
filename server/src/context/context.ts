import {connectDB} from "../config/connect";
import axios from "axios";
import {PlayerType} from "../models/player";
import {User} from "../models/user";
import { AppContext, Config} from "../models/context"

export async function createContext({
                                            mongoURI,
                                            configOverrides,
                                        }: {
    mongoURI: string;
    configOverrides?: Partial<Config>;
}): Promise<AppContext> {
    const db = await connectDB(mongoURI);
    const players = db?.collection<PlayerType>("players");
    const users = db?.collection<User>("users");
    const defaultConfig: Config = {
        env: process.env.NODE_ENV ?? "development",
        clientUrl: process.env.CLIENT_URL ?? "*",
    };

    const config: Config = {...defaultConfig, ...configOverrides};

    const httpClient = axios.create({
        baseURL: config.clientUrl,
        timeout: 10000,
        headers: {
            "User-Agent": "MyApp-Agent/1.0",
            Accept: "application/json",
        },
    });

    return {
        // @ts-ignore
        players,
        // @ts-ignore
        users,
        config,
        httpClient
    };
}

