import {connectDB} from "../config/connect";
import axios from "axios";
import {PlayerType} from "../models/player";
import {User} from "../models/user";
import { AppContext, Config} from "../models/context"
import {ScoutingReport} from "../models/scoutingReport";
import {PlayerHistory} from "../models/playerHistory";
import {Watchlist} from "../models/watchlist";
import logger from "../logger/logger";

export async function createContext({
                                            mongoURI,
                                            configOverrides,
                                        }: {
    mongoURI: string;
    configOverrides?: Partial<Config>;
}): Promise<AppContext> {
    const db = await connectDB(mongoURI);
    if (!db) {
        throw new Error("Database connection failed");
    }
    const players = db.collection<PlayerType>("players");
    const users = db.collection<User>("users");
    const scoutingReports = db.collection<ScoutingReport>("scoutingReports");
    const playerHistories = db.collection<PlayerHistory>("playerHistories");
    const watchlists = db.collection<Watchlist>("watchlists");
    await users.createIndex({email: 1}, {unique: true});
    await users.createIndex(
        {googleId: 1},
        {
            unique: true,
            partialFilterExpression: {googleId: {$type: "string"}},
        },
    );
    logger.info("User indexes ensured");
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
        // @ts-ignore
        scoutingReports,
        // @ts-ignore
        playerHistories,
        // @ts-ignore
        watchlists,
        config,
        httpClient
    };
}
