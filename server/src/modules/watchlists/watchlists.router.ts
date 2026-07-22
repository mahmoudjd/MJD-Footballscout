import express, { Request, Response } from "express";
import { AppContext } from "../../context/types";
import { createActiveAuthMiddleware } from "../../middleware/auth-middleware";
import { handleControllerError } from "../../middleware/controller-error-handler";
import { createFeatureRequestLogger } from "../../middleware/feature-request-logger";
import { disablePrivateApiCaching } from "../../middleware/private-api-cache";
import { getAuthenticatedUserId, getRouteParam } from "../../shared/http";
import {
  addPlayerToWatchlist,
  createWatchlist,
  deleteWatchlist,
  getWatchlist,
  listWatchlists,
  removePlayerFromWatchlist,
  reorderWatchlistPlayers,
  updateWatchlist,
} from "./watchlists.controller";

export default function createWatchlistsRouter(context: AppContext) {
  const router = express.Router();
  router.use(disablePrivateApiCaching);
  router.use(createFeatureRequestLogger("watchlist"));
  router.use(createActiveAuthMiddleware(context));

  router.get("/", async (req: Request, res: Response) => {
    const userId = getAuthenticatedUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    try {
      const watchlists = await listWatchlists(context, userId);
      return res.status(200).json(watchlists);
    } catch (error) {
      return handleControllerError("watchlist", "list", error, req, res);
    }
  });

  router.post("/", async (req: Request, res: Response) => {
    const userId = getAuthenticatedUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    try {
      const watchlist = await createWatchlist(context, userId, req.body);
      return res.status(201).json(watchlist);
    } catch (error) {
      return handleControllerError("watchlist", "create", error, req, res);
    }
  });

  router.get("/:id", async (req: Request, res: Response) => {
    const userId = getAuthenticatedUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    try {
      const watchlist = await getWatchlist(
        context,
        getRouteParam(req.params.id),
        userId,
      );
      return res.status(200).json(watchlist);
    } catch (error) {
      return handleControllerError("watchlist", "get-detail", error, req, res);
    }
  });

  router.put("/:id", async (req: Request, res: Response) => {
    const userId = getAuthenticatedUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    try {
      const watchlist = await updateWatchlist(
        context,
        getRouteParam(req.params.id),
        userId,
        req.body,
      );
      return res.status(200).json(watchlist);
    } catch (error) {
      return handleControllerError("watchlist", "update", error, req, res);
    }
  });

  router.delete("/:id", async (req: Request, res: Response) => {
    const userId = getAuthenticatedUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    try {
      await deleteWatchlist(context, getRouteParam(req.params.id), userId);
      return res.status(204).send();
    } catch (error) {
      return handleControllerError("watchlist", "delete", error, req, res);
    }
  });

  router.post("/:id/players", async (req: Request, res: Response) => {
    const userId = getAuthenticatedUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    try {
      const watchlist = await addPlayerToWatchlist(
        context,
        getRouteParam(req.params.id),
        userId,
        req.body,
      );
      return res.status(200).json(watchlist);
    } catch (error) {
      return handleControllerError("watchlist", "add-player", error, req, res);
    }
  });

  router.delete(
    "/:id/players/:playerId",
    async (req: Request, res: Response) => {
      const userId = getAuthenticatedUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      try {
        const watchlist = await removePlayerFromWatchlist(
          context,
          getRouteParam(req.params.id),
          userId,
          getRouteParam(req.params.playerId),
        );
        return res.status(200).json(watchlist);
      } catch (error) {
        return handleControllerError(
          "watchlist",
          "remove-player",
          error,
          req,
          res,
        );
      }
    },
  );

  router.put("/:id/players/reorder", async (req: Request, res: Response) => {
    const userId = getAuthenticatedUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    try {
      const watchlist = await reorderWatchlistPlayers(
        context,
        getRouteParam(req.params.id),
        userId,
        req.body,
      );
      return res.status(200).json(watchlist);
    } catch (error) {
      return handleControllerError(
        "watchlist",
        "reorder-players",
        error,
        req,
        res,
      );
    }
  });

  return router;
}
