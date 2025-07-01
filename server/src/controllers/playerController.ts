import {PlayerTypeSchemaWithoutID} from "../models/player";
import {AppContext} from "../models/context";
import {ObjectId} from "mongodb";
import {extractPlayerData} from "../scraper/scrapingData";
import {convert, normalizeDate, normalizeName} from "../scraper/utils";
import logger from "../logger/logger";

export async function getPlayerById(context: AppContext, id: string) {
    try {
        logger.debug(`Fetching player by ID: ${id}`);
        const playerId = new ObjectId(id);
        const player = await context.players.findOne({_id: new ObjectId(playerId)});
        if (!player) {
            logger.warn(`Player not found with ID: ${id}`);
            return null;
        }
        return player;
    } catch (error: any) {
        logger.error(`Failed to fetch player by ID ${id}: ${error.stack || error.message}`);
        throw new Error("Failed to fetch player by ID");
    }
}

export async function createPlayer(context: AppContext, player: any) {
    try {
        logger.debug(`Creating player with name: ${player?.name}`);
        player.timestamp = new Date();

        const safeData = PlayerTypeSchemaWithoutID.safeParse(player);
        if (!safeData.success) {
            throw new Error(`Failed to parse player data: ${JSON.stringify(safeData.error.issues, null, 2)}`);
        }

        const existing = await context.players.findOne({
            fullName: player.fullName,
            born: player.born,
            country: player.country,
        });

        if (existing) {
            logger.warn(`Player already exists: ${player.fullName}, born ${player.born}`);
            return existing;
        }

        const result = await context.players.insertOne(safeData.data);
        const inserted = await context.players.findOne({_id: result.insertedId});

        logger.info(`Inserted player: ${inserted?.name}`);
        return inserted;

    } catch (error: any) {
        logger.error(`Failed to insert player: ${error.message}`);
        throw new Error("Failed to insert player: " + error.message);
    }
}

export async function deletePlayerById(context: AppContext, id: string) {
    try {
        logger.info(`Deleting player by ID: ${id}`);
        const playerId = new ObjectId(id);
        const player = await context.players.findOne({_id: new ObjectId(playerId)});
        if (!player) {
            logger.warn(`Player not found with ID: ${id}`);
            return null;
        }
        const deletedPlayer = await context.players.deleteOne({_id: new ObjectId(id)});
        if (!deletedPlayer.acknowledged) {
            logger.warn(`Failed to delete player with ID (${id})`);
            return null;
        }
        return deletedPlayer;
    } catch (error: any) {
        logger.error(`Failed to delete player by ID ${id}: ${error.stack || error.message}`);
        throw new Error("Failed to delete player by ID");
    }
}

export async function updatePlayerFromWebSites(context: AppContext, playerId: string) {
    try {
        logger.info(`Updating player from websites: ${playerId}`);

        const oldPlayer = await context.players
            .findOne({_id: new ObjectId(playerId)});
        if (!oldPlayer) {
            logger.warn(`Player not found with ID: ${playerId}`);
            throw new Error("Player not found");
        }
        logger.info(`Converted Boren date ${normalizeDate(oldPlayer.born)}`)
        logger.info(`Updating player: ${oldPlayer.fullName}`);
        let foundPlayers = await extractPlayerData(convert(oldPlayer?.title));
        logger.info(`Found players: ${foundPlayers.length}`);
        let filteredPlayer = foundPlayers.filter(
            (p) =>
                (convert(oldPlayer?.fullName) === convert(p?.fullName) &&
                    normalizeDate(oldPlayer.born) === normalizeDate(p?.born)) ||
                (oldPlayer.country === p?.country &&
                    convert(oldPlayer.name) === convert(p?.name) &&
                    oldPlayer.number === p?.number)
        );

        if (filteredPlayer.length === 0) {
            foundPlayers = await extractPlayerData(convert(oldPlayer.fullName));
            filteredPlayer = foundPlayers.filter(
                (p) =>
                    normalizeName(oldPlayer?.fullName) === normalizeName(p?.fullName) ||
                    (oldPlayer.country === p?.country && normalizeName(oldPlayer.name) === normalizeName(p?.name))
            )
        }

        const newPlayer = filteredPlayer.length > 0 ? filteredPlayer[0] : oldPlayer;
        // Merge old and new player data
        const mergedPlayer = mergePlayerData(oldPlayer, newPlayer);

        const result = await context.players
            .findOneAndUpdate({_id: new ObjectId(playerId)}, {$set: mergedPlayer}, {returnDocument: "after"});

        logger.info(`Player updated: ${playerId}`);

        return result;
    } catch (error: any) {
        logger.error(`Failed to update player ${playerId}: ${error.stack || error.message}`);
        throw new Error("Failed to update player");
    }
}

export function mergePlayerData(oldPlayer: any, newPlayer: any): any {
    const merged = {...oldPlayer};
    for (const [key, newValue] of Object.entries(newPlayer)) {
        const oldValue = oldPlayer[key];

        if (newValue === undefined || newValue === null || newValue === "") continue;

        if (Array.isArray(newValue)) {
            if (newValue.length > 0) {
                if (["awards", "titles", "transfers", "playerAttributes"].includes(key)) {
                    const uniqueKey = {
                        awards: "name",
                        titles: "name",
                        transfers: "season",
                        playerAttributes: "name",
                    }[key];

                    const combined = [
                        ...oldValue,
                        ...newValue.filter(
                            (item: any) =>
                                // @ts-ignore
                                !oldValue.some((oldItem: any) => oldItem[uniqueKey] === item[uniqueKey])
                        ),
                    ];

                    merged[key] = combined;
                } else {
                    merged[key] = newValue;
                }
            }
        } else {
            merged[key] =
                newValue !== 0 && newValue !== "" && newValue !== undefined ? newValue : oldValue;
        }
    }

    return merged;
}

export async function searchPlayers(context: AppContext, name: string) {
    try {
        logger.info(`Searching players with name: ${name}`);
        const players = await extractPlayerData(name);
        if (players.length === 0) {
            logger.warn(`No players found for search: ${name}`);
            throw new Error("No players found");
        }

        const savedPlayers = [];
        for (const p of players) {
            const existingPlayer = await context.players
                .findOne({fullName: p?.fullName});

            if (!existingPlayer) {
                const safeData = PlayerTypeSchemaWithoutID.safeParse(p);
                if (!safeData.success) {
                    throw new Error(`Failed to parse player data: ${safeData.error.message}`);
                }
                //const result = await context.players.insertOne(safeData.data);
                // const insertedPlayer = await context.players.findOne({_id: result.insertedId});
                savedPlayers.push({
                    ...safeData.data,
                });
                logger.info(`Inserted new player: ${p.fullName}`);
            } else {
                const result = await updatePlayerFromWebSites(context, existingPlayer?._id?.toString()!);
                savedPlayers.push(result);
                logger.info(`Updated existing player: ${existingPlayer?.fullName}`);
            }
        }

        return savedPlayers;
    } catch (error: any) {
        logger.error(`Failed to search players: ${error.stack || error.message}`);
        throw new Error("Failed to search players");
    }
}

export async function getPlayers(context: AppContext) {
    try {
        logger.debug("Fetching all players");
        const players = await context.players.find().toArray();
        if (players.length === 0) {
            logger.warn("No players found");
            return [];
        }
        return players;
    } catch (error: any) {
        logger.error(`Error fetching players: ${error.stack || error.message}`);
        throw new Error("Failed to fetch players");
    }
}

export async function updateAllPlayers(context: AppContext) {
    try {
        logger.info("Updating all players");
        const players = await context.players.find().toArray();
        if (!players || players.length === 0) {
            logger.warn("No players found for update");
            throw new Error("No players found");
        }

        const updatePromises = players.map(async (player) => {
            try {
                return await updatePlayerFromWebSites(context, (player._id?.toString())!);
            } catch (error: any) {
                logger.error(`Error updating player ${player._id}: ${error.message}`);
                return null;
            }
        });


        const updatedPlayers = await Promise.all(updatePromises);
        return updatedPlayers.filter((p) => p);
    } catch (error: any) {
        logger.error(`Error updating all players: ${error.stack || error.message}`);
        throw error;
    }
}

export async function initializePlayers(context: AppContext) {
    try {
        const playerCount = await context.players.countDocuments();

        if (playerCount === 0) {
            logger.info("Initializing famous players...");

            const playersToInitialize = [
                "Cristiano Ronaldo",
                "Lionel Messi",
                "Neymar",
                "Ronaldinho",
                "David Beckham",
            ];

            for (const playerName of playersToInitialize) {
                const players = await extractPlayerData(playerName);

                for (const player of players) {
                    const safeData = PlayerTypeSchemaWithoutID.safeParse(player);
                    if (!safeData.success) {
                        throw new Error(`Failed to parse player data: ${safeData.error.message}`);
                    }
                    // @ts-ignore
                    await context.players.insertOne(safeData.data);
                    logger.info(`Inserted famous player: ${player.fullName}`);
                }
            }

            logger.info("Famous players initialized successfully.");
        } else {
            logger.info("Players already initialized.");
        }
    } catch (error: any) {
        logger.error(`Error initializing players: ${error.stack || error.message}`);
        throw new Error("Failed to initialize players");
    }
}
