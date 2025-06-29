import * as cheerio from "cheerio";
import {z} from "zod";
import axios from "axios";
import {PlayerTypeSchemaWithoutID, Transfer, Title} from "../models/player";
import iconv from "iconv-lite";
import {CheerioAPI} from "cheerio";
import logger from "../logger/logger";
import {toInt} from "./utils";

type PlayerTypeSchema = z.infer<typeof PlayerTypeSchemaWithoutID>;

const cheerioConfig = {
    decodeEntities: false,
    xmlMode: true,
    _useHtmlParser2: true,
    _useHtmlParser: false,
};

export const getLinkPlaymakerstats = async (name: string): Promise<string> => {
    try {
        logger.debug(`Suche nach Spieler-Link für '${name}'`);

        const response = await axios.get(
            `https://www.playmakerstats.com/pesquisa?search_txt=${encodeURIComponent(name)}`,
            {responseType: "arraybuffer"}
        );

        const html = iconv.decode(response.data, "windows-1252");
        const $ = cheerio.load(html, cheerioConfig);

        const href = $(".zz-search-main > .zz-search-results > .player > div")
            .first()
            .find('a[href^="/player/"]')
            .attr("href");

        if (!href) {
            logger.warn(`Kein Spieler-Link gefunden für '${name}'`);
            return "";
        }

        return `https://www.playmakerstats.com${href}`;
    } catch (error: any) {
        logger.error(`Fehler beim Abrufen des Links für '${name}': ${error.stack || error.message}`);
        return "";
    }
};

export const extractDataPlaymakerstats = async (url: string): Promise<PlayerTypeSchema | undefined> => {
    try {
        logger.debug(`Extrahiere Spieldaten von URL: ${url}`);

        const response = await axios.get(url, {responseType: "arraybuffer"});
        const html = iconv.decode(response.data, "windows-1252");
        const $ = cheerio.load(html, cheerioConfig);

        const header = $("#page_header_container .zz-enthdr-top");
        let name = header.find(".zz-enthdr-data h1 span.name").text().trim();
        const number = toInt(header.find(".zz-enthdr-data h1 .number").text().trim());

        const ageMatch = header.find(".zz-enthdr-info .info").text().match(/\d+ -yrs-old/);
        const age = ageMatch ? toInt(ageMatch[0]) : 0;

        if (/\d/.test(name)) name = name.split(".")[1].trim();

        const imagePath = $(".profile_picture .logo a img").attr("src");
        const image = imagePath ? `https://www.playmakerstats.com${imagePath}` : "";

        const fullName = extractBioValue($, "Name");
        const currentClub = $('#page_rightbar .rbbox h3:contains("CURRENT CLUB")')
            .next()
            .find(".text > a")
            .text()
            .trim();

        const website = $('.bio span:contains("Official Site")').siblings("a").attr("href") || "";

        const position = getPosition(extractBioValue($, "Position"));
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

        const bornData = extractBioHalfValue($, "Born/Age");
        const bornDateMatch = bornData.match(/\d{4}-\d{2}-\d{2}/);
        const born = bornDateMatch ? bornDateMatch[0] : "";
        const birthCountry = bornData.includes("Country of Birth")
            ? bornData.split("Country of Birth")[1].trim()
            : "";

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
            age,
            born,
            number,
            fullName,
            currentClub,
            image,
            caps,
            birthCountry,
            value: "",
            elo: 0,
            currency: "",
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

export const getPosition = (position: string): string => {
    if (!position) return "";
    const lower = position.toLowerCase();
    if (lower.includes("midfield")) return "Midfielder";
    if (lower.includes("defender")) return "Defender";
    if (lower.includes("forward") || lower.includes("striker")) return "Forward";
    if (lower.includes("goalkeeper")) return "Goalkeeper";
    return position;
};
