import {describe, it} from "node:test";
import assert from "node:assert/strict";
import {
    mapPlayer,
    mapTransfers,
    mapTrophies,
    readEnvelopeErrors,
} from "./extractApiFootball";

describe("readEnvelopeErrors", () => {
    it("treats the empty array as success", () => {
        assert.deepEqual(readEnvelopeErrors({errors: [], response: []}), []);
    });

    it("reads the object form the API uses for real failures", () => {
        assert.deepEqual(
            readEnvelopeErrors({errors: {token: "Invalid API key."}}),
            ["token: Invalid API key."],
        );
    });

    it("reads a quota failure", () => {
        assert.deepEqual(
            readEnvelopeErrors({errors: {requests: "You have reached your daily limit."}}),
            ["requests: You have reached your daily limit."],
        );
    });

    it("returns nothing when the field is absent", () => {
        assert.deepEqual(readEnvelopeErrors({response: []}), []);
        assert.deepEqual(readEnvelopeErrors(undefined), []);
    });
});

describe("mapTrophies", () => {
    it("counts wins per competition and ignores runner-up rows", () => {
        const titles = mapTrophies([
            {league: "Champions League", place: "Winner"},
            {league: "Champions League", place: "Winner"},
            {league: "Champions League", place: "Runner-up"},
            {league: "Serie A", place: "Winner"},
        ]);

        assert.deepEqual(titles, [
            {name: "Champions League", number: "2"},
            {name: "Serie A", number: "1"},
        ]);
    });

    it("skips rows without a competition name", () => {
        assert.deepEqual(mapTrophies([{place: "Winner"}, {league: "  ", place: "Winner"}]), []);
    });

    it("returns nothing for an empty list", () => {
        assert.deepEqual(mapTrophies([]), []);
    });
});

describe("mapTransfers", () => {
    it("flattens the nested transfer entries", () => {
        const transfers = mapTransfers([
            {
                transfers: [
                    {date: "2021-08-10", type: "€ 40M", teams: {in: {name: "PSG"}, out: {name: "Barcelona"}}},
                    {date: "2000-07-01", type: "Free", teams: {in: {name: "Barcelona"}}},
                ],
            },
        ]);

        assert.deepEqual(transfers, [
            {season: "2021-08-10", team: "PSG", amount: "€ 40M"},
            {season: "2000-07-01", team: "Barcelona", amount: "Free"},
        ]);
    });

    it("drops transfers without an incoming team", () => {
        assert.deepEqual(mapTransfers([{transfers: [{date: "2020-01-01", type: "Loan"}]}]), []);
    });

    it("tolerates an entry without a transfers array", () => {
        assert.deepEqual(mapTransfers([{}]), []);
    });
});

describe("mapPlayer", () => {
    const profile = {
        id: 276,
        name: "Neymar",
        firstname: "Neymar",
        lastname: "da Silva Santos Júnior",
        age: 34,
        birth: {date: "1992-02-05", place: "Mogi das Cruzes", country: "Brazil"},
        nationality: "Brazil",
        height: "175 cm",
        weight: "68 kg",
        number: 10,
        position: "Attacker",
        photo: "https://media.api-sports.io/football/players/276.png",
    };

    it("maps a full profile onto the app schema", () => {
        const player = mapPlayer(profile, [{season: "2023-08-15", team: "Al Hilal", amount: "€ 90M"}], []);

        assert.ok(player);
        assert.equal(player.name, "Neymar");
        assert.equal(player.fullName, "Neymar da Silva Santos Júnior");
        assert.equal(player.age, 34);
        assert.equal(player.number, 10);
        assert.equal(player.height, 175, "unit must be stripped from '175 cm'");
        assert.equal(player.weight, 68, "unit must be stripped from '68 kg'");
        assert.equal(player.country, "Brazil");
        assert.equal(player.birthCountry, "Brazil");
        assert.equal(player.born, "1992-02-05");
        assert.equal(player.position, "Forward", "'Attacker' must normalise to the app's vocabulary");
        assert.equal(player.currentClub, "Al Hilal", "latest transfer supplies the club");
    });

    it("leaves fields the API does not carry empty so the merge prefers a scraper", () => {
        const player = mapPlayer(profile, [], []);

        assert.ok(player);
        assert.equal(player.value, "");
        assert.equal(player.currency, "");
        assert.equal(player.elo, 0);
        assert.equal(player.preferredFoot, "");
        assert.deepEqual(player.playerAttributes, []);
    });

    it("falls back to the display name when first and last name are missing", () => {
        const player = mapPlayer({name: "Pepe", age: 43}, [], []);

        assert.ok(player);
        assert.equal(player.fullName, "Pepe");
        assert.equal(player.name, "Pepe");
    });

    it("rejects a profile without any usable name", () => {
        assert.equal(mapPlayer({age: 25}, [], []), undefined);
    });

    it("defaults missing numeric fields rather than failing validation", () => {
        const player = mapPlayer({name: "Unknown Player"}, [], []);

        assert.ok(player, "a sparse profile must still validate");
        assert.equal(player.age, 0);
        assert.equal(player.number, 0);
        assert.equal(player.height, 0);
        assert.equal(player.weight, 0);
    });
});
