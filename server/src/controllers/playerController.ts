import PlayerType from "../types";
import Player from "../models/playerModel";
import { Document } from "mongoose";
import { extractPlayerData, convert } from "../scraper/scrapingData";

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
    const player = await Player.findOne({ _id: id });
    return player;
  } catch (error) {
    throw new Error("do not get Player");
  }
}

export async function deletePlayerById(id: string) {
  try {
    const player = await Player.findOneAndDelete({ _id: id });
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
          (oldPlayer.country === p?.country && oldPlayer.name === p?.name),
      );
      console.log("results 2:", filteredPlayer.length);
    }

    const newPlayer = filteredPlayer.length > 0 ? filteredPlayer[0] : oldPlayer;

    const updatedPlayer = await Player.findOneAndUpdate(
      { _id: playerId },
      newPlayer,
      { new: true },
    );

    return updatedPlayer;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getPlayerByName(name: string) {
  try {
    return await Player.findOne({ fullName: name });
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

export async function initializePlayers() {
  try {
    const playerCount = await Player.countDocuments();
    if (playerCount <= 10) {
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
        for (const player of players) {
          if (player) await createPlayer(player);
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
