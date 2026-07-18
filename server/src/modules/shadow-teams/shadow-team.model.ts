import {ObjectId} from "mongodb";
import {z} from "zod";

export const ShadowTeamFormationSchema = z.enum(["4-3-3", "4-2-3-1", "4-4-2", "3-5-2"]);

export const ShadowTeamAssignmentSchema = z.object({
    slotId: z.string().trim().min(1),
    playerIds: z.array(z.string().trim().min(1)).max(5).default([]),
});

export const ShadowTeamSchema = z.object({
    _id: z.custom<ObjectId>(),
    userId: z.string(),
    name: z.string().trim().min(1).max(80),
    formation: ShadowTeamFormationSchema,
    assignments: z.array(ShadowTeamAssignmentSchema).default([]),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const ShadowTeamCreateSchema = z.object({
    name: z.string().trim().min(1).max(80),
    formation: ShadowTeamFormationSchema.default("4-3-3"),
});

export const ShadowTeamUpdateSchema = z.object({
    name: z.string().trim().min(1).max(80),
    formation: ShadowTeamFormationSchema,
    assignments: z.array(ShadowTeamAssignmentSchema).max(11),
});

export type ShadowTeam = z.infer<typeof ShadowTeamSchema>;
export type ShadowTeamAssignment = z.infer<typeof ShadowTeamAssignmentSchema>;
export type ShadowTeamFormation = z.infer<typeof ShadowTeamFormationSchema>;
