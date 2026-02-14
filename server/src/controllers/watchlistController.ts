import {ObjectId} from "mongodb";
import {z} from "zod";
import {AppContext} from "../models/context";
import {WatchlistInputSchema} from "../models/watchlist";
import {ApiError} from "./scoutingController";

const WatchlistPlayerMutationSchema = z.object({
    playerId: z.string().min(1),
});

const WatchlistReorderSchema = z.object({
    playerIds: z.array(z.string().min(1)).default([]),
});

function toSerializedWatchlist(watchlist: any) {
    return {
        ...watchlist,
        _id: String(watchlist._id),
    };
}

async function ensureWatchlist(context: AppContext, watchlistId: string, userId: string) {
    if (!ObjectId.isValid(watchlistId)) {
        throw new ApiError(400, "Invalid watchlist id");
    }

    const watchlist = await context.watchlists.findOne({_id: new ObjectId(watchlistId), userId});
    if (!watchlist) {
        throw new ApiError(404, "Watchlist not found");
    }

    return watchlist;
}

function uniqueIds(ids: string[]) {
    return Array.from(new Set(ids));
}

export async function listWatchlists(context: AppContext, userId: string) {
    const watchlists = await context.watchlists
        .find({userId})
        .sort({updatedAt: -1})
        .toArray();

    return watchlists.map((watchlist) => ({
        ...toSerializedWatchlist(watchlist),
        playerCount: watchlist.playerIds?.length || 0,
    }));
}

export async function getWatchlist(context: AppContext, watchlistId: string, userId: string) {
    const watchlist = await ensureWatchlist(context, watchlistId, userId);
    const playerIds = uniqueIds((watchlist.playerIds || []).filter(Boolean));
    const objectIds = playerIds.filter((id) => ObjectId.isValid(id)).map((id) => new ObjectId(id));
    const players = objectIds.length > 0
        ? await context.players.find({_id: {$in: objectIds}}).toArray()
        : [];

    const byId = new Map(players.map((player) => [String(player._id), player]));
    const orderedPlayers = playerIds.map((playerId) => byId.get(playerId)).filter(Boolean);

    return {
        ...toSerializedWatchlist(watchlist),
        players: orderedPlayers,
    };
}

export async function createWatchlist(context: AppContext, userId: string, payload: unknown) {
    const parsed = WatchlistInputSchema.parse(payload);
    const now = new Date();

    const created = {
        userId,
        name: parsed.name,
        description: parsed.description || "",
        playerIds: [] as string[],
        createdAt: now,
        updatedAt: now,
    };

    const result = await context.watchlists.insertOne(created as any);
    return toSerializedWatchlist({...created, _id: result.insertedId});
}

export async function updateWatchlist(context: AppContext, watchlistId: string, userId: string, payload: unknown) {
    const parsed = WatchlistInputSchema.parse(payload);
    const watchlist = await ensureWatchlist(context, watchlistId, userId);

    const updated = await context.watchlists.findOneAndUpdate(
        {_id: watchlist._id},
        {
            $set: {
                name: parsed.name,
                description: parsed.description || "",
                updatedAt: new Date(),
            },
        },
        {returnDocument: "after"},
    );

    if (!updated) {
        throw new ApiError(500, "Failed to update watchlist");
    }

    return toSerializedWatchlist(updated);
}

export async function deleteWatchlist(context: AppContext, watchlistId: string, userId: string) {
    const watchlist = await ensureWatchlist(context, watchlistId, userId);
    const deleted = await context.watchlists.deleteOne({_id: watchlist._id});
    if (!deleted.acknowledged) {
        throw new ApiError(500, "Failed to delete watchlist");
    }
}

export async function addPlayerToWatchlist(
    context: AppContext,
    watchlistId: string,
    userId: string,
    payload: unknown,
) {
    const parsed = WatchlistPlayerMutationSchema.parse(payload);
    if (!ObjectId.isValid(parsed.playerId)) {
        throw new ApiError(400, "Invalid player id");
    }

    const playerExists = await context.players.findOne({_id: new ObjectId(parsed.playerId)});
    if (!playerExists) {
        throw new ApiError(404, "Player not found");
    }

    const watchlist = await ensureWatchlist(context, watchlistId, userId);
    const updatedPlayerIds = uniqueIds([...(watchlist.playerIds || []), parsed.playerId]);
    const updated = await context.watchlists.findOneAndUpdate(
        {_id: watchlist._id},
        {$set: {playerIds: updatedPlayerIds, updatedAt: new Date()}},
        {returnDocument: "after"},
    );

    if (!updated) {
        throw new ApiError(500, "Failed to add player to watchlist");
    }

    return toSerializedWatchlist(updated);
}

export async function removePlayerFromWatchlist(context: AppContext, watchlistId: string, userId: string, playerId: string) {
    const watchlist = await ensureWatchlist(context, watchlistId, userId);
    const updatedPlayerIds = (watchlist.playerIds || []).filter((id) => id !== playerId);
    const updated = await context.watchlists.findOneAndUpdate(
        {_id: watchlist._id},
        {$set: {playerIds: updatedPlayerIds, updatedAt: new Date()}},
        {returnDocument: "after"},
    );

    if (!updated) {
        throw new ApiError(500, "Failed to remove player from watchlist");
    }

    return toSerializedWatchlist(updated);
}

export async function reorderWatchlistPlayers(
    context: AppContext,
    watchlistId: string,
    userId: string,
    payload: unknown,
) {
    const parsed = WatchlistReorderSchema.parse(payload);
    const watchlist = await ensureWatchlist(context, watchlistId, userId);
    const currentSet = new Set(watchlist.playerIds || []);
    const uniqueOrdered = uniqueIds(parsed.playerIds).filter((id) => currentSet.has(id));
    const missingTail = (watchlist.playerIds || []).filter((id) => !uniqueOrdered.includes(id));
    const playerIds = [...uniqueOrdered, ...missingTail];

    const updated = await context.watchlists.findOneAndUpdate(
        {_id: watchlist._id},
        {$set: {playerIds, updatedAt: new Date()}},
        {returnDocument: "after"},
    );

    if (!updated) {
        throw new ApiError(500, "Failed to reorder watchlist");
    }

    return toSerializedWatchlist(updated);
}
