import { connectDB } from "../config/connect";
import axios from "axios";
import { PlayerType } from "../modules/players/player.model";
import { User } from "../modules/auth/user.model";
import { AppContext, Config } from "./types";
import { ScoutingReport } from "../modules/players/scouting-report.model";
import { PlayerHistory } from "../modules/players/player-history.model";
import { Watchlist } from "../modules/watchlists/watchlist.model";
import logger from "../logger/logger";
import { ShadowTeam } from "../modules/shadow-teams/shadow-team.model";
import { RecruitmentCandidate } from "../modules/recruitment/recruitment-candidate.model";
import { RecruitmentWorkspace } from "../modules/recruitment/recruitment-workspace.model";

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
  const shadowTeams = db.collection<ShadowTeam>("shadowTeams");
  const recruitmentCandidates = db.collection<RecruitmentCandidate>(
    "recruitmentCandidates",
  );
  const recruitmentWorkspaces = db.collection<RecruitmentWorkspace>(
    "recruitmentWorkspaces",
  );

  await players.createIndex({ fullName: 1 });
  await players.createIndex({ name: 1 });
  await players.createIndex({ position: 1 });
  await players.createIndex({ country: 1 });
  await players.createIndex({ currentClub: 1 });
  await players.createIndex({ age: 1 });
  await players.createIndex({ elo: -1 });
  await players.createIndex({ timestamp: -1 });

  await users.createIndex({ email: 1 }, { unique: true });
  await users.createIndex(
    { googleId: 1 },
    {
      unique: true,
      partialFilterExpression: { googleId: { $type: "string" } },
    },
  );
  await users.createIndex({ passwordResetTokenHash: 1 }, { sparse: true });
  await users.createIndex({ emailVerificationTokenHash: 1 }, { sparse: true });
  await watchlists.createIndex({ userId: 1, updatedAt: -1 });
  await shadowTeams.createIndex({ userId: 1, updatedAt: -1 });
  await recruitmentCandidates.createIndex(
    { userId: 1, playerId: 1 },
    { unique: true },
  );
  await recruitmentWorkspaces.createIndex({ userId: 1 }, { unique: true });
  await scoutingReports.createIndex({ playerId: 1, updatedAt: -1 });
  await scoutingReports.createIndex({ userId: 1, updatedAt: -1 });
  await playerHistories.createIndex({ playerId: 1, timestamp: -1 });
  logger.info("Database indexes ensured");
  const defaultConfig: Config = {
    env: process.env.NODE_ENV ?? "development",
    clientUrl: process.env.CLIENT_URL ?? "*",
  };

  const config: Config = { ...defaultConfig, ...configOverrides };

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
    // @ts-ignore
    shadowTeams,
    // @ts-ignore
    recruitmentCandidates,
    // @ts-ignore
    recruitmentWorkspaces,
    config,
    httpClient,
  };
}
