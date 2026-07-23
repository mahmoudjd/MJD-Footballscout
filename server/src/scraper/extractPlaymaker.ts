import * as cheerio from "cheerio";
import {z} from "zod";
import axios from "axios";
import {PlayerTypeSchemaWithoutID, Transfer, Title} from "../modules/players/player.model";
import iconv from "iconv-lite";
import {CheerioAPI} from "cheerio";
import logger from "../logger/logger";
import {toInt} from "./utils";
import {normalizePosition} from "./position";

type PlayerTypeSchema = z.infer<typeof PlayerTypeSchemaWithoutID>;

const cheerioConfig = {
    decodeEntities: true,
    xmlMode: true,
    _useHtmlParser2: true,
    _useHtmlParser: false,
};

const PLAYMAKER_BASE_URL = "https://www.playmakerstats.com";
const PLAYMAKER_TIMEOUT_MS = 15_000;

export const playmakerSearchUrl = (name: string): string =>
    `${PLAYMAKER_BASE_URL}/pesquisa?search_txt=${encodeURIComponent(name)}`;

/**
 * Cloudflare answers its managed challenge with HTTP 403, a `cf-mitigated`
 * header and a JS challenge page. That page is not solvable by an HTTP client:
 * it requires executing JavaScript and persisting a `cf_clearance` cookie.
 * Detected explicitly so the log says "we are blocked" instead of the parser
 * silently finding no selectors and reporting "no player found".
 */
export function isCloudflareChallenge(
    status: number,
    headers: Record<string, unknown>,
    html: string,
): boolean {
    if (status !== 403 && status !== 503) return false;
    return Boolean(headers?.["cf-mitigated"]) || html.includes("_cf_chl_opt");
}

/**
 * Single entry point for every Playmakerstats request: one timeout, one
 * encoding, one place where a block is recognised. Returns null when the
 * source is unusable, so callers degrade to BeSoccer instead of throwing.
 */
async function fetchPlaymakerHtml(url: string): Promise<string | null> {
    try {
        const response = await axios.get(url, {
            responseType: "arraybuffer",
            timeout: PLAYMAKER_TIMEOUT_MS,
            // Inspect 4xx bodies instead of throwing, so a challenge page is
            // recognisable rather than an opaque "Request failed with 403".
            validateStatus: (status) => status < 500,
        });

        const html = iconv.decode(response.data, "windows-1252");

        if (isCloudflareChallenge(response.status, response.headers as Record<string, unknown>, html)) {
            logger.error(
                `Playmakerstats is behind a Cloudflare challenge (HTTP ${response.status}) for ${url}. ` +
                `This cannot be solved by axios — the source is unavailable to the server ` +
                `until access is arranged with the site operator. Falling back to BeSoccer only.`,
            );
            return null;
        }

        if (response.status >= 400) {
            logger.error(`Playmakerstats returned HTTP ${response.status} for ${url}`);
            return null;
        }

        return html;
    } catch (error: any) {
        const reason = error?.code === "ECONNABORTED"
            ? `timeout after ${PLAYMAKER_TIMEOUT_MS}ms`
            : error?.message || String(error);
        logger.error(`Playmakerstats request failed for ${url}: ${reason}`);
        return null;
    }
}

export const getLinkPlaymakerstats = async (name: string): Promise<string> => {
    try {
        logger.debug(`Suche nach Spieler-Link für '${name}'`);

        const html = await fetchPlaymakerHtml(playmakerSearchUrl(name));
        if (!html) return "";

        const $ = cheerio.load(html, cheerioConfig);

        const href = $(".zz-search-main > .zz-search-results > .player > div")
            .first()
            .find('a[href^="/player/"]')
            .attr("href");

        if (!href) {
            logger.warn(`Not found links '${name}'`);
            return "";
        }

        return `${PLAYMAKER_BASE_URL}${href}`;
    } catch (error: any) {
        logger.error(`Fehler beim Abrufen des Links für '${name}': ${error.stack || error.message}`);
        return "";
    }
};

export async function extractPlayersFromPlayMakerStats(name: string): Promise<PlayerTypeSchema[]> {
    try {
        const html = await fetchPlaymakerHtml(playmakerSearchUrl(name));
        if (!html) return [];

        const $ = cheerio.load(html, cheerioConfig);

        const playerLinks: string[] = [];

        $(".zz-search-main > .zz-search-results > .player > div")
            .slice(0, 3)
            .each((_, el) => {
                const href = $(el).find('a[href^="/player/"]').attr("href");
                if (href) {
                    playerLinks.push(`${PLAYMAKER_BASE_URL}${href}`);
                }
            });

        const players: PlayerTypeSchema[] = [];
        for (const url of playerLinks) {
            const player = await extractDataPlaymakerstats(url);
            if (player) {
                players.push(player);
            }
        }

        return players;
    } catch (error: any) {
        logger.error(`Fehler beim Extrahieren von Spielern für '${name}': ${error.stack || error.message}`);
        return [];
    }
}


