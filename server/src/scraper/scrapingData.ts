import {
    extractDataBesoccer,
    getSingleLinkBesoccer,
    getLinksBesoccer,
} from "./extractBesoccer";

import {
    extractDataPlaymakerstats,
    getLinkPlaymakerstats,
    extractPlayersFromPlayMakerStats
} from "./extractPlaymaker";
import {
    extractPlayerFromApiFootball,
    extractPlayersFromApiFootball,
    isApiFootballConfigured,
} from "./extractApiFootball";
import type {PlayerTypeSchemaWithoutID, Title} from "../modules/players/player.model";
import {z} from "zod";
import {convert, normalizeName} from "./utils";
import {ScraperError} from "../middleware/customErrors";
import logger from "../logger/logger";
import {normalizePosition} from "./position";

type PlayerTypeSchema = z.infer<typeof PlayerTypeSchemaWithoutID>;

export async function extractPlayerData(name: string, one = false): Promise<PlayerTypeSchema[]> {
    try {
        logger.info(`Start extraction for Player: ${name}`);
        const convertedName = convert(name);
        logger.info(`Converted Name: ${convertedName}`);

        if (one) {
            const player = await extractWithName(convertedName);
            return player ? [player] : [];
        }

        const urlsBesoccer = await getLinksBesoccer(convertedName);
        logger.info(`Founded Besoccer-Links: ${urlsBesoccer.length}`);

        if (urlsBesoccer.length === 0) {
            logger.warn("No links found on Besoccer. Attempting alternative extraction.");

            const players = await extractPlayersFromPlayMakerStats(convertedName);
            if (players.length > 0) return players;

            // Playmakerstats is regularly unreachable behind its bot protection,
            // so the licensed API is the last leg of the chain rather than
            // returning nothing at all.
            logger.warn("Playmakerstats yielded nothing. Falling back to API-Football.");
            return await extractPlayersFromApiFootball(convertedName);
        }

        const urlsToAnalyse = Array.from(new Set(urlsBesoccer)).slice(0, 3);
        logger.info(`Analyzing the first ${urlsToAnalyse.length} URLs.`);

        const results = await Promise.all(
            urlsToAnalyse.map((url) => extractWithBesoccerURL(name, url))
        );
        logger.info(`Extracted players: ${results.length}`);
        const players = results.filter(
            (player): player is PlayerTypeSchema => !!player && typeof player.name === "string" && typeof player.title === "string"
        );
        return players;
    } catch (error: any) {
        logger.error(`extractPlayerData error: ${error.message || error}`);
        return [];
    }
}

export async function extractWithName(name: string): Promise<PlayerTypeSchema | undefined> {
    try {
        const normalizedName = normalizeName(name);
        logger.debug(`Extract URLs for: ${normalizedName}`);

        const [urlBesoccer, urlPlaymaker] = await Promise.all([
            getSingleLinkBesoccer(normalizedName),
            getLinkPlaymakerstats(normalizedName),
        ]);

        logger.debug(`Besoccer URL: ${urlBesoccer}, Playmaker URL: ${urlPlaymaker}`);
        let [playerBesoccer, playerPlaymaker] = await Promise.all([
            extractDataBesoccer(urlBesoccer),
            extractDataPlaymakerstats(urlPlaymaker),
        ]);

        if (!playerBesoccer && playerPlaymaker) {
            const newUrlBesoccer = await getSingleLinkBesoccer(playerPlaymaker.name);
            playerBesoccer = await extractDataBesoccer(newUrlBesoccer);
        }

        if (playerBesoccer && !playerPlaymaker) {
            const newUrlPlaymaker = await getLinkPlaymakerstats(playerBesoccer.title);
            playerPlaymaker = await extractDataPlaymakerstats(newUrlPlaymaker);
        }

        if (playerBesoccer && playerPlaymaker && isEquals(playerBesoccer, playerPlaymaker)) {
            logger.info("Player profiles match, merging will be performed.");
            return await checkAndUpdate(playerBesoccer, playerPlaymaker);
        }

        const primary = playerBesoccer ?? playerPlaymaker;

        // Neither scraper answered — the licensed API is the remaining source.
        if (!primary) {
            return await extractPlayerFromApiFootball(normalizedName);
        }

        // Only one scraper answered, so there was no cross-check and no gap
        // filling. API-Football can act as the second opinion instead.
        if ((!playerBesoccer || !playerPlaymaker) && isApiFootballConfigured()) {
            const apiPlayer = await extractPlayerFromApiFootball(primary.fullName || primary.name);
            if (apiPlayer && isEquals(primary, apiPlayer)) {
                logger.info("API-Football profile matches, merging as secondary source.");
                return await checkAndUpdate(primary, apiPlayer);
            }
        }

        return primary;
    } catch (error: any) {
        logger.error(`extractWithName error: ${error.message || error}`);
    }
}

export async function extractWithBesoccerURL(name: string, besoccerLink: string): Promise<PlayerTypeSchema | undefined> {
    try {
        const normalizedName = normalizeName(name);
        logger.info(`Extracted with Besoccer-Link: ${besoccerLink}`);

        // Read the concrete BeSoccer result first. Searching Playmaker with the
        // generic user input for every result repeatedly selected the same first
        // hit and caused unrelated profiles to be merged.
        const player1 = await extractDataBesoccer(besoccerLink);
        if (!player1) {
            const urlPlaymaker = await getLinkPlaymakerstats(normalizedName);
            return urlPlaymaker ? await extractDataPlaymakerstats(urlPlaymaker) : undefined;
        }

        const searchTerms = Array.from(new Set([
            player1.title,
            player1.fullName,
            player1.name,
        ].map((value) => value?.trim()).filter((value): value is string => Boolean(value))));

        for (const searchTerm of searchTerms) {
            const urlPlaymaker = await getLinkPlaymakerstats(searchTerm);
            if (!urlPlaymaker) continue;

            const player2 = await extractDataPlaymakerstats(urlPlaymaker);
            if (player2 && isEquals(player1, player2)) {
                logger.info(`Player profiles match for '${searchTerm}', merging data.`);
                return await checkAndUpdate(player1, player2);
            }
        }

        if (player1?.age === 0 && player1?.weight === 0 && player1?.height === 0 && !player1?.preferredFoot && !player1?.currentClub) {
            throw new ScraperError("Missing the base info", "extractWithBesoccerURL");
        }
        return player1;
    } catch (error: any) {
        logger.error(`extractWithBesoccerURL error: ${error.message || error}`);
        return undefined;
    }
}

async function checkAndUpdate(player1: PlayerTypeSchema, player2: PlayerTypeSchema): Promise<PlayerTypeSchema> {
    logger.debug("Start merge of players profiles");

    if (!player1.name) player1.name = player2.name;
    if (!player1.title) player1.title = player2.title;
    if (!player1.number && player2.number) player1.number = player2.number;
    if (!player1.number && !player2.number) player1.number = 0;
    if (!player1.weight) player1.weight = player2.weight;
    if (!player1.height) player1.height = player2.height;
    if (!player1.preferredFoot) player1.preferredFoot = player2.preferredFoot;
    if (!player1.currentClub) player1.currentClub = player2.currentClub;
    else if (player2.currentClub?.length > player1.currentClub?.length) player1.currentClub = player2.currentClub;
    if (player1.image?.includes("nofoto") && player2.image) player1.image = player2.image;
    player1.position = normalizePosition(player1.position) || normalizePosition(player2.position);
    if (!player1.born) player1.born = player2.born;
    if (!player1.birthCountry) player1.birthCountry = player2.birthCountry;
    if (player1.transfers.length === 0) player1.transfers = player2.transfers;
    if (player2.value && player2.currency) {
        player1.value = player2.value;
        player1.currency = player2.currency;
    }
    if (player2.titles.length > player1.titles.length) {
        player1.titles = player2.titles;
    } else if (player2.titles === player2.titles) {
        const sumTitles = (titles: Title[]) => titles.reduce((total, title) => total + parseInt(title.number, 10), 0);
        const numberOfTitles1 = sumTitles(player1.titles);
        const numberOfTitles2 = sumTitles(player2.titles);
        if (numberOfTitles2 > numberOfTitles1) player1.titles = player2.titles;
    }

    if (!player1.otherNation) player1.otherNation = player2.otherNation;
    if (!player1.website) player1.website = player2.website;
    if (!player1.status) player1.status = player2.status;

    if (
        player2.awards &&
        player2.awards.length > 0 &&
        (!player1.awards || player1.awards.length === 0 || player2.awards.length > player1.awards.length)
    ) {
        player1.awards = player2.awards;
    }

    if (
        player2.playerAttributes &&
        player2.playerAttributes.length > 0 &&
        (!player1.playerAttributes ||
            player1.playerAttributes.length === 0 ||
            player2.playerAttributes.length > player1.playerAttributes.length)
    ) {
        player1.playerAttributes = player2.playerAttributes;
    }

    logger.debug("Merge successfully!");
    return player1;
}

export function isEquals(obj1: PlayerTypeSchema, obj2: PlayerTypeSchema) {
    if (!obj1 || !obj2) return false;

    const fullName1 = convert(obj1.fullName).toLowerCase();
    const fullName2 = convert(obj2.fullName).toLowerCase();

    const country1 = obj1.country?.toString().toLowerCase();
    const country2 = obj2.country?.toString().toLowerCase();

    const num1 = obj1.number;
    const num2 = obj2.number;

    const age1 = obj1.age;
    const age2 = obj2.age;

    const pos1 = normalizePosition(obj1.position).toLowerCase();
    const pos2 = normalizePosition(obj2.position).toLowerCase();

    let foot1 = obj1.preferredFoot?.toLowerCase();
    const foot2 = obj2.preferredFoot?.toLowerCase();

    const height1 = obj1.height;
    const height2 = obj2.height;

    if (
        fullName1 === fullName2 &&
        age1 === age2 &&
        num1 === num2 &&
        foot1 === foot2 &&
        height1 === height2
    ) {
        return true;
    }

    if (
        fullName1 === fullName2 &&
        foot1 === foot2 &&
        height1 === height2 &&
        country1 === country2 &&
        positionsMatch(pos1, pos2)
    ) {
        return true;
    }

    if (
        country1 === country2 &&
        age1 === age2 &&
        num1 === num2 &&
        foot1 === foot2 &&
        height1 === height2
    ) {
        return true;
    }

    if (
        age1 === age2 &&
        country1 === country2 &&
        (positionsMatch(pos1, pos2) ||
            (foot1 === foot2 && height1 === height2))
    ) {
        return true;
    }

    return (
        (convert(fullName1) === convert(fullName2) && age1 === age2) ||
        (country1 === country2 &&
            num1 === num2 &&
            age1 === age2 &&
            foot1 === foot2 &&
            positionsMatch(pos1, pos2))
    );
}

function positionsMatch(position1: string, position2: string): boolean {
    return Boolean(position1 && position2 && position1 === position2);
}
