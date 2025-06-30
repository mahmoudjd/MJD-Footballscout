import * as cheerio from "cheerio";
import { z } from "zod";
import axios from "axios";
import {
    PlayerTypeSchemaWithoutID,
    Attribute,
    Award,
    Title,
    Transfer,
} from "../models/player";
import { normalizeName, toInt, extractText, cleanText } from "./utils";
import { ScraperError } from "../middleware/customErrors";
import logger from "../logger/logger";

type PlayerTypeSchema = z.infer<typeof PlayerTypeSchemaWithoutID>;

const cheerioConfig = {
    decodeEntities: false,
    xmlMode: true,
    _useHtmlParser2: true,
    _useHtmlParser: false,
};

const fetchHTML = async (url: string, extraHeaders = {}): Promise<string> => {

    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
        ...extraHeaders,
    };

    try {
        logger.info(`Lade HTML von URL: ${url}`);
        const response = await axios.get(url, { headers });
        return response.data;
    } catch (err: any) {
        logger.error(`Fehler beim Abrufen von HTML von URL: ${url}, Fehler: ${err.message}`);
        throw new ScraperError(err.message, 'fetchHTML');
    }
};

const extractPlayerLinks = ($: cheerio.CheerioAPI): string[] =>
    $(".player-result > .info > .pr0 > a.block")
        .map((_, el) => $(el).attr("href"))
        .get()
        .filter(Boolean);

export const getLinksBesoccer = async (name: string): Promise<string[]> => {
    try {
        const normalizedName = normalizeName(name);
        logger.info(`Starting to extract Besoccer links for name: ${normalizedName}`);

        const html = await fetchHTML(`https://www.besoccer.com/search/${normalizedName}`);
        const $ = cheerio.load(html, cheerioConfig);

        const links = extractPlayerLinks($);
        logger.info(`Found ${links.length} Besoccer links.`);
        return links;
    } catch (error: any) {
        logger.error(`Error in getLinksBesoccer: ${error.message}`);
        return [];
    }
};

export const getSingleLinkBesoccer = async (name: string): Promise<string> => {
    try {
        const links = await getLinksBesoccer(name);
        const singleLink = links[0] || "";
        if (singleLink) {
            logger.info(`Found single Besoccer link: ${singleLink}`);
        } else {
            logger.warn(`No Besoccer link found for name: ${name}`);
        }
        return singleLink;
    } catch (error: any) {
        logger.error(`Error in getSingleLinkBesoccer: ${error.message}`);
        return "";
    }
};

