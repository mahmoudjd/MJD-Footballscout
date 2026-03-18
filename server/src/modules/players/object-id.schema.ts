import {ObjectId} from "mongodb"
import {z} from "zod";

export const ObjectIdSchema = z.object({
    _id: z.custom<ObjectId>((val) => val instanceof ObjectId, {
        message: "_id must be a valid ObjectId",
    })
})