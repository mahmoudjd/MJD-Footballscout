import PlayerType from "../types";
import Player from "../models/playerModel";
import {Document} from "mongoose";
import {extractPlayerData, convert} from "../scraper/scrapingData";

async function createPlayer(data: PlayerType) {
    try {
        const player = await Player.create(data);
        return player;
    } catch (error) {
        console.error(error);
        throw new Error("Failed to create player");
    }
}

export async function getPlayerById(id: string) {
    try {
        const player = await Player.findOne({_id: id});
        return player;
    } catch (error) {
        throw new Error("do not get Player");
    }
}

export async function deletePlayerById(id: string) {
    try {
        const player = await Player.findOneAndDelete({_id: id});
        return player;
    } catch (error) {
        throw new Error("does not delete player");
    }
}

export async function updatePlayerFromWebSites(playerId: string) {
    try {
        console.log("--- updating 1 ---");
        const oldPlayer = await getPlayerById(playerId);
        if (!oldPlayer) throw new Error("not found player");
        let foundedPlayers = await extractPlayerData(
            convert(`${oldPlayer?.title}`),
        );

        let filteredPlayer = foundedPlayers.filter(
            // prüfen der gleiche Spieler gefunden wird.
            (p) =>
                (convert(`${oldPlayer?.fullName}`) === convert(`${p?.fullName}`) &&
                    oldPlayer.born === p?.born) /* &&
          oldPlayer.number === p?.number */ ||
                (oldPlayer.country === p?.country &&
                    oldPlayer.name === p?.name &&
                    oldPlayer.number === p?.number),
        );
        console.log("results 1:", filteredPlayer.length);
        if (filteredPlayer.length === 0) {
            foundedPlayers = await extractPlayerData(
                convert(`${oldPlayer.fullName}`),
            );
            filteredPlayer = foundedPlayers.filter(
                (p) =>
                    convert(`${oldPlayer?.fullName}`) === convert(`${p?.fullName}`) ||
                    (oldPlayer.country === p?.country && (oldPlayer.name === p?.name ||
                        oldPlayer.fullName.toLowerCase().trim() === p.fullName.toLowerCase().trim())),
            );
            console.log("results 2:", filteredPlayer.length);
        }

        const newPlayer = filteredPlayer.length > 0 ? filteredPlayer[0] : oldPlayer;

        // Merge old and new player data
        // If new data is missing or has default values (like 0 for numbers), use old data
        const mergedPlayer = {
            ...oldPlayer.toObject(), // Start with all old player data
            ...Object.fromEntries(
                Object.entries(newPlayer).map(([key, value]) => {
                    // For numeric fields, check if the new value is 0 (default)
                    if (typeof value === 'number' && value === 0 && oldPlayer[key] !== undefined) {
                        return [key, oldPlayer[key]];
                    }
                    // For string fields, check if the new value is empty
                    if (typeof value === 'string' && value === '' && oldPlayer[key] !== undefined) {
                        return [key, oldPlayer[key]];
                    }
                    // For undefined or null values, use old value if available
                    if ((value === undefined || value === null) && oldPlayer[key] !== undefined) {
                        return [key, oldPlayer[key]];
                    }
                    // Otherwise use the new value
                    return [key, value];
                })
            )
        };

        // Handle arrays separately to ensure they're properly merged
        ['playerAttributes', 'titles', 'awards', 'transfers'].forEach(arrayField => {
            if (!newPlayer[arrayField] || newPlayer[arrayField].length === 0) {
                mergedPlayer[arrayField] = oldPlayer[arrayField];
            }
        });

        const updatedPlayer = await Player.findOneAndUpdate(
            {_id: playerId},
            mergedPlayer,
            {new: true},
        );

        return updatedPlayer;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function getPlayerByName(name: string) {
    try {
        return await Player.findOne({fullName: name});
    } catch (error) {
        console.error(error);
        throw new Error("Failed to get player by name");
    }
}

export async function searchPlayers(name: string) {
    try {
        let players = await extractPlayerData(name);
        if (players.length === 0) {
            throw new Error("Player not found");
        }

        const foundedPlayers: Document[] = [];
        for (const player of players) {
            const existsPlayer = await getPlayerByName(`${player?.fullName}`);
            if (player && !existsPlayer && player.name && player.title) {
                if (
                    (!player.number || !player.age) &&
                    !player.weight &&
                    !player.height &&
                    !player.preferredFoot
                )
                    continue;
                const createdPlayer = await createPlayer(player);
                if (createdPlayer) foundedPlayers.push(createdPlayer);
            } else if (
                player &&
                existsPlayer &&
                player?.number !== existsPlayer.number &&
                player.age !== existsPlayer.age &&
                player.height !== existsPlayer.height &&
                player.currentClub !== existsPlayer.currentClub
            ) {
                const createdPlayer = await createPlayer(player);
                if (createdPlayer) foundedPlayers.push(createdPlayer);
            } else if (existsPlayer) {
                foundedPlayers.push(existsPlayer);
            }
        }
        return foundedPlayers;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getPlayers() {
    try {
        const players = await Player.find();
        if (!players) throw new Error("not founded players");
        return players;
    } catch (error) {
        console.error(error);
    }
}

async function getPlayerIds() {
    try {
        const playerIds = await Player.find({}, {_id: 1}).lean();

        return playerIds.map(p => p._id.toString());
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function updateAllPlayers() {
    try {
        console.log("--- updating all players ---");
        const playerIds = await getPlayerIds();
        if (!playerIds) throw new Error("No players found");

        const updatedPlayers = [];
        for (const playerId of playerIds) {
            try {
                const updatedPlayer = await updatePlayerFromWebSites(playerId);
                if (updatedPlayer) {
                    updatedPlayers.push(updatedPlayer);
                }
            } catch (error) {
                console.error(`Error updating player ${playerId}: ${error.message}`);
                // Continue with next player even if one fails
            }
        }

        console.log(`Updated ${updatedPlayers.length} out of ${playerIds.length} players`);
        return updatedPlayers;
    } catch (error) {
        console.error("Error updating all players:", error);
        throw error;
    }
}

export async function initializePlayers() {
    try {
        const playerCount = await Player.countDocuments();
        if (playerCount <= 0) {
            console.log("➕ [server]: Initializing famous players...");
            const playersToAdd = [
                "Cristiano Ronaldo",
                "Lionel Messi",
                "Neymar",
                "Ronaldinho",
                "David Beckham",
                "Sergio Ramos",
                "Karim Benzema",
                "M. Salah",
                "Marcelo",
                "James Rodriguez",
                "Zlatan Ibrahimovic",
            ];
            for (const playerName of playersToAdd) {
                const players = await extractPlayerData(playerName, true);
                if (players.length !== 0) {
                    for (const player of players) {
                        const createdPlayer = await createPlayer(player);
                        if (createdPlayer) {
                            console.log(createdPlayer.fullName, " created successfully.");
                        }
                    }
                } else {
                    throw new Error("Player not found");
                }
            }
            console.log("✅ [server]: Famous players initialized successfully.");
        } else {
            console.log(
                "✅ [server]: Famous players already exist. Skipping initialization.",
            );
        }
    } catch (error) {
        console.error("Error initializing players:", error);
    }
}