export const extractDataPlaymakerstats = async (url: string): Promise<PlayerTypeSchema | undefined> => {
    try {
        if (!url) {
            logger.warn("No Playmaker URL provided for data extraction.");
            return undefined;
        }

        logger.debug(`Extrahiere Spieldaten von URL: ${url}`);

        const html = await fetchPlaymakerHtml(url);
        if (!html) return undefined;

        const $ = cheerio.load(html, cheerioConfig);

        const header = $("#page_header_container .zz-enthdr-top");
        let name = header.find(".zz-enthdr-data h1 span.name").text().trim();
        const number = toInt(header.find(".zz-enthdr-data h1 .number").text().trim());

        const ageMatch = header.find(".zz-enthdr-info .info").text().match(/\d+ -yrs-old/);
        const age = ageMatch ? toInt(ageMatch[0]) : 0;

        if (/\d/.test(name)) name = name.split(".")[1].trim();

        const imagePath = $(".profile_picture .logo a img").attr("src");
        const image = imagePath ? `${PLAYMAKER_BASE_URL}${imagePath}` : "";

        const fullName = extractBioValue($, "Name");
        const currentClub = $('#page_rightbar .rbbox h3:contains("CURRENT CLUB")')
            .next()
            .find(".text > a")
            .text()
            .trim();

        const website = $('.bio span:contains("Official Site")').siblings("a").attr("href") || "";

        const position = normalizePosition(extractBioValue($, "Position"));
        const weight = toInt(extractBioHalfValue($, "Weight").replace("kg", "")) || 0;
        const height = toInt(extractBioHalfValue($, "Height").replace("cm", "")) || 0;
        const preferredFootRaw = extractBioHalfValue($, "Preferred foot").toLowerCase();
        const preferredFoot = preferredFootRaw.includes("right")
            ? "right"
            : preferredFootRaw.includes("left")
                ? "left"
                : "";

        const caps = extractBioHalfValue($, "Caps");
        const status = extractBioValue($, "Status");

        const {bornDate, age: age2} = extractBornInfo($);
        const birthCountry = extractBirthCountry($);
        logger.info(`Born in playmaker ${bornDate} in ${birthCountry}`)

        const country = $('.bio_half span:contains("Nationality")')
            .nextAll('.micrologo_and_text')
            .first()
            .find('.text')
            .text()
            .trim();

        const otherNation = $('.bio_half span:contains("Dual Nationality")')
            .nextAll('.micrologo_and_text')
            .first()
            .find('.text')
            .text()
            .trim();

        const transfers: Transfer[] = [];
        $('#page_rightbar .rbbox h3:contains("TRANSFERS")')
            .next()
            .find("table.stats tbody tr")
            .each((_, el) => {
                const season = $(el).find("td.text").eq(0).text().trim();
                const team = $(el).find("td.text").eq(1).text().trim();
                const amount = $(el).find("td.triple").text().trim();
                if (season && team) transfers.push({season, team, amount});
            });

        const awards = $('#coach_titles .awards .trophy')
            .map((_, el) => {
                const number = $(el).find(".number").text().trim();
                const name = $(el).find(".competition a").text().trim();
                return name ? {number, name} : null;
            })
            .get()
            .filter((award): award is { number: string; name: string } => award !== null);

        const titles: Title[] = [];
        $("#coach_titles .trophy_line .trophy").each((_, el) => {
            const number = $(el).find(".number").text().trim();
            const name = $(el).find(".competition .text").text().trim();
            if (name) titles.push({number, name});
        });

        const objPlayer = {
            title: name,
            name,
            age: age ?? age2,
            born: bornDate,
            number,
            fullName,
            currentClub,
            image,
            caps,
            birthCountry,
            value: extractMarketValue($).value,
            elo: 0,
            currency: extractMarketValue($).currency,
            highstValue: "",
            status,
            weight,
            height,
            position,
            preferredFoot,
            country,
            otherNation,
            website,
            playerAttributes: [],
            titles,
            awards,
            transfers,
            timestamp: new Date(),
        };

        const parsed = PlayerTypeSchemaWithoutID.safeParse(objPlayer);
        if (!parsed.success) {
            logger.warn(`Validierungsfehler bei Spieler ${fullName || name}: ${JSON.stringify(parsed.error.format())}`);
            return undefined;
        }

        return parsed.data;
    } catch (error: any) {
        logger.error(`Fehler bei extractDataPlaymakerstats (${url}): ${error.stack || error.message}`);
        return undefined;
    }
};

// Hilfsfunktionen
export const extractBioValue = ($: CheerioAPI, label: string): string =>
    $(".bio")
        .filter((_, el) => $(el).find("span").text().trim() === label)
        .text()
        .replace(label, "")
        .trim();

export const extractBioHalfValue = ($: CheerioAPI, label: string): string =>
    $(".bio_half")
        .filter((_, el) => $(el).find("span").text().trim() === label)
        .text()
        .replace(label, "")
        .trim();

const extractBornInfo = ($: cheerio.CheerioAPI) => {
    const bornSpan = $('span').filter((_, el) => $(el).text().trim() === 'Born/Age').first();
    const bornTextNode = bornSpan[0].nextSibling;
    const bornDate = bornTextNode?.nodeType === 3 ? (bornTextNode.nodeValue || '').trim() : '';

    const ageText = bornSpan.siblings('span.small').text();
    const ageMatch = ageText.match(/\((\d+)\s?-yrs-old\)/);
    const age = ageMatch ? ageMatch[1] : '';

    return {bornDate, age};
};
const extractBirthCountry = ($: cheerio.CheerioAPI): string => {
    const countrySpan = $('span').filter((_, el) => $(el).text().trim() === 'Country of Birth').first();
    const countryText = countrySpan.nextAll('.micrologo_and_text').find('.text').text().trim();
    return countryText;
};
export const extractMarketValue = ($: CheerioAPI): { value: string; currency: string } => {
    const text = $('.rectangle[title="Market value"] .value span').first().text().trim(); // z.B. "18.0 M €"

    // Match: [Zahl][optional Komma/Punkt][Rest = Währung]
    const match = text.match(/^([\d.,]+)\s*(.*)$/);

    if (match) {
        const [, value, currency] = match;
        logger.info(`Extracted market value: ${value} ${currency}`);
        return {value, currency: currency.trim()};
    }
    return {value: "", currency: ""};
};
