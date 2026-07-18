import {ShadowTeamAssignment} from "./shadow-team.model";
import {ShadowTeamSlotDefinition} from "./shadow-team-formations";

export interface ShadowTeamAnalyticsPlayer {
    playerId: string;
    age?: number | null;
    elo?: number | null;
    marketValue?: number | null;
}

export function analyzeShadowTeam(
    assignments: ShadowTeamAssignment[],
    slots: ShadowTeamSlotDefinition[],
    playersById: Map<string, ShadowTeamAnalyticsPlayer>,
) {
    const assignmentsBySlot = new Map(assignments.map((assignment) => [assignment.slotId, assignment.playerIds]));
    const missingPositions = slots
        .filter((slot) => (assignmentsBySlot.get(slot.id) || []).length === 0)
        .map((slot) => ({slotId: slot.id, label: slot.label, shortLabel: slot.shortLabel}));
    const overstaffedPositions = slots
        .map((slot) => ({
            slotId: slot.id,
            label: slot.label,
            shortLabel: slot.shortLabel,
            count: (assignmentsBySlot.get(slot.id) || []).length,
        }))
        .filter((slot) => slot.count > 1);

    const playerSlots = new Map<string, string[]>();
    for (const assignment of assignments) {
        for (const playerId of assignment.playerIds) {
            playerSlots.set(playerId, [...(playerSlots.get(playerId) || []), assignment.slotId]);
        }
    }
    const duplicatePlayers = Array.from(playerSlots.entries())
        .filter(([, slotIds]) => slotIds.length > 1)
        .map(([playerId, slotIds]) => ({playerId, slotIds}));

    const primaryPlayerIds = Array.from(
        new Set(assignments.map((assignment) => assignment.playerIds[0]).filter(Boolean)),
    );
    const primaryPlayers = primaryPlayerIds
        .map((playerId) => playersById.get(playerId))
        .filter((player): player is ShadowTeamAnalyticsPlayer => Boolean(player));
    const ages = primaryPlayers
        .map((player) => player.age)
        .filter((value): value is number => typeof value === "number" && Number.isFinite(value) && value > 0);
    const elos = primaryPlayers
        .map((player) => player.elo)
        .filter((value): value is number => typeof value === "number" && Number.isFinite(value) && value > 0);
    const totalMarketValue = primaryPlayers.reduce((total, player) => {
        const value = player.marketValue;
        return total + (typeof value === "number" && Number.isFinite(value) && value > 0 ? value : 0);
    }, 0);

    return {
        filledSlots: slots.length - missingPositions.length,
        totalSlots: slots.length,
        missingPositions,
        overstaffedPositions,
        duplicatePlayers,
        primaryPlayerCount: primaryPlayers.length,
        averageAge: ages.length > 0 ? Number((ages.reduce((sum, age) => sum + age, 0) / ages.length).toFixed(1)) : null,
        averageElo: elos.length > 0 ? Number((elos.reduce((sum, elo) => sum + elo, 0) / elos.length).toFixed(1)) : null,
        totalMarketValue,
    };
}
