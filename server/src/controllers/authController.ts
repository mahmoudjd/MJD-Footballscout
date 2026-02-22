import bcrypt from "bcryptjs";
import {MongoServerError} from "mongodb";
import {AppContext} from "../models/context";
import {User, UserRegisterInput} from "../models/user";

type GoogleUserInput = {
    email: string;
    name: string;
    googleId: string;
};

function isDuplicateKeyError(error: unknown) {
    if (error instanceof MongoServerError && error.code === 11000) {
        return true;
    }

    if (typeof error === "object" && error !== null) {
        const maybeError = error as { code?: unknown; message?: unknown };
        if (maybeError.code === 11000) {
            return true;
        }
        if (typeof maybeError.message === "string" && maybeError.message.includes("E11000")) {
            return true;
        }
    }

    return false;
}

export async function createUser(context: AppContext, input: UserRegisterInput): Promise<User> {
    try {
        const passwordHash = await bcrypt.hash(input.password, 10);

        const newUser = {
            email: input.email,
            name: input.name,
            password: passwordHash,
            authProvider: "credentials",
            role: "user",
            createdAt: new Date(),
        };

        const result = await context.users.insertOne(newUser as any);
        return {...newUser, _id: result.insertedId};
    } catch (error: any) {
        if (isDuplicateKeyError(error)) {
            throw new Error("User already exists");
        }
        throw error;
    }
}

export async function createGoogleUser(context: AppContext, input: GoogleUserInput) {
    try {
        const newUser = {
            email: input.email,
            name: input.name,
            authProvider: "google",
            role: "user",
            createdAt: new Date(),
            googleId: input.googleId,
        };
        const result = await context.users.insertOne(newUser as any);
        return {...newUser, _id: result.insertedId};
    } catch (error: any) {
        if (isDuplicateKeyError(error)) {
            throw new Error("User already exists");
        }
        throw error;
    }
}

export async function findUserByEmail(context: AppContext, email: string) {
    return context.users.findOne({email});
}
