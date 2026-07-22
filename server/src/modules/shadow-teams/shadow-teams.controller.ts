import {ObjectId} from "mongodb";
import {AppContext} from "../../context/types";
import {normalizePosition} from "../../scraper/position";
import {parseCompactCurrency} from "../players/players.controller";
import {calculatePlayerSimilarity, PlayerSimilarityInput} from "../players/player-similarity";
import {ApiError} from "../../middleware/customErrors";
import {analyzeShadowTeam, ShadowTeamAnalyticsPlayer} from "./shadow-team-analytics";
import {getFormationSlots} from "./shadow-team-formations";
import {
    ShadowTeamAssignment,
    ShadowTeamCreateSchema,
    ShadowTeamFormation,
    ShadowTeamUpdateSchema,
} from "./shadow-team.model";

function serializeShadowTeam(team: any) {
    return {...team, _id: String(team._id)};
}

function serializePlayer(player: any) {
    return {
        ...player,
        _id: String(player._id),
        image: player.image || "",
        position: normalizePosition(player.position),
    };
}

function toSimilarityInput(player: any): PlayerSimilarityInput {
    return {
        position: normalizePosition(player?.position),
        age: typeof player?.age === "number" ? player.age : null,
        elo: typeof player?.elo === "number" ? player.elo : null,
        marketValue: parseCompactCurrency(player?.value, player?.currency),
        preferredFoot: player?.preferredFoot,
        country: player?.country,
    };
}

async function ensureShadowTeam(context: AppContext, teamId: string, userId: string) {
    if (!ObjectId.isValid(teamId)) {
        throw new ApiError(400, "Invalid shadow team id");
    }
    const team = await context.shadowTeams.findOne({_id: new ObjectId(teamId), userId});
    if (!team) {
        throw new ApiError(404, "Shadow team not found");
    }
    return team;
}

async function validateAssignments(
    context: AppContext,
    formation: ShadowTeamFormation,
    assignments: ShadowTeamAssignment[],
) {
    const validSlotIds = new Set(getFormationSlots(formation).map((slot) => slot.id));
    const seenSlotIds = new Set<string>();
    const normalizedAssignments = assignments.map((assignment) => {
        if (!validSlotIds.has(assignment.slotId)) {
            throw new ApiError(400, `Invalid slot ${assignment.slotId} for formation ${formation}`);
        }
        if (seenSlotIds.has(assignment.slotId)) {
            throw new ApiError(400, `Duplicate slot assignment ${assignment.slotId}`);
        }
        seenSlotIds.add(assignment.slotId);
        return {
            slotId: assignment.slotId,
            playerIds: Array.from(new Set(assignment.playerIds)),
        };
    });

    const playerIds = Array.from(new Set(normalizedAssignments.flatMap((assignment) => assignment.playerIds)));
    if (playerIds.some((playerId) => !ObjectId.isValid(playerId))) {
        throw new ApiError(400, "One or more player ids are invalid");
    }
    if (playerIds.length > 0) {
        const existingPlayerCount = await context.players.countDocuments({
            _id: {$in: playerIds.map((playerId) => new ObjectId(playerId))},
        });
        if (existingPlayerCount !== playerIds.length) {
            throw new ApiError(404, "One or more players were not found");
        }
    }

    return normalizedAssignments.filter((assignment) => assignment.playerIds.length > 0);
}

export async function listShadowTeams(context: AppContext, userId: string) {
    const teams = await context.shadowTeams.find({userId}).sort({updatedAt: -1}).toArray();
    return teams.map((team) => ({
        ...serializeShadowTeam(team),
        filledSlots: team.assignments.filter((assignment) => assignment.playerIds.length > 0).length,
        candidateCount: new Set(team.assignments.flatMap((assignment) => assignment.playerIds)).size,
    }));
}

