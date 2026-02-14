import {ObjectId} from "mongodb";
import {z} from "zod";
import {AppContext} from "../models/context";
import {ScoutingReportInputSchema} from "../models/scoutingReport";

export class ApiError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

function toSerializedReport(report: any) {
    return {
        ...report,
        _id: String(report._id),
    };
}

function toSerializedHistory(history: any) {
    return {
        ...history,
        _id: String(history._id),
    };
}

function isValidPlayerId(playerId: string) {
    return ObjectId.isValid(playerId);
}

async function ensurePlayerExists(context: AppContext, playerId: string) {
    if (!isValidPlayerId(playerId)) {
        throw new ApiError(400, "Invalid player id");
    }
    const exists = await context.players.findOne({_id: new ObjectId(playerId)});
    if (!exists) {
        throw new ApiError(404, "Player not found");
    }
}

export async function getPlayerReports(context: AppContext, playerId: string) {
    await ensurePlayerExists(context, playerId);

    const reports = await context.scoutingReports
        .find({playerId})
        .sort({updatedAt: -1})
        .toArray();

    const ratings = reports
        .map((report) => report.rating)
        .filter((rating) => typeof rating === "number" && Number.isFinite(rating));

    const averageRating = ratings.length > 0
        ? Number((ratings.reduce((sum, current) => sum + current, 0) / ratings.length).toFixed(1))
        : null;

    const decisions = {
        watch: reports.filter((report) => report.decision === "watch").length,
        sign: reports.filter((report) => report.decision === "sign").length,
        reject: reports.filter((report) => report.decision === "reject").length,
    };

    return {
        reports: reports.map(toSerializedReport),
        summary: {
            totalReports: reports.length,
            averageRating,
            decisions,
        },
    };
}

export async function upsertPlayerReport(
    context: AppContext,
    playerId: string,
    userId: string,
    payload: unknown,
) {
    await ensurePlayerExists(context, playerId);
    const parsed = ScoutingReportInputSchema.parse(payload);
    const now = new Date();

    const existing = await context.scoutingReports.findOne({playerId, userId});
    if (existing) {
        const updated = await context.scoutingReports.findOneAndUpdate(
            {_id: existing._id},
            {
                $set: {
                    rating: parsed.rating,
                    decision: parsed.decision,
                    strengths: parsed.strengths,
                    weaknesses: parsed.weaknesses,
                    notes: parsed.notes,
                    updatedAt: now,
                },
            },
            {returnDocument: "after"},
        );

        if (!updated) {
            throw new ApiError(500, "Failed to update scouting report");
        }

        return toSerializedReport(updated);
    }

    const created = {
        playerId,
        userId,
        rating: parsed.rating,
        decision: parsed.decision,
        strengths: parsed.strengths,
        weaknesses: parsed.weaknesses,
        notes: parsed.notes,
        createdAt: now,
        updatedAt: now,
    };

    const result = await context.scoutingReports.insertOne(created as any);
    return toSerializedReport({...created, _id: result.insertedId});
}

export async function updateScoutingReport(
    context: AppContext,
    reportId: string,
    userId: string,
    payload: unknown,
) {
    if (!ObjectId.isValid(reportId)) {
        throw new ApiError(400, "Invalid report id");
    }
    const parsed = ScoutingReportInputSchema.parse(payload);
    const report = await context.scoutingReports.findOne({_id: new ObjectId(reportId)});
    if (!report) {
        throw new ApiError(404, "Scouting report not found");
    }
    if (report.userId !== userId) {
        throw new ApiError(403, "You can only edit your own report");
    }

    const updated = await context.scoutingReports.findOneAndUpdate(
        {_id: new ObjectId(reportId)},
        {
            $set: {
                rating: parsed.rating,
                decision: parsed.decision,
                strengths: parsed.strengths,
                weaknesses: parsed.weaknesses,
                notes: parsed.notes,
                updatedAt: new Date(),
            },
        },
        {returnDocument: "after"},
    );

    if (!updated) {
        throw new ApiError(500, "Failed to update scouting report");
    }

    return toSerializedReport(updated);
}

export async function deleteScoutingReport(context: AppContext, reportId: string, userId: string) {
    if (!ObjectId.isValid(reportId)) {
        throw new ApiError(400, "Invalid report id");
    }

    const report = await context.scoutingReports.findOne({_id: new ObjectId(reportId)});
    if (!report) {
        throw new ApiError(404, "Scouting report not found");
    }
    if (report.userId !== userId) {
        throw new ApiError(403, "You can only delete your own report");
    }

    const deleted = await context.scoutingReports.deleteOne({_id: new ObjectId(reportId)});
    if (!deleted.acknowledged) {
        throw new ApiError(500, "Failed to delete scouting report");
    }
}

function buildHistoryAlert(entry: any) {
    const alerts: Array<{type: string; severity: "low" | "medium" | "high"; message: string; timestamp: Date}> = [];
    const timestamp = entry.timestamp ? new Date(entry.timestamp) : new Date();

    if (typeof entry.eloDelta === "number" && entry.eloDelta !== 0) {
        const absoluteDelta = Math.abs(entry.eloDelta);
        const severity: "low" | "medium" | "high" = absoluteDelta >= 25 ? "high" : absoluteDelta >= 10 ? "medium" : "low";
        alerts.push({
            type: "elo",
            severity,
            message: `ELO changed by ${entry.eloDelta > 0 ? "+" : ""}${entry.eloDelta}`,
            timestamp,
        });
    }

    if (entry.valueChanged) {
        alerts.push({
            type: "value",
            severity: "medium",
            message: `Market value changed from ${entry.oldValue || "-"} to ${entry.newValue || "-"}`,
            timestamp,
        });
    }

    if (entry.clubChanged) {
        alerts.push({
            type: "club",
            severity: "high",
            message: `Club changed from ${entry.oldClub || "-"} to ${entry.newClub || "-"}`,
            timestamp,
        });
    }

    return alerts;
}

export async function getPlayerHistory(context: AppContext, playerId: string, query: Record<string, unknown>) {
    await ensurePlayerExists(context, playerId);
    const parsed = z.object({
        limit: z.coerce.number().int().min(1).max(100).default(30),
    }).parse({
        limit: Array.isArray(query.limit) ? query.limit[0] : query.limit,
    });

    const history = await context.playerHistories
        .find({playerId})
        .sort({timestamp: -1})
        .limit(parsed.limit)
        .toArray();

    const alerts = history
        .flatMap((entry) => buildHistoryAlert(entry))
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 20);

    return {
        history: history.map(toSerializedHistory),
        alerts,
    };
}
