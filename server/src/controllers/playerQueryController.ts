import {ObjectId} from "mongodb";
import {z} from "zod";
import {AppContext} from "../models/context";
import {parseCompactCurrency} from "./playerController";
import logger from "../logger/logger";

const AdvancedSearchQuerySchema = z.object({
    position: z.string().trim().min(1).optional(),
    country: z.string().trim().min(1).optional(),
    club: z.string().trim().min(1).optional(),
    minAge: z.coerce.number().min(0).optional(),
    maxAge: z.coerce.number().min(0).optional(),
    minElo: z.coerce.number().min(0).optional(),
    maxElo: z.coerce.number().min(0).optional(),
    minValue: z.coerce.number().min(0).optional(),
    maxValue: z.coerce.number().min(0).optional(),
    sortBy: z.enum(["elo", "age", "value", "name", "timestamp"]).default("elo"),
    order: z.enum(["asc", "desc"]).default("desc"),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).default(0),
});

function firstQueryValue(value: unknown) {
    if (Array.isArray(value)) {
        return value[0];
    }
    return value;
}

function toOptionalString(value: unknown) {
    const candidate = firstQueryValue(value);
    if (candidate === undefined || candidate === null) return undefined;
    const normalized = String(candidate).trim();
    return normalized.length > 0 ? normalized : undefined;
}

function toOptionalNumber(value: unknown) {
    const candidate = toOptionalString(value);
    if (candidate === undefined) return undefined;
    return candidate;
}

function normalizeForSearch(value: string | undefined) {
    return (value || "").toLowerCase().trim();
}

export async function getAdvancedPlayers(context: AppContext, query: Record<string, unknown>) {
    const parsedQuery = AdvancedSearchQuerySchema.parse({
        position: toOptionalString(query.position),
        country: toOptionalString(query.country),
        club: toOptionalString(query.club),
        minAge: toOptionalNumber(query.minAge),
        maxAge: toOptionalNumber(query.maxAge),
        minElo: toOptionalNumber(query.minElo),
        maxElo: toOptionalNumber(query.maxElo),
        minValue: toOptionalNumber(query.minValue),
        maxValue: toOptionalNumber(query.maxValue),
        sortBy: toOptionalString(query.sortBy),
        order: toOptionalString(query.order),
        limit: toOptionalNumber(query.limit),
        offset: toOptionalNumber(query.offset),
    });

    if (
        parsedQuery.minAge !== undefined &&
        parsedQuery.maxAge !== undefined &&
        parsedQuery.minAge > parsedQuery.maxAge
    ) {
        throw new Error("minAge cannot be greater than maxAge");
    }

    if (
        parsedQuery.minElo !== undefined &&
        parsedQuery.maxElo !== undefined &&
        parsedQuery.minElo > parsedQuery.maxElo
    ) {
        throw new Error("minElo cannot be greater than maxElo");
    }

    if (
        parsedQuery.minValue !== undefined &&
        parsedQuery.maxValue !== undefined &&
        parsedQuery.minValue > parsedQuery.maxValue
    ) {
        throw new Error("minValue cannot be greater than maxValue");
    }

    const players = await context.players.find().toArray();
    const searchedPosition = normalizeForSearch(parsedQuery.position);
    const searchedCountry = normalizeForSearch(parsedQuery.country);
    const searchedClub = normalizeForSearch(parsedQuery.club);

    const filtered = players.filter((player) => {
        const age = typeof player.age === "number" ? player.age : null;
        const elo = typeof player.elo === "number" ? player.elo : null;
        const value = parseCompactCurrency(player.value, player.currency);

        if (searchedPosition && !normalizeForSearch(player.position).includes(searchedPosition)) {
            return false;
        }
        if (searchedCountry && !normalizeForSearch(player.country).includes(searchedCountry)) {
            return false;
        }
        if (searchedClub && !normalizeForSearch(player.currentClub).includes(searchedClub)) {
            return false;
        }

        if (parsedQuery.minAge !== undefined && (age === null || age < parsedQuery.minAge)) {
            return false;
        }
        if (parsedQuery.maxAge !== undefined && (age === null || age > parsedQuery.maxAge)) {
            return false;
        }
        if (parsedQuery.minElo !== undefined && (elo === null || elo < parsedQuery.minElo)) {
            return false;
        }
        if (parsedQuery.maxElo !== undefined && (elo === null || elo > parsedQuery.maxElo)) {
            return false;
        }
        if (parsedQuery.minValue !== undefined && value < parsedQuery.minValue) {
            return false;
        }
        if (parsedQuery.maxValue !== undefined && value > parsedQuery.maxValue) {
            return false;
        }

        return true;
    });

    const sortDirection = parsedQuery.order === "asc" ? 1 : -1;
    const sorted = [...filtered].sort((a, b) => {
        if (parsedQuery.sortBy === "name") {
            return sortDirection * String(a.name || "").localeCompare(String(b.name || ""));
        }
        if (parsedQuery.sortBy === "value") {
            return sortDirection * (
                parseCompactCurrency(a.value, a.currency) - parseCompactCurrency(b.value, b.currency)
            );
        }
        if (parsedQuery.sortBy === "age") {
            const aAge = typeof a.age === "number" ? a.age : Number.POSITIVE_INFINITY;
            const bAge = typeof b.age === "number" ? b.age : Number.POSITIVE_INFINITY;
            return sortDirection * (aAge - bAge);
        }
        if (parsedQuery.sortBy === "timestamp") {
            const aTimestamp = a.timestamp ? new Date(a.timestamp).getTime() : 0;
            const bTimestamp = b.timestamp ? new Date(b.timestamp).getTime() : 0;
            return sortDirection * (aTimestamp - bTimestamp);
        }
        const aElo = typeof a.elo === "number" ? a.elo : Number.NEGATIVE_INFINITY;
        const bElo = typeof b.elo === "number" ? b.elo : Number.NEGATIVE_INFINITY;
        return sortDirection * (aElo - bElo);
    });

    const paginated = sorted.slice(parsedQuery.offset, parsedQuery.offset + parsedQuery.limit);

    return {
        items: paginated,
        total: sorted.length,
        limit: parsedQuery.limit,
        offset: parsedQuery.offset,
        hasMore: parsedQuery.offset + parsedQuery.limit < sorted.length,
        appliedFilters: {
            position: parsedQuery.position || null,
            country: parsedQuery.country || null,
            club: parsedQuery.club || null,
            minAge: parsedQuery.minAge ?? null,
            maxAge: parsedQuery.maxAge ?? null,
            minElo: parsedQuery.minElo ?? null,
            maxElo: parsedQuery.maxElo ?? null,
            minValue: parsedQuery.minValue ?? null,
            maxValue: parsedQuery.maxValue ?? null,
            sortBy: parsedQuery.sortBy,
            order: parsedQuery.order,
        },
    };
}

