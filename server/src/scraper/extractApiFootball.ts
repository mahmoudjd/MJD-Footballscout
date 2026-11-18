import axios, {AxiosInstance} from "axios";
import {z} from "zod";
import {PlayerTypeSchemaWithoutID, Title, Transfer} from "../modules/players/player.model";
import logger from "../logger/logger";
import {toInt} from "./utils";
import {normalizePosition} from "./position";

type PlayerTypeSchema = z.infer<typeof PlayerTypeSchemaWithoutID>;

/**
 * Third data source alongside BeSoccer and Playmakerstats.
 *
 * Unlike the two scrapers this is a licensed API behind an API key, so it
 * cannot be cut off by a bot-protection change on someone else's site — that
 * is the entire point of adding it. It does not replace the scrapers: the API
 * carries no market value, ELO, preferred foot or player attributes, so it is
 * used to fill gaps and as a last resort, never as the preferred source.
 */

const DEFAULT_BASE_URL = "https://v3.football.api-sports.io";
const REQUEST_TIMEOUT_MS = 15_000;
const MAX_PROFILES = 3;

/** api-sports and RapidAPI expect different auth headers for the same API. */
function buildClient(): AxiosInstance | null {
    const apiKey = process.env.API_FOOTBALL_KEY;
    if (!apiKey) return null;

    const baseURL = process.env.API_FOOTBALL_BASE_URL || DEFAULT_BASE_URL;
    const isRapidApi = baseURL.includes("rapidapi.com");

    return axios.create({
        baseURL,
        timeout: REQUEST_TIMEOUT_MS,
        headers: isRapidApi
            ? {"x-rapidapi-key": apiKey, "x-rapidapi-host": new URL(baseURL).hostname}
            : {"x-apisports-key": apiKey},
    });
}

let client: AxiosInstance | null | undefined;
let missingKeyLogged = false;

function getClient(): AxiosInstance | null {
    if (client === undefined) client = buildClient();
    if (!client && !missingKeyLogged) {
        logger.warn("API_FOOTBALL_KEY is not set — the API-Football source stays disabled.");
        missingKeyLogged = true;
    }
    return client;
}

/** Test seam: forces the client to be rebuilt from the current environment. */
export function resetApiFootballClient(): void {
    client = undefined;
    missingKeyLogged = false;
}

export function isApiFootballConfigured(): boolean {
    return Boolean(process.env.API_FOOTBALL_KEY);
}

/**
 * API-Football answers HTTP 200 even for quota and parameter failures, with the
 * problem described in `errors`. That field is an array when empty and an
 * object keyed by cause when populated, so both shapes have to be handled or a
 * failed call looks like an empty result.
 */
export function readEnvelopeErrors(payload: unknown): string[] {
    const errors = (payload as {errors?: unknown})?.errors;
    if (!errors) return [];
    if (Array.isArray(errors)) return errors.map(String);
    if (typeof errors === "object") {
        return Object.entries(errors as Record<string, unknown>).map(
            ([key, value]) => `${key}: ${value}`,
        );
    }
    return [String(errors)];
}

async function request<T>(path: string, params: Record<string, string | number>): Promise<T[]> {
    const http = getClient();
    if (!http) return [];

    try {
        const {data, status} = await http.get(path, {params, validateStatus: (s) => s < 500});

        if (status >= 400) {
            logger.error(`API-Football ${path} returned HTTP ${status}`);
            return [];
        }

        const errors = readEnvelopeErrors(data);
        if (errors.length > 0) {
            logger.error(`API-Football ${path} rejected the request: ${errors.join("; ")}`);
            return [];
        }

        return Array.isArray(data?.response) ? (data.response as T[]) : [];
    } catch (error: any) {
        const reason = error?.code === "ECONNABORTED"
            ? `timeout after ${REQUEST_TIMEOUT_MS}ms`
            : error?.message || String(error);
        logger.error(`API-Football ${path} request failed: ${reason}`);
        return [];
    }
}

interface ApiFootballPlayer {
    id?: number;
    name?: string;
    firstname?: string;
    lastname?: string;
    age?: number;
    birth?: {date?: string; place?: string; country?: string};
    nationality?: string;
    height?: string;
    weight?: string;
    number?: number;
    position?: string;
    photo?: string;
}

interface ApiFootballTransfer {
    date?: string;
    type?: string;
    teams?: {in?: {name?: string}; out?: {name?: string}};
}

interface ApiFootballTransferEntry {
    transfers?: ApiFootballTransfer[];
}

interface ApiFootballTrophy {
    league?: string;
    country?: string;
    season?: string;
    place?: string;
}

