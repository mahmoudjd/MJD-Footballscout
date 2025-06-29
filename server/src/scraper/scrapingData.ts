import {
    extractDataBesoccer,
    getSingleLinkBesoccer,
    getLinksBesoccer,
} from "./extractBesoccer";

import {
    extractDataPlaymakerstats,
    getLinkPlaymakerstats,
} from "./extractPlaymaker";
import type {PlayerTypeSchemaWithoutID, Title} from "../models/player";
import {z} from "zod";
import {convert, normalizeName} from "./utils";
import {ScraperError} from "../middleware/customErrors";
import logger from "../logger/logger";

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
            const player = await extractWithName(convertedName);
            return player ? [player] : [];
        }

        const urlsToAnalyse = urlsBesoccer.slice(0, 3);
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

        return playerBesoccer ?? playerPlaymaker;
    } catch (error: any) {
        logger.error(`extractWithName error: ${error.message || error}`);
    }
}

export async function extractWithBesoccerURL(name: string, besoccerLink: string): Promise<PlayerTypeSchema | undefined> {
    try {
        const normalizedName = normalizeName(name);
        logger.info(`Extracted with Besoccer-Link: ${besoccerLink}`);

        let urlPlaymaker = await getLinkPlaymakerstats(normalizedName);
        logger.info(`Initialize Playmaker-URL: ${urlPlaymaker}`);

        let [player1, player2] = await Promise.all([
            extractDataBesoccer(besoccerLink),
            urlPlaymaker.includes("undefined") ? Promise.resolve(undefined) : extractDataPlaymakerstats(urlPlaymaker),
        ]);

        if (player1 && !player2) {
            urlPlaymaker = await getLinkPlaymakerstats(player1.title);
            logger.info(`Neue Playmaker-URL: ${urlPlaymaker}`);
            player2 = await extractDataPlaymakerstats(urlPlaymaker);
        }

        if (player1 && player2 && isEquals(player1, player2)) {
            logger.info("Players match (Case 1), Merge data...");
            return await checkAndUpdate(player1, player2);
        }

        if (player1 && player2 && !isEquals(player1, player2)) {
            urlPlaymaker = await getLinkPlaymakerstats(player1.title);
            if (!urlPlaymaker.includes("undefined")) {
                player2 = await extractDataPlaymakerstats(urlPlaymaker);
                if (player2 && isEquals(player1, player2)) {
                    logger.info("Players match (Case 2), Merge data...");
                    return await checkAndUpdate(player1, player2);
                }
            }
        }

        if (urlPlaymaker.includes("undefined") && player1) {
            urlPlaymaker = await getLinkPlaymakerstats(normalizeName(player1.name));
            if (!urlPlaymaker.includes("undefined")) {
                player2 = await extractDataPlaymakerstats(urlPlaymaker);
                if (player2 && isEquals(player1, player2)) {
                    logger.info("Players match (Case 3), Merge data...");
                    return await checkAndUpdate(player1, player2);
                }
            }
        }

        if (player1?.age === 0 && player1?.weight === 0 && player1?.height === 0 && !player1?.preferredFoot && !player1?.currentClub) {
            throw new ScraperError("Missing the base info", "extractWithBesoccerURL");
        }
        return player1 ?? player2;
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
    if (!player1.position || player1.position.length < player2.position.length) player1.position = player2.position;
    if (!player1.born) player1.born = player2.born;
    if (!player1.birthCountry) player1.birthCountry = player2.birthCountry;
    if (player1.transfers.length === 0) player1.transfers = player2.transfers;

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

    const pos1 = obj1.position?.toLowerCase();
    const pos2 = obj2.position?.toLowerCase();

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
        pos2.includes(pos1)
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
        (pos1.includes(pos2) ||
            pos2.includes(pos1) ||
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
            pos2.includes(pos1))
    );
}