function parseCompareIds(query: Record<string, unknown>) {
    const rawIds = toOptionalString(query.ids);
    if (!rawIds) {
        throw new Error("Query parameter ids is required");
    }

    const uniqueIds = Array.from(
        new Set(
            rawIds
                .split(",")
                .map((id) => id.trim())
                .filter(Boolean),
        ),
    );

    if (uniqueIds.length < 2) {
        throw new Error("At least two players are required for comparison");
    }

    if (uniqueIds.length > 4) {
        throw new Error("Maximum of four players can be compared at once");
    }

    if (uniqueIds.some((id) => !ObjectId.isValid(id))) {
        throw new Error("One or more player ids are invalid");
    }

    return uniqueIds;
}

function pickLeaders<T>(players: any[], selector: (player: any) => T, prefer: "max" | "min") {
    if (players.length === 0) return [];

    const values = players.map((player) => ({
        playerId: String(player._id),
        value: selector(player),
    }));

    const numericValues = values.filter((entry) => typeof entry.value === "number" && Number.isFinite(entry.value));
    if (numericValues.length === 0) return [];

    const targetValue = prefer === "max"
        ? Math.max(...numericValues.map((entry) => entry.value as number))
        : Math.min(...numericValues.map((entry) => entry.value as number));

    return numericValues
        .filter((entry) => entry.value === targetValue)
        .map((entry) => entry.playerId);
}

export async function comparePlayers(context: AppContext, query: Record<string, unknown>) {
    const ids = parseCompareIds(query);
    const objectIds = ids.map((id) => new ObjectId(id));
    const players = await context.players.find({_id: {$in: objectIds}}).toArray();

    if (players.length < 2) {
        throw new Error("Not enough players found for comparison");
    }

    const playersById = new Map(players.map((player) => [String(player._id), player]));
    const orderedPlayers = ids.map((id) => playersById.get(id)).filter(Boolean);

    const byElo = pickLeaders(orderedPlayers, (player) => player.elo, "max");
    const byValue = pickLeaders(
        orderedPlayers,
        (player) => parseCompactCurrency(player.value, player.currency),
        "max",
    );
    const byAge = pickLeaders(orderedPlayers, (player) => player.age, "min");
    const byTimestamp = pickLeaders(
        orderedPlayers,
        (player) => (player.timestamp ? new Date(player.timestamp).getTime() : 0),
        "max",
    );

    const scoreMap = new Map<string, number>();
    for (const player of orderedPlayers) {
        scoreMap.set(String(player!._id), 0);
    }

    const awardPoints = (leaderIds: string[]) => {
        for (const leaderId of leaderIds) {
            scoreMap.set(leaderId, (scoreMap.get(leaderId) || 0) + 1);
        }
    };

    awardPoints(byElo);
    awardPoints(byValue);
    awardPoints(byAge);
    awardPoints(byTimestamp);

    const ranking = orderedPlayers
        .map((player) => ({
            playerId: String(player!._id),
            score: scoreMap.get(String(player!._id)) || 0,
        }))
        .sort((a, b) => b.score - a.score);

    logger.info(`Compared ${orderedPlayers.length} players`);

    return {
        players: orderedPlayers,
        metrics: {
            highestElo: byElo,
            highestMarketValue: byValue,
            youngest: byAge,
            recentlyUpdated: byTimestamp,
        },
        ranking,
    };
}