export async function getShadowTeam(context: AppContext, teamId: string, userId: string) {
    const team = await ensureShadowTeam(context, teamId, userId);
    const slots = getFormationSlots(team.formation);
    const allPlayers = await context.players.find().toArray();
    const playersById = new Map(allPlayers.map((player) => [String(player._id), player]));
    const assignedPlayerIds = Array.from(new Set(team.assignments.flatMap((assignment) => assignment.playerIds)));
    const assignedPlayers = assignedPlayerIds.map((playerId) => playersById.get(playerId)).filter(Boolean);
    const analyticsPlayers = new Map<string, ShadowTeamAnalyticsPlayer>(
        assignedPlayers.map((player: any) => [
            String(player._id),
            {
                playerId: String(player._id),
                age: player.age,
                elo: player.elo,
                marketValue: parseCompactCurrency(player.value, player.currency),
            },
        ]),
    );
    const analytics = analyzeShadowTeam(team.assignments, slots, analyticsPlayers);
    const assignedSet = new Set(assignedPlayerIds);
    const assignmentsBySlot = new Map(team.assignments.map((assignment) => [assignment.slotId, assignment.playerIds]));

    const alternatives = slots.map((slot) => {
        const primaryPlayerId = assignmentsBySlot.get(slot.id)?.[0];
        const primaryPlayer = primaryPlayerId ? playersById.get(primaryPlayerId) : null;
        const primaryInput = primaryPlayer ? toSimilarityInput(primaryPlayer) : null;
        const players = allPlayers
            .filter((player) => !assignedSet.has(String(player._id)))
            .filter((player) => normalizePosition(player.position) === slot.positionGroup)
            .map((player) => {
                if (primaryInput) {
                    const similarity = calculatePlayerSimilarity(primaryInput, toSimilarityInput(player));
                    return {player: serializePlayer(player), score: similarity.score, reasons: similarity.reasons};
                }
                const elo = typeof player.elo === "number" ? player.elo : 0;
                return {
                    player: serializePlayer(player),
                    score: Math.max(0, Math.min(100, Math.round(elo))),
                    reasons: [`Matches ${slot.positionGroup.toLowerCase()} role`, `ELO ${elo}`],
                };
            })
            .sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                return (b.player.elo || 0) - (a.player.elo || 0);
            })
            .slice(0, 3);
        return {slotId: slot.id, players};
    });

    return {
        ...serializeShadowTeam(team),
        slots,
        players: assignedPlayers.map(serializePlayer),
        analytics,
        alternatives,
    };
}

export async function createShadowTeam(context: AppContext, userId: string, payload: unknown) {
    const parsed = ShadowTeamCreateSchema.parse(payload);
    const now = new Date();
    const created = {
        userId,
        name: parsed.name,
        formation: parsed.formation,
        assignments: [] as ShadowTeamAssignment[],
        createdAt: now,
        updatedAt: now,
    };
    const result = await context.shadowTeams.insertOne(created as any);
    return serializeShadowTeam({...created, _id: result.insertedId});
}

export async function updateShadowTeam(context: AppContext, teamId: string, userId: string, payload: unknown) {
    const parsed = ShadowTeamUpdateSchema.parse(payload);
    const team = await ensureShadowTeam(context, teamId, userId);
    const assignments = await validateAssignments(context, parsed.formation, parsed.assignments);
    const updated = await context.shadowTeams.findOneAndUpdate(
        {_id: team._id},
        {$set: {name: parsed.name, formation: parsed.formation, assignments, updatedAt: new Date()}},
        {returnDocument: "after"},
    );
    if (!updated) {
        throw new ApiError(500, "Failed to update shadow team");
    }
    return serializeShadowTeam(updated);
}

export async function deleteShadowTeam(context: AppContext, teamId: string, userId: string) {
    const team = await ensureShadowTeam(context, teamId, userId);
    const deleted = await context.shadowTeams.deleteOne({_id: team._id});
    if (!deleted.acknowledged) {
        throw new ApiError(500, "Failed to delete shadow team");
    }
}
