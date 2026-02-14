import {ObjectId} from "mongodb";
import {z} from "zod";

export const DecisionSchema = z.enum(["watch", "sign", "reject"]);

export const ScoutingReportInputSchema = z.object({
    rating: z.number().min(1).max(10),
    decision: DecisionSchema,
    strengths: z.array(z.string()).default([]),
    weaknesses: z.array(z.string()).default([]),
    notes: z.string().max(5000).optional().default(""),
});

export const ScoutingReportSchema = z.object({
    _id: z.custom<ObjectId>(),
    playerId: z.string(),
    userId: z.string(),
    rating: z.number().min(1).max(10),
    decision: DecisionSchema,
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    notes: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type ScoutingReportInput = z.infer<typeof ScoutingReportInputSchema>;
export type ScoutingReport = z.infer<typeof ScoutingReportSchema>;
