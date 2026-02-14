import bcrypt from "bcryptjs";
import {AppContext} from "../models/context";
import {User, UserRegisterInput} from "../models/user";
import {UserGoogleLoginInput} from "../models/user";

export async function createUser(context: AppContext, input: UserRegisterInput): Promise<User> {
    const existingUser = await context.users.findOne({email: input.email});
    if (existingUser) {
        throw new Error("User already exists");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const newUser = {
        email: input.email,
        name: input.name,
        password: passwordHash,
        role: "user",
        createdAt: new Date(),
    };

    const result = await context.users.insertOne(newUser as any);

    return {...newUser, _id: result.insertedId};
}

export async function createGoogleUser(context: AppContext, input: UserGoogleLoginInput) {
    const newUser = {
        email: input.email,
        name: input.name,
        googleId: input.googleId,
        authProvider: "google",
        role: "user",
        createdAt: new Date(),
    }
    const result = await context.users.insertOne(newUser as any);
    return {...newUser, _id: result.insertedId};
}

export async function findUserByEmail(context: AppContext, email: string) {
    return context.users.findOne({email});
}
