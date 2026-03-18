import {ObjectId} from "mongodb";
import {z} from "zod";

export const PlayerHistorySchema = z.object({
    _id: z.custom<ObjectId>(),
    playerId: z.string(),
    timestamp: z.date(),
    oldElo: z.number().nullable().optional(),
    newElo: z.number().nullable().optional(),
    eloDelta: z.number().nullable().optional(),
    oldValue: z.string().nullable().optional(),
    newValue: z.string().nullable().optional(),
    valueChanged: z.boolean(),
    oldClub: z.string().nullable().optional(),
    newClub: z.string().nullable().optional(),
    clubChanged: z.boolean(),
});

export type PlayerHistory = z.infer<typeof PlayerHistorySchema>;
