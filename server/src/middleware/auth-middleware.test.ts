import assert from "node:assert/strict";
import test from "node:test";
import type {Request, Response} from "express";
import jwt from "jsonwebtoken";
import {ObjectId} from "mongodb";
import type {AppContext} from "../context/types";
import {createActiveAuthMiddleware} from "./auth-middleware";

const jwtSecret = "test-secret-with-enough-entropy";

function createRequest(userId: string, authVersion: number) {
    const token = jwt.sign({userId, authVersion, tokenType: "access"}, jwtSecret);
    return {headers: {authorization: `Bearer ${token}`}} as Request;
}

function runMiddleware(
    user: {isActive?: boolean; authVersion?: number} | null,
    authVersion: number,
) {
    const userId = new ObjectId().toHexString();
    const context = {
        users: {
            findOne: async () => user,
        },
    } as unknown as AppContext;

    return new Promise<{status?: number; body?: unknown; nextCalled: boolean}>((resolve) => {
        const result: {status?: number; body?: unknown; nextCalled: boolean} = {nextCalled: false};
        const res = {
            status(status: number) {
                result.status = status;
                return this;
            },
            json(body: unknown) {
                result.body = body;
                resolve(result);
                return this;
            },
        } as unknown as Response;

        createActiveAuthMiddleware(context)(createRequest(userId, authVersion), res, () => {
            result.nextCalled = true;
            resolve(result);
        });
    });
}

test.before(() => {
    process.env.JWT_SECRET = jwtSecret;
});

test("active authentication accepts a current session", async () => {
    const result = await runMiddleware({isActive: true, authVersion: 3}, 3);

    assert.equal(result.nextCalled, true);
    assert.equal(result.status, undefined);
});

test("active authentication rejects a deactivated account", async () => {
    const result = await runMiddleware({isActive: false, authVersion: 3}, 3);

    assert.equal(result.nextCalled, false);
    assert.equal(result.status, 401);
    assert.deepEqual(result.body, {error: "Account is deactivated"});
});

test("active authentication rejects a stale session version", async () => {
    const result = await runMiddleware({isActive: true, authVersion: 4}, 3);

    assert.equal(result.nextCalled, false);
    assert.equal(result.status, 401);
    assert.deepEqual(result.body, {error: "Session is no longer valid"});
});
