// @ts-ignore
import express, { Request, Response } from "express";
import {
  getPlayers,
  getPlayerById,
  deletePlayerById,
  updatePlayerFromWebSites,
  updateAllPlayers,
  searchPlayers,
} from "../controllers/playerController";

const router = express.Router();

router.get("/players", async (req: Request, res: Response) => {
  try {
    const players = await getPlayers();
    res.status(200).json(players);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/players/:id", async function (req: Request, res: Response) {
  const playerId = req.params.id;
  try {
    const player = await getPlayerById(playerId);
    if (!player) return res.status(404).json("not found player");

    res.status(201).json(player);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/players/:id", async (req: Request, res: Response) => {
  try {
    const playerId = req.params.id;
    const player = await updatePlayerFromWebSites(playerId);
    if (!player) return res.status(404).json("not found player");
    res.status(202).json(player);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/search", async (req: Request, res: Response) => {
  const { name } = req.body;
  try {
    if (typeof name !== "string" || !name) {
      res.status(400).json({ error: "Invalid name parameter" });
    }

    const foundedPlayers = await searchPlayers(`${name}`);
    res.status(201).json(foundedPlayers);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/players/:id", async (req: Request, res: Response) => {
  try {
    const playerId = req.params.id;
    const player = await deletePlayerById(playerId);
    if (!player) return res.status(404).json("not found player");
    res.status(204).json(player);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/update-players", async (req: Request, res: Response) => {
  try {
    const updatedPlayers = await updateAllPlayers();
    res.status(200).json({ 
      message: `Successfully updated ${updatedPlayers.length} players`,
      players: updatedPlayers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export { router as PlayersRouter };
