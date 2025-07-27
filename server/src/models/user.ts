import {z} from "zod";
import {ObjectId} from "mongodb";

export const UserRegisterInputSchema = z.object({
    email: z.string().email({message: "Invalid email address"}),
    password: z.string().min(6, {message: "Password must be at least 6 characters"}),
    name: z.string().min(2, {message: "Name must be at least 2 characters"}),
});

export const UserGoogleLoginInputSchema = z.object({
    email: z.string().email(),
    name: z.string().min(2),
})

export const UserLoginInputSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export const UserSchema = z.object({
    _id: z.custom<ObjectId>(),
    email: z.string().email(),
    name: z.string(),
    password: z.string(),
    createdAt: z.date(),
})

export type User = z.infer<typeof UserSchema>;
export type UserRegisterInput = z.infer<typeof UserRegisterInputSchema>;
export type UserLoginInput = z.infer<typeof UserLoginInputSchema>;
export type UserGoogleLoginInput = z.infer<typeof UserGoogleLoginInputSchema>;