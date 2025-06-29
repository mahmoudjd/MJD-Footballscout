import express, {Request, Response} from "express";
import {
    createPlayer, deletePlayerById,
    getPlayerById,
    getPlayers,
    searchPlayers, updateAllPlayers,
    updatePlayerFromWebSites
} from "../controllers/playerController";
import {AppContext} from "../models/player";
import logger from "../logger/logger";
import {authMiddleware} from "../middleware/auth-middleware";

const createPlayersRouter = (context: AppContext) => {
    const router = express.Router();

    router.get("/players", async (req: Request, res: Response) => {
        try {
            const players = await getPlayers(context);
            res.status(200).json(players);
        } catch (error) {
            logger.error("Failed to get players: ", error);
            res.status(500).json({error: "Internal server error"});
        }
    });

    // Authentifizierte Routen
    router.post("/players", authMiddleware, async (req: Request, res: Response): Promise<any> => {
        const {data} = req.body;
        try {
            const player = await createPlayer(context, data);
            return res.status(200).json(player);
        } catch (error) {
            logger.error("Failed to save player: ", error);
            res.status(500).json({error: "Internal server error"});
        }
    });

    router.get("/players/:id", authMiddleware, async (req: Request, res: Response): Promise<any> => {
        const playerId = req.params.id;
        try {
            const player = await getPlayerById(context, playerId);
            if (!player) return res.status(404).json("not found player");
            res.status(200).json(player);
        } catch (error) {
            logger.error("Failed to get player: ", error);
            res.status(500).json({error: "Internal server error"});
        }
    });

    router.put("/players/:id", authMiddleware, async (req: Request, res: Response): Promise<any> => {
        const playerId = req.params.id;
        try {
            const player = await updatePlayerFromWebSites(context, playerId);
            if (!player) return res.status(404).json("not found player");
            res.status(202).json(player);
        } catch (error) {
            logger.error("Failed to update player: ", error);
            res.status(500).json({error: "Internal server error"});
        }
    });

    router.post("/search", async (req: Request, res: Response): Promise<any> => {
        const {name} = req.body;
        try {
            if (!name || typeof name !== "string") {
                return res.status(400).json({error: "Invalid name parameter"});
            }

            const foundedPlayers = await searchPlayers(context, name);
            res.status(200).json(foundedPlayers);
        } catch (error) {
            logger.error("Search Failed with error: ", error);
            res.status(500).json({error: "Internal server error"});
        }
    });

    router.delete("/players/:id", authMiddleware, async (req: Request, res: Response): Promise<any> => {
        const playerId = req.params.id;
        try {
            const player = await deletePlayerById(context, playerId);
            if (!player) return res.status(404).json("not found player");
            res.status(204).end();
        } catch (error) {
            logger.error("Failed to delete player: ", error);
            res.status(500).json({error: "Internal server error"});
        }
    });

    router.put("/update-players", authMiddleware, async (_req: Request, res: Response) => {
        try {
            const updatedPlayers = await updateAllPlayers(context);
            res.status(200).json({
                message: `Successfully updated ${updatedPlayers.length} players`,
                players: updatedPlayers,
            });
        } catch (error) {
            logger.error("Failed to update all players: ", error);
            res.status(500).json({error: "Internal server error"});
        }
    });

    return router;
};

export default createPlayersRouter;