/** "180 cm" and "70 kg" arrive as strings; toInt strips the unit. */
const measure = (value: string | undefined): number => (value ? toInt(value) : 0);

export function mapTransfers(entries: ApiFootballTransferEntry[]): Transfer[] {
    return entries
        .flatMap((entry) => entry.transfers ?? [])
        .map((transfer) => ({
            season: transfer.date || "",
            team: transfer.teams?.in?.name || "",
            amount: transfer.type || "",
        }))
        .filter((transfer) => transfer.team);
}

/**
 * The API lists one row per won trophy, the app stores a count per competition,
 * so rows are grouped by name. Only wins count — "Runner-up" rows are dropped.
 */
export function mapTrophies(trophies: ApiFootballTrophy[]): Title[] {
    const wins = new Map<string, number>();

    for (const trophy of trophies) {
        if (trophy.place?.toLowerCase() !== "winner") continue;
        const name = trophy.league?.trim();
        if (!name) continue;
        wins.set(name, (wins.get(name) ?? 0) + 1);
    }

    return Array.from(wins, ([name, count]) => ({name, number: String(count)}));
}

/** Latest transfer wins, since the API returns them newest first. */
function currentClubFrom(transfers: Transfer[]): string {
    return transfers[0]?.team || "";
}

export function mapPlayer(
    profile: ApiFootballPlayer,
    transfers: Transfer[],
    titles: Title[],
): PlayerTypeSchema | undefined {
    const name = profile.name?.trim() || "";
    const fullName = [profile.firstname, profile.lastname]
        .map((part) => part?.trim())
        .filter(Boolean)
        .join(" ") || name;

    if (!name && !fullName) return undefined;

    const player = {
        title: name || fullName,
        name: name || fullName,
        fullName,
        age: profile.age ?? 0,
        number: profile.number ?? 0,
        currentClub: currentClubFrom(transfers),
        image: profile.photo || "",
        caps: "",
        country: profile.nationality || "",
        birthCountry: profile.birth?.country || "",
        weight: measure(profile.weight),
        height: measure(profile.height),
        position: normalizePosition(profile.position),
        preferredFoot: "",
        // Not covered by API-Football — left empty so the merge in
        // scrapingData.ts prefers whichever scraper did supply them.
        value: "",
        currency: "",
        highstValue: "",
        elo: 0,
        born: profile.birth?.date || "",
        status: "",
        otherNation: "",
        website: "",
        playerAttributes: [],
        titles,
        awards: [],
        transfers,
        timestamp: new Date(),
    };

    const parsed = PlayerTypeSchemaWithoutID.safeParse(player);
    if (!parsed.success) {
        logger.warn(
            `API-Football validation failed for '${fullName || name}': ${JSON.stringify(parsed.error.format())}`,
        );
        return undefined;
    }

    return parsed.data;
}

async function loadPlayerDetails(profile: ApiFootballPlayer): Promise<PlayerTypeSchema | undefined> {
    if (!profile.id) return mapPlayer(profile, [], []);

    // Independent calls — running them in sequence would triple the latency and
    // the daily quota is spent either way.
    const [transferEntries, trophies] = await Promise.all([
        request<ApiFootballTransferEntry>("/transfers", {player: profile.id}),
        request<ApiFootballTrophy>("/trophies", {player: profile.id}),
    ]);

    return mapPlayer(profile, mapTransfers(transferEntries), mapTrophies(trophies));
}

/**
 * Searches players by name. `/players/profiles` is the only endpoint that takes
 * a bare name — `/players` additionally requires a league, team or season,
 * which this app does not know at search time.
 */
export async function extractPlayersFromApiFootball(name: string): Promise<PlayerTypeSchema[]> {
    const search = name.trim();
    if (!isApiFootballConfigured()) return [];

    // The API rejects shorter search terms outright.
    if (search.length < 4) {
        logger.warn(`API-Football search needs at least 4 characters, got '${search}'.`);
        return [];
    }

    const profiles = await request<ApiFootballPlayer>("/players/profiles", {search});
    if (profiles.length === 0) {
        logger.info(`API-Football found no profile for '${search}'.`);
        return [];
    }

    logger.info(`API-Football returned ${profiles.length} profiles for '${search}'.`);

    const players = await Promise.all(
        profiles.slice(0, MAX_PROFILES).map((profile) => loadPlayerDetails(profile)),
    );

    return players.filter((player): player is PlayerTypeSchema => Boolean(player));
}

/** Single best match, for the merge path in scrapingData.ts. */
export async function extractPlayerFromApiFootball(
    name: string,
): Promise<PlayerTypeSchema | undefined> {
    const [first] = await extractPlayersFromApiFootball(name);
    return first;
}
