export type ShadowTeamFormation = "4-3-3" | "4-2-3-1" | "4-4-2" | "3-5-2";
export type ShadowTeamPositionGroup = "Goalkeeper" | "Defender" | "Midfielder" | "Forward";

export interface ShadowTeamSlotDefinition {
    id: string;
    label: string;
    shortLabel: string;
    positionGroup: ShadowTeamPositionGroup;
    x: number;
    y: number;
}

export const SHADOW_TEAM_FORMATIONS: Record<ShadowTeamFormation, ShadowTeamSlotDefinition[]> = {
    "4-3-3": [
        {id: "gk", label: "Goalkeeper", shortLabel: "GK", positionGroup: "Goalkeeper", x: 50, y: 90},
        {id: "lb", label: "Left Back", shortLabel: "LB", positionGroup: "Defender", x: 14, y: 70},
        {id: "lcb", label: "Left Centre Back", shortLabel: "LCB", positionGroup: "Defender", x: 38, y: 76},
        {id: "rcb", label: "Right Centre Back", shortLabel: "RCB", positionGroup: "Defender", x: 62, y: 76},
        {id: "rb", label: "Right Back", shortLabel: "RB", positionGroup: "Defender", x: 86, y: 70},
        {id: "lcm", label: "Left Central Midfield", shortLabel: "LCM", positionGroup: "Midfielder", x: 27, y: 49},
        {id: "dm", label: "Defensive Midfield", shortLabel: "DM", positionGroup: "Midfielder", x: 50, y: 59},
        {id: "rcm", label: "Right Central Midfield", shortLabel: "RCM", positionGroup: "Midfielder", x: 73, y: 49},
        {id: "lw", label: "Left Wing", shortLabel: "LW", positionGroup: "Forward", x: 17, y: 25},
        {id: "st", label: "Striker", shortLabel: "ST", positionGroup: "Forward", x: 50, y: 14},
        {id: "rw", label: "Right Wing", shortLabel: "RW", positionGroup: "Forward", x: 83, y: 25},
    ],
    "4-2-3-1": [
        {id: "gk", label: "Goalkeeper", shortLabel: "GK", positionGroup: "Goalkeeper", x: 50, y: 90},
        {id: "lb", label: "Left Back", shortLabel: "LB", positionGroup: "Defender", x: 14, y: 70},
        {id: "lcb", label: "Left Centre Back", shortLabel: "LCB", positionGroup: "Defender", x: 38, y: 76},
        {id: "rcb", label: "Right Centre Back", shortLabel: "RCB", positionGroup: "Defender", x: 62, y: 76},
        {id: "rb", label: "Right Back", shortLabel: "RB", positionGroup: "Defender", x: 86, y: 70},
        {id: "ldm", label: "Left Defensive Midfield", shortLabel: "LDM", positionGroup: "Midfielder", x: 34, y: 56},
        {id: "rdm", label: "Right Defensive Midfield", shortLabel: "RDM", positionGroup: "Midfielder", x: 66, y: 56},
        {id: "lw", label: "Left Wing", shortLabel: "LW", positionGroup: "Forward", x: 18, y: 31},
        {id: "am", label: "Attacking Midfield", shortLabel: "AM", positionGroup: "Midfielder", x: 50, y: 36},
        {id: "rw", label: "Right Wing", shortLabel: "RW", positionGroup: "Forward", x: 82, y: 31},
        {id: "st", label: "Striker", shortLabel: "ST", positionGroup: "Forward", x: 50, y: 14},
    ],
    "4-4-2": [
        {id: "gk", label: "Goalkeeper", shortLabel: "GK", positionGroup: "Goalkeeper", x: 50, y: 90},
        {id: "lb", label: "Left Back", shortLabel: "LB", positionGroup: "Defender", x: 14, y: 70},
        {id: "lcb", label: "Left Centre Back", shortLabel: "LCB", positionGroup: "Defender", x: 38, y: 76},
        {id: "rcb", label: "Right Centre Back", shortLabel: "RCB", positionGroup: "Defender", x: 62, y: 76},
        {id: "rb", label: "Right Back", shortLabel: "RB", positionGroup: "Defender", x: 86, y: 70},
        {id: "lm", label: "Left Midfield", shortLabel: "LM", positionGroup: "Midfielder", x: 16, y: 45},
        {id: "lcm", label: "Left Central Midfield", shortLabel: "LCM", positionGroup: "Midfielder", x: 39, y: 50},
        {id: "rcm", label: "Right Central Midfield", shortLabel: "RCM", positionGroup: "Midfielder", x: 61, y: 50},
        {id: "rm", label: "Right Midfield", shortLabel: "RM", positionGroup: "Midfielder", x: 84, y: 45},
        {id: "ls", label: "Left Striker", shortLabel: "LS", positionGroup: "Forward", x: 36, y: 18},
        {id: "rs", label: "Right Striker", shortLabel: "RS", positionGroup: "Forward", x: 64, y: 18},
    ],
    "3-5-2": [
        {id: "gk", label: "Goalkeeper", shortLabel: "GK", positionGroup: "Goalkeeper", x: 50, y: 90},
        {id: "lcb", label: "Left Centre Back", shortLabel: "LCB", positionGroup: "Defender", x: 25, y: 72},
        {id: "cb", label: "Centre Back", shortLabel: "CB", positionGroup: "Defender", x: 50, y: 77},
        {id: "rcb", label: "Right Centre Back", shortLabel: "RCB", positionGroup: "Defender", x: 75, y: 72},
        {id: "lwb", label: "Left Wing Back", shortLabel: "LWB", positionGroup: "Defender", x: 12, y: 48},
        {id: "lcm", label: "Left Central Midfield", shortLabel: "LCM", positionGroup: "Midfielder", x: 34, y: 50},
        {id: "dm", label: "Defensive Midfield", shortLabel: "DM", positionGroup: "Midfielder", x: 50, y: 60},
        {id: "rcm", label: "Right Central Midfield", shortLabel: "RCM", positionGroup: "Midfielder", x: 66, y: 50},
        {id: "rwb", label: "Right Wing Back", shortLabel: "RWB", positionGroup: "Defender", x: 88, y: 48},
        {id: "ls", label: "Left Striker", shortLabel: "LS", positionGroup: "Forward", x: 36, y: 18},
        {id: "rs", label: "Right Striker", shortLabel: "RS", positionGroup: "Forward", x: 64, y: 18},
    ],
};

export function getFormationSlots(formation: ShadowTeamFormation) {
    return SHADOW_TEAM_FORMATIONS[formation];
}
