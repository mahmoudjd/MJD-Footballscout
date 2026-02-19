import logger from "../logger/logger";
import type { AppContext } from "../models/context";
import { updateAllPlayers } from "../controllers/playerController";

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
    if (value === undefined) return fallback;
    const normalized = value.trim().toLowerCase();
    if (["1", "true", "yes", "on"].includes(normalized)) return true;
    if (["0", "false", "no", "off"].includes(normalized)) return false;
    return fallback;
}

function parseHours(value: string | undefined, fallbackHours: number): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) return fallbackHours;
    return Math.max(1, Math.floor(parsed));
}

export function startPlayersAutoUpdateScheduler(context: AppContext) {
    const enabled = parseBoolean(process.env.PLAYERS_AUTO_UPDATE_ENABLED, true);
    if (!enabled) {
        logger.info("[scheduler] Players auto-update disabled.");
        return () => undefined;
    }

    const intervalHours = parseHours(process.env.PLAYERS_AUTO_UPDATE_INTERVAL_HOURS, 12);
    const intervalMs = intervalHours * 60 * 60 * 1000;
    const runOnStartup = parseBoolean(process.env.PLAYERS_AUTO_UPDATE_RUN_ON_STARTUP, false);

    let isRunning = false;

    const runUpdate = async (trigger: "startup" | "interval") => {
        if (isRunning) {
            logger.warn(`[scheduler] Skip auto-update (${trigger}): previous run still active.`);
            return;
        }

        isRunning = true;
        const startedAt = Date.now();
        logger.info(`[scheduler] Start players auto-update (${trigger}).`);

        try {
            const updatedPlayers = await updateAllPlayers(context);
            const durationSeconds = ((Date.now() - startedAt) / 1000).toFixed(1);
            logger.info(
                `[scheduler] Finished players auto-update (${trigger}): ${updatedPlayers.length} players in ${durationSeconds}s.`,
            );
        } catch (error: any) {
            logger.error(`[scheduler] Players auto-update failed (${trigger}): ${error?.stack || error?.message || error}`);
        } finally {
            isRunning = false;
        }
    };

    const intervalHandle = setInterval(() => {
        void runUpdate("interval");
    }, intervalMs);

    logger.info(
        `[scheduler] Players auto-update scheduler started. Interval: every ${intervalHours}h. Run on startup: ${runOnStartup}.`,
    );

    if (runOnStartup) {
        void runUpdate("startup");
    }

    return () => {
        clearInterval(intervalHandle);
        logger.info("[scheduler] Players auto-update scheduler stopped.");
    };
}
