import assert from "node:assert/strict";
import test from "node:test";
import {calculatePlayerSimilarity} from "./player-similarity";

test("returns a perfect score when all supported properties match", () => {
    const player = {
        position: "Forward",
        age: 23,
        elo: 81,
        marketValue: 25_000_000,
        preferredFoot: "Right",
        country: "Germany",
    };

    const result = calculatePlayerSimilarity(player, player);

    assert.equal(result.score, 100);
    assert.deepEqual(result.reasons, [
        "Same position",
        "Similar age",
        "Similar ELO",
        "Similar market value",
        "Same preferred foot",
        "Same nationality",
    ]);
});

test("ranks a close same-position player above an unrelated player", () => {
    const source = {
        position: "Midfielder",
        age: 24,
        elo: 78,
        marketValue: 18_000_000,
        preferredFoot: "Left",
        country: "France",
    };
    const closeMatch = calculatePlayerSimilarity(source, {
        position: "midfielder",
        age: 25,
        elo: 76,
        marketValue: 15_000_000,
        preferredFoot: "Left",
        country: "Belgium",
    });
    const unrelated = calculatePlayerSimilarity(source, {
        position: "Goalkeeper",
        age: 34,
        elo: 55,
        marketValue: 1_000_000,
        preferredFoot: "Right",
        country: "Spain",
    });

    assert.ok(closeMatch.score > unrelated.score);
    assert.ok(closeMatch.reasons.includes("Same position"));
});

test("does not reward missing or placeholder numeric values", () => {
    const result = calculatePlayerSimilarity(
        {position: "", age: 0, elo: 0, marketValue: 0},
        {position: "", age: 0, elo: 0, marketValue: 0},
    );

    assert.equal(result.score, 0);
    assert.deepEqual(result.reasons, []);
});
