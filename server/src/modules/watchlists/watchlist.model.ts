import {ObjectId} from "mongodb";
import {z} from "zod";

export const WatchlistSchema = z.object({
    _id: z.custom<ObjectId>(),
    userId: z.string(),
    name: z.string().min(1),
    description: z.string().optional().default(""),
    playerIds: z.array(z.string()).default([]),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const WatchlistInputSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional().default(""),
});

export type Watchlist = z.infer<typeof WatchlistSchema>;
export type WatchlistInput = z.infer<typeof WatchlistInputSchema>;
