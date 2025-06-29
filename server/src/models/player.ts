import {z} from "zod";
import {ObjectIdSchema} from "./objectId";

export const AttributeSchema = z.object({
    name: z.string(),
    value: z.string(),
});

export const TitleSchema = z.object({
    number: z.string(),
    name: z.string(),
});

export const AwardSchema = z.object({
    number: z.string(),
    name: z.string(),
});

export const TransferSchema = z.object({
    season: z.string(),
    team: z.string(),
    amount: z.string(),
});

export const BasePlayerSchema = z.object({
    name: z.string(),
    fullName: z.string(),
    age: z.number().min(0),
    number: z.number().min(0),
    currentClub: z.string(),
    image: z.string().optional(),
    caps: z.string(),
    country: z.string(),
    birthCountry: z.string().optional(),
    weight: z.number().min(0),
    height: z.number().min(0),
    position: z.string(),
    preferredFoot: z.string().optional(),
    value: z.string(),
    currency: z.string(),
    highstValue: z.string(),
    elo: z.number().min(0),
    born: z.string(),
    title: z.string(),
    status: z.string(),
    otherNation: z.string(),
    website: z.string(),
    playerAttributes: z.array(AttributeSchema),
});

export const PlayerTypeSchemaWithoutID = BasePlayerSchema.extend({
    titles: z.array(TitleSchema),
    awards: z.array(AwardSchema),
    transfers: z.array(TransferSchema),
    timestamp: z.date(),
});

export const PlayerTypeSchema = PlayerTypeSchemaWithoutID.extend(ObjectIdSchema);

export type PlayerType = z.infer<typeof PlayerTypeSchema>;
export type Attribute = z.infer<typeof AttributeSchema>;
export type Title = z.infer<typeof TitleSchema>;
export type Award = z.infer<typeof AwardSchema>;
export type Transfer = z.infer<typeof TransferSchema>;
