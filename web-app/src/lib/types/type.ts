import {z} from "zod";

export const AwardSchema = z.object({
    name: z.string(),
    number: z.string(),
});

export const AttributeSchema = z.object({
    name: z.string(),
    value: z.string(),
});

export const TitleSchema = z.object({
    name: z.string(),
    number: z.string(),
});

export const TransferSchema = z.object({
    season: z.string(),
    team: z.string(),
    amount: z.string(),
});

export const PlayerSchema = z.object({
    _id: z.string(),
    title: z.string(),
    name: z.string(),
    age: z.number(),
    number: z.number(),
    fullName: z.string(),
    currentClub: z.string(),
    image: z.string(),
    caps: z.string(),
    country: z.string(),
    birthCountry: z.string().optional(),
    weight: z.number(),
    height: z.number(),
    status: z.string(),
    position: z.string(),
    preferredFoot: z.string().optional(),
    value: z.string(),
    website: z.string(),
    currency: z.string(),
    highstValue: z.string(),
    otherNation: z.string(),
    elo: z.number(),
    born: z.string(),
    playerAttributes: z.array(AttributeSchema),
    titles: z.array(TitleSchema),
    awards: z.array(AwardSchema),
    transfers: z.array(TransferSchema),
    timestamp: z.coerce.date(),
});


export type AttributeType = z.infer<typeof AttributeSchema>
export type AwardType = z.infer<typeof AwardSchema>
export type TransferType = z.infer<typeof TransferSchema>
export type TitleType = z.infer<typeof TitleSchema>
export type PlayerType = z.infer<typeof PlayerSchema>;
