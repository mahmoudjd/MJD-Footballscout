import bcrypt from "bcryptjs";
import { MongoServerError } from "mongodb";
import { AppContext } from "../../context/types";
import { User, UserRegisterInput } from "./user.model";

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
    if (
      typeof maybeError.message === "string" &&
      maybeError.message.includes("E11000")
    ) {
      return true;
    }
  }

  return false;
}

export async function createUser(
  context: AppContext,
  input: UserRegisterInput,
): Promise<User> {
  try {
    const passwordHash = await bcrypt.hash(input.password, 10);

    const newUser: Omit<User, "_id"> = {
      email: input.email.trim().toLowerCase(),
      name: input.name,
      password: passwordHash,
      authProvider: "credentials",
      role: "user",
      isActive: true,
      securityEmailsEnabled: true,
      onboardingEmailsEnabled: true,
      onboardingStartedAt: new Date(),
      emailVerificationRequired: true,
      authVersion: 0,
      createdAt: new Date(),
    };

    const result = await context.users.insertOne(newUser as any);
    return { ...newUser, _id: result.insertedId };
  } catch (error: any) {
    if (isDuplicateKeyError(error)) {
      throw new Error("User already exists");
    }
    throw error;
  }
}

export async function createGoogleUser(
  context: AppContext,
  input: GoogleUserInput,
): Promise<User> {
  try {
    const newUser: Omit<User, "_id"> = {
      email: input.email.trim().toLowerCase(),
      name: input.name,
      authProvider: "google",
      role: "user",
      isActive: true,
      emailVerifiedAt: new Date(),
      securityEmailsEnabled: true,
      onboardingEmailsEnabled: true,
      onboardingStartedAt: new Date(),
      authVersion: 0,
      createdAt: new Date(),
      googleId: input.googleId,
    };
    const result = await context.users.insertOne(newUser as any);
    return { ...newUser, _id: result.insertedId };
  } catch (error: any) {
    if (isDuplicateKeyError(error)) {
      throw new Error("User already exists");
    }
    throw error;
  }
}

export async function findUserByEmail(context: AppContext, email: string) {
  return context.users.findOne({ email: email.trim().toLowerCase() });
}