export const extractDataBesoccer = async (url: string): Promise<PlayerTypeSchema | undefined> => {
    try {
        if (!url || url.includes("undefined")) {
            logger.error("Invalid URL provided to extractDataBesoccer.");
            throw new ScraperError("Invalid URL", "extractDataBesoccer");
        }

        logger.info(`Starting data extraction for Besoccer URL: ${url}`);
        const html = await fetchHTML(url);
        const $ = cheerio.load(html, cheerioConfig);

        // Extract information
        const name = extractText($("#mod_player_stats > .panel .panel-title"));
        const title = extractText($(".head-title > h2.title"));
        const fullName = extractText($("#mod_player_stats > .panel .panel-subtitle"));
        const image = $(".player-head .bottom-row .img-wrapper > img").attr("src");
        const position = getPosition(extractText($(".stat:nth-child(2) .round-row.mb5 span")));
        const age = toInt(extractText($(".stat:nth-child(1) .big-row")));
        const country = extractText($(".stat:nth-child(1) .small-row").eq(1));
        const weight = toInt(extractText($(".stat:nth-child(2) .big-row")));
        const height = toInt(extractText($(".stat:nth-child(3) .big-row")));
        const number = toInt(extractText($(".stat:nth-child(3) .round-row.mb5 span")));
        const value = extractText($(".stat:nth-child(4) .big-row"));
        const currency = extractText($(".stat:nth-child(4) .small-row")).replace("ELO", "");
        const elo = toInt(extractText($(".stat:nth-child(4) .round-row.mb5.green span")));
        const born = extractText($("#mod_player_stats > .panel > .panel-body > p"));

        const caps1 = extractText($("#mod_player_sel_info .player-sel .box-content .main-text"));
        const caps2 = extractText($("#mod_player_sel_info .player-sel .item-column-list .item-col:eq(0) .main-line"));
        const caps = `played ${caps1} / ${caps2} Goals`;

        const birthCountry = extractText($("#mod_player_stats .table-list div:contains('Country of birth') a"));
        const preferredFootText = $("#mod_player_stats .table-list div:contains('Preferred foot')")
            .text()
            .toLowerCase();
        const preferredFoot = preferredFootText.includes("right")
            ? "right"
            : preferredFootText.includes("left")
                ? "left"
                : "";

        const currentClub = cleanText(
            $('.table-row:contains("Current club")').text().replace("Current club", "").trim()
        );
        const highstValue = extractText(
            $(".player-market .panel-body .table-body .table-row div:contains('Highest value in career')").next()
        );

        const playerAttributes: Attribute[] = [];
        $(".cl-name").each((_, el) => {
            const value = extractText($(el).find(".cvalue"));
            const name = extractText($(el).find(".cname div"));
            playerAttributes.push({ name, value });
        });

        const urlTitles = $("#mod_palmares .panel-head .btn-toggle a").attr("href");
        const urlTransfers = $("#mod_player_last_transfers .pl-signings .panel-head .btn-toggle a").attr("href");

        const titles = urlTitles ? await extractTitles(urlTitles) : [];
        const transfers = urlTransfers ? await extractTransfers(urlTransfers) : [];

        const player = {
            title,
            name,
            fullName,
            age,
            number,
            currentClub,
            image,
            caps,
            status: "",
            otherNation: "",
            website: "",
            country,
            birthCountry,
            weight,
            height,
            position,
            preferredFoot,
            value,
            currency,
            highstValue,
            elo,
            born,
            playerAttributes,
            titles,
            awards: [],
            transfers,
            timestamp: new Date(),
        };

        logger.info(`Extracted player data for: ${name}`);
        const parseResult = PlayerTypeSchemaWithoutID.safeParse(player);
        if (!parseResult.success) {
            logger.error(`Validation error: ${JSON.stringify(parseResult.error, null, 2)}`);
            return undefined;
        }
        return parseResult.data;
    } catch (error: any) {
        logger.error(`Error in extractDataBesoccer at URL: ${url}, Error: ${error.message}`);
        return undefined;
    }
};

const extractTitles = async (url: string): Promise<Title[]> => {
    try {
        logger.info(`Extracting titles from URL: ${url}`);
        const html = await fetchHTML(url);
        const $ = cheerio.load(html);
        return $("ul.item-list > li")
            .map((_, el) => ({
                number: extractText($(el).find(".bg-green")) || "1",
                name: extractText($(el).find(".desc-boxes .t-up")),
            }))
            .get();
    } catch (err: any) {
        logger.error(`Error in extractTitles: ${err.message}`);
        return [];
    }
};

const extractTransfers = async (url: string): Promise<Transfer[]> => {
    try {
        logger.info(`Extracting transfers from URL: ${url}`);
        const html = await fetchHTML(url);
        const $ = cheerio.load(html);
        return $("#mod_transfers .row-body")
            .map((_, el) => {
                const $row = $(el);
                const season = extractText($row.find("td:nth-child(1) > .arranged > strong > span"));
                const origin = extractText($row.find("td:nth-child(2) span"));
                const destination = extractText($row.find("td:nth-child(3) span"));
                const amount = extractText($row.find("td:nth-child(4) > div > strong > span"));
                const team = origin && destination ? destination : !origin ? destination : origin;
                return season ? { season, team, amount } : null;
            })
            .get()
            .filter(Boolean);
    } catch (err: any) {
        logger.error(`Error in extractTransfers: ${err.message}`);
        return [];
    }
};

const getPosition = (position: string): string => {
    if (!position) return "";
    return position.includes("For")
        ? "Forward"
        : position === "Def"
            ? "Defender"
            : position === "Mid"
                ? "Midfielder"
                : position === "Goa"
                    ? "Goalkeeper"
                    : position;
};