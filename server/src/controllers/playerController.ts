import {PlayerTypeSchemaWithoutID} from "../models/player";
import {AppContext} from "../models/context";
import {ObjectId} from "mongodb";
import {extractPlayerData} from "../scraper/scrapingData";
import {convert, isPlayerMatch, normalizeDate, normalizeName} from "../scraper/utils";
import logger from "../logger/logger";

function normalizePositionForStats(position: string | undefined) {
    const value = (position || "").toLowerCase();
    if (value.includes("forward")) return "Forward";
    if (value.includes("midfielder")) return "Midfielder";
    if (value.includes("defender")) return "Defender";
    if (value.includes("goalkeeper")) return "Goalkeeper";
    if (value.includes("manager")) return "Manager";
    return position?.trim() || "Unknown";
}

function incrementCounter(map: Map<string, number>, key: string) {
    map.set(key, (map.get(key) || 0) + 1);
}

function parseCompactCurrency(value: string | undefined) {
    if (!value) return 0;

    const cleaned = value.trim().replace(",", ".");
    const matched = cleaned.match(/^(\d+(?:\.\d+)?)([MK])?$/i);
    if (!matched) return 0;

    const amount = Number(matched[1]);
    const unit = matched[2]?.toUpperCase();

    if (!Number.isFinite(amount)) return 0;
    if (unit === "M") return Math.round(amount * 1_000_000);
    if (unit === "K") return Math.round(amount * 1_000);
    return Math.round(amount);
}

function toHighlightPlayer(player: any) {
    return {
        _id: String(player?._id || ""),
        name: player?.name || "",
        age: typeof player?.age === "number" ? player.age : 0,
        country: player?.country || "Unknown",
        position: normalizePositionForStats(player?.position),
        elo: typeof player?.elo === "number" ? player.elo : 0,
        image: player?.image || "",
        currentClub: player?.currentClub || "",
        value: player?.value || "",
        currency: player?.currency || "",
    };
}

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

        // @ts-ignore
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
        logger.info(`Converted Born date ${normalizeDate(oldPlayer.born)}`)
        logger.info(`Updating player: ${oldPlayer.fullName}`);
        let foundPlayers = await extractPlayerData(convert(oldPlayer?.title));
        logger.info(`Found players: ${foundPlayers.length}`);
        let filteredPlayer = foundPlayers.filter(
            (p) => {

                logger.info(`Old player: ${convert(oldPlayer?.fullName)}`);
                logger.info(`Found player: ${convert(p?.fullName)}`);
                logger.info(`Old player name: ${convert(oldPlayer?.name)}`);
                logger.info(`Found player name: ${convert(p?.name)}`)
                logger.info(`Old player born: ${normalizeDate(oldPlayer.born)}`);
                logger.info(`Found player born: ${normalizeDate(p?.born)}`);
                logger.info(`Old player country: ${oldPlayer.country}`);
                logger.info(`Found player country: ${p?.country}`);
                return isPlayerMatch(oldPlayer, p)
            }
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
            return []
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
                logger.info(`Inserted new player in search results: ${safeData.data.fullName}`);
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

export async function getPlayersStats(context: AppContext) {
    try {
        logger.debug("Calculating players stats");
        const players = await context.players.find({}, {
            projection: {
                age: 1,
                elo: 1,
                position: 1,
                country: 1,
                timestamp: 1,
            },
        }).toArray();

        if (players.length === 0) {
            return {
                totalPlayers: 0,
                averageAge: 0,
                averageElo: 0,
                positions: [],
                topCountries: [],
                latestUpdate: null,
            };
        }

        let ageSum = 0;
        let ageCount = 0;
        let eloSum = 0;
        let eloCount = 0;
        let latestUpdateMs: number | null = null;

        const positionCount = new Map<string, number>();
        const countryCount = new Map<string, number>();

        for (const player of players) {
            if (typeof player.age === "number" && Number.isFinite(player.age)) {
                ageSum += player.age;
                ageCount += 1;
            }

            if (typeof player.elo === "number" && Number.isFinite(player.elo)) {
                eloSum += player.elo;
                eloCount += 1;
            }

            incrementCounter(positionCount, normalizePositionForStats(player.position));
            incrementCounter(countryCount, player.country || "Unknown");

            const parsedTimestamp = player.timestamp ? new Date(player.timestamp).getTime() : Number.NaN;
            if (!Number.isNaN(parsedTimestamp) && (latestUpdateMs === null || parsedTimestamp > latestUpdateMs)) {
                latestUpdateMs = parsedTimestamp;
            }
        }

        const positions = Array.from(positionCount.entries())
            .map(([position, count]) => ({position, count}))
            .sort((a, b) => b.count - a.count);

        const topCountries = Array.from(countryCount.entries())
            .map(([country, count]) => ({country, count}))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        return {
            totalPlayers: players.length,
            averageAge: ageCount > 0 ? Number((ageSum / ageCount).toFixed(1)) : 0,
            averageElo: eloCount > 0 ? Math.round(eloSum / eloCount) : 0,
            positions,
            topCountries,
            latestUpdate: latestUpdateMs ? new Date(latestUpdateMs).toISOString() : null,
        };
    } catch (error: any) {
        logger.error(`Error calculating players stats: ${error.stack || error.message}`);
        throw new Error("Failed to calculate players stats");
    }
}

export async function getPlayersHighlights(context: AppContext) {
    try {
        logger.debug("Calculating players highlights");
        const players = await context.players.find({}, {
            projection: {
                name: 1,
                age: 1,
                country: 1,
                position: 1,
                elo: 1,
                image: 1,
                currentClub: 1,
                value: 1,
                currency: 1,
            },
        }).toArray();

        if (players.length === 0) {
            return {
                topEloPlayers: [],
                youngTalents: [],
                marketLeaders: [],
            };
        }

        const byEloDesc = [...players].sort((a, b) => (b.elo || 0) - (a.elo || 0));
        const byMarketValueDesc = [...players].sort(
            (a, b) => parseCompactCurrency(b.value) - parseCompactCurrency(a.value),
        );

        const topEloPlayers = byEloDesc.slice(0, 5).map(toHighlightPlayer);
        const youngTalents = byEloDesc
            .filter((p) => typeof p.age === "number" && p.age <= 23)
            .slice(0, 5)
            .map(toHighlightPlayer);
        const marketLeaders = byMarketValueDesc.slice(0, 5).map(toHighlightPlayer);

        return {
            topEloPlayers,
            youngTalents,
            marketLeaders,
        };
    } catch (error: any) {
        logger.error(`Error calculating players highlights: ${error.stack || error.message}`);
        throw new Error("Failed to calculate players highlights");
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
