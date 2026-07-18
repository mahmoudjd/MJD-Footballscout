import assert from "node:assert/strict";
import test from "node:test";
import {analyzeShadowTeam} from "./shadow-team-analytics";
import {getFormationSlots} from "./shadow-team-formations";

test("calculates lineup metrics from primary candidates only", () => {
    const slots = getFormationSlots("4-3-3");
    const result = analyzeShadowTeam(
        [
            {slotId: "gk", playerIds: ["p1", "p2"]},
            {slotId: "st", playerIds: ["p3"]},
        ],
        slots,
        new Map([
            ["p1", {playerId: "p1", age: 30, elo: 80, marketValue: 10_000_000}],
            ["p2", {playerId: "p2", age: 22, elo: 75, marketValue: 5_000_000}],
            ["p3", {playerId: "p3", age: 20, elo: 70, marketValue: 20_000_000}],
        ]),
    );

    assert.equal(result.filledSlots, 2);
    assert.equal(result.missingPositions.length, 9);
    assert.deepEqual(result.overstaffedPositions, [{slotId: "gk", label: "Goalkeeper", shortLabel: "GK", count: 2}]);
    assert.equal(result.averageAge, 25);
    assert.equal(result.averageElo, 75);
    assert.equal(result.totalMarketValue, 30_000_000);
});

test("reports players assigned to multiple positions without double-counting metrics", () => {
    const slots = getFormationSlots("4-3-3");
    const result = analyzeShadowTeam(
        [
            {slotId: "lw", playerIds: ["p1"]},
            {slotId: "st", playerIds: ["p1"]},
        ],
        slots,
        new Map([["p1", {playerId: "p1", age: 24, elo: 82, marketValue: 15_000_000}]]),
    );

    assert.deepEqual(result.duplicatePlayers, [{playerId: "p1", slotIds: ["lw", "st"]}]);
    assert.equal(result.primaryPlayerCount, 1);
    assert.equal(result.totalMarketValue, 15_000_000);
});
