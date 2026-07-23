/**
 * Live check against API-Football. The unit tests cover the mapping with fixed
 * fixtures; this verifies the assumption behind them — that the endpoints and
 * field names actually look the way the adapter expects.
 *
 *   API_FOOTBALL_KEY=xxx npx tsx src/scraper/probe-api-football.ts "Hjulmand"
 *
 * Costs 4 requests of the daily quota.
 */
import axios from "axios";

const apiKey = process.env.API_FOOTBALL_KEY;
const baseURL = process.env.API_FOOTBALL_BASE_URL || "https://v3.football.api-sports.io";
const search = process.argv[2] || "Hjulmand";

if (!apiKey) {
    console.error("API_FOOTBALL_KEY is not set.");
    process.exit(1);
}

const isRapidApi = baseURL.includes("rapidapi.com");
const http = axios.create({
    baseURL,
    timeout: 15_000,
    headers: isRapidApi
        ? {"x-rapidapi-key": apiKey, "x-rapidapi-host": new URL(baseURL).hostname}
        : {"x-apisports-key": apiKey},
});

async function probe(path: string, params: Record<string, string | number>) {
    console.log(`\n──────── GET ${path} ${JSON.stringify(params)}`);
    try {
        const {status, data} = await http.get(path, {params, validateStatus: () => true});
        console.log(`HTTP ${status}  results=${data?.results}  errors=${JSON.stringify(data?.errors)}`);
        const first = Array.isArray(data?.response) ? data.response[0] : undefined;
        if (first) {
            console.log("first response item:");
            console.log(JSON.stringify(first, null, 2).slice(0, 1400));
        } else {
            console.log("empty response");
        }
        return first;
    } catch (error: any) {
        console.error(`request failed: ${error?.message || error}`);
        return undefined;
    }
}

async function main() {
    console.log(`base=${baseURL}  auth=${isRapidApi ? "x-rapidapi-key" : "x-apisports-key"}`);

    await probe("/status", {});

    const profile = await probe("/players/profiles", {search});
    const playerId = profile?.id ?? profile?.player?.id;

    if (!playerId) {
        console.log("\nNo player id resolved — /players/profiles may be unavailable on this plan.");
        console.log("Check whether the field is nested under `player` and adjust the adapter.");
        return;
    }

    console.log(`\nResolved player id: ${playerId}`);
    await probe("/transfers", {player: playerId});
    await probe("/trophies", {player: playerId});
}

void main();
