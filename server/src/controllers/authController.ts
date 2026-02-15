import bcrypt from "bcryptjs";
import {MongoServerError} from "mongodb";
import {AppContext} from "../models/context";
import {User, UserRegisterInput} from "../models/user";

type GoogleUserInput = {
    email: string;
    name: string;
    googleId: string;
};

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
        if (error instanceof MongoServerError && error.code === 11000) {
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
        if (error instanceof MongoServerError && error.code === 11000) {
            throw new Error("User already exists");
        }
        throw error;
    }
}

export async function findUserByEmail(context: AppContext, email: string) {
    return context.users.findOne({email});
}
