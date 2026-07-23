import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isCloudflareChallenge, playmakerSearchUrl } from "./extractPlaymaker";

/** Trimmed from a real response captured on 2026-07-23. */
const CHALLENGE_HTML =
    `<!DOCTYPE html><html lang="en-US"><head><title>Just a moment...</title></head>` +
    `<body><noscript>Enable JavaScript and cookies to continue</noscript>` +
    `<script>(function(){window._cf_chl_opt = {cType: 'managed'};}());</script></body></html>`;

describe("isCloudflareChallenge", () => {
    it("detects the challenge via the cf-mitigated header", () => {
        assert.equal(isCloudflareChallenge(403, { "cf-mitigated": "challenge" }, ""), true);
    });

    it("detects the challenge via the body marker when the header is absent", () => {
        assert.equal(isCloudflareChallenge(403, {}, CHALLENGE_HTML), true);
    });

    it("detects a challenge served as 503", () => {
        assert.equal(isCloudflareChallenge(503, { "cf-mitigated": "challenge" }, ""), true);
    });

    it("does not flag a plain 403 that is not a challenge", () => {
        assert.equal(isCloudflareChallenge(403, {}, "<html><body>Forbidden</body></html>"), false);
    });

    it("does not flag a successful response", () => {
        assert.equal(isCloudflareChallenge(200, {}, "<html><body>Lionel Messi</body></html>"), false);
    });

    it("tolerates missing headers", () => {
        assert.equal(isCloudflareChallenge(403, undefined as never, CHALLENGE_HTML), true);
    });
});

describe("playmakerSearchUrl", () => {
    it("encodes names with spaces and accents", () => {
        assert.equal(
            playmakerSearchUrl("Ángel Di María"),
            "https://www.playmakerstats.com/pesquisa?search_txt=%C3%81ngel%20Di%20Mar%C3%ADa",
        );
    });
});
