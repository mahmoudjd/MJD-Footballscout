import assert from "node:assert/strict";
import test from "node:test";
import {normalizePosition} from "./position";

test("normalizes BeSoccer abbreviations regardless of casing", () => {
    assert.equal(normalizePosition("For"), "Forward");
    assert.equal(normalizePosition(" for "), "Forward");
    assert.equal(normalizePosition("DEF"), "Defender");
    assert.equal(normalizePosition("mid"), "Midfielder");
    assert.equal(normalizePosition("GOA"), "Goalkeeper");
});

test("normalizes detailed position labels", () => {
    assert.equal(normalizePosition("Centre-Forward"), "Forward");
    assert.equal(normalizePosition("Left Winger"), "Forward");
    assert.equal(normalizePosition("Centre-Back"), "Defender");
    assert.equal(normalizePosition("Defensive Midfield"), "Midfielder");
    assert.equal(normalizePosition("Goalkeeper"), "Goalkeeper");
});

test("does not confuse unrelated words containing 'for' with forward", () => {
    assert.equal(normalizePosition("Former player"), "Former player");
    assert.equal(normalizePosition(""), "");
});
