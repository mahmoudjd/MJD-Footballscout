import {z} from "zod";
import {ObjectId} from "mongodb";

export const UserRegisterInputSchema = z.object({
    email: z.string().email({message: "Invalid email address"}),
    password: z.string().min(6, {message: "Password must be at least 6 characters"}),
    name: z.string().min(2, {message: "Name must be at least 2 characters"}),
});

export const UserGoogleLoginInputSchema = z.object({
    idToken: z.string().min(1),
});

export const UserLoginInputSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export const UserSchema = z.object({
    _id: z.custom<ObjectId>(),
    email: z.string().email(),
    name: z.string(),
    role: z.enum(["admin", "user"]).default("user"),
    password: z.string().optional(),
    authProvider: z.enum(["credentials", "google"]).optional(),
    googleId: z.string().optional(),
    isActive: z.boolean().optional(),
    billingPlan: z.enum(["free", "premium"]).optional(),
    subscriptionStatus: z
        .enum([
            "inactive",
            "trialing",
            "active",
            "past_due",
            "canceled",
            "unpaid",
            "incomplete",
            "incomplete_expired",
            "paused",
        ])
        .optional(),
    stripeCustomerId: z.string().optional(),
    stripeSubscriptionId: z.string().optional(),
    stripeProductId: z.string().optional(),
    subscriptionCurrentPeriodEnd: z.date().optional(),
    subscriptionCancelAtPeriodEnd: z.boolean().optional(),
    createdAt: z.date(),
    updatedAt: z.date().optional(),
});

export type User = z.infer<typeof UserSchema>;
export type UserRegisterInput = z.infer<typeof UserRegisterInputSchema>;
export type UserLoginInput = z.infer<typeof UserLoginInputSchema>;
export type UserGoogleLoginInput = z.infer<typeof UserGoogleLoginInputSchema>;
