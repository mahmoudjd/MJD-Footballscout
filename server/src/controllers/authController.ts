import bcrypt from "bcryptjs";
import { AppContext, UserRegisterInput, User } from "../models/player";

export async function createUser(context: AppContext, input: UserRegisterInput): Promise<User> {
    const existingUser = await context.users.findOne({ email: input.email });
    if (existingUser) {
        throw new Error("User already exists");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const newUser = {
        email: input.email,
        name: input.name,
        passwordHash,
        createdAt: new Date(),
    };

    const result = await context.users.insertOne(newUser as any);

    return { ...newUser, _id: result.insertedId };
}

export async function findUserByEmail(context: AppContext, email: string): Promise<User | null> {
    return context.users.findOne({ email });
}
