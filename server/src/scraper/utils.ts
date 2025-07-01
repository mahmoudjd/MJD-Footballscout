import type * as cheerio from "cheerio";
import {PlayerType, PlayerTypeSchemaWithoutID} from "../models/player";


/**
 * Extracts text from a Cheerio element and removes extra whitespace.
 */
export const extractText = ($el: cheerio.Cheerio<any>, fallback: string = ""): string =>
    cleanText($el.text()) || fallback;

/**
 * Removes diacritics and special characters from a name.
 */
export function convert(name: string) {
    return name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")  // Remove accents
        .replace(/[^\w\s]/gi, "");// Remove special characters, keep letters and spaces
}

/**
 * Normalizes a name for similar formats.
 */
export const normalizeName = (name: string): string =>
    convert(name).normalize("NFC").toLowerCase().replace(/\s+/g, "-").trim();

/**
 * Converts a string to an integer, stripping non-digit characters.
 * Returns 0 if conversion fails.
 */
export const toInt = (str: string): number =>
    parseInt(str.replace(/[^\d]/g, ""), 10) || 0;

/**
 * Cleans a string by removing line breaks, tabs, and extra spaces.
 */
export const cleanText = (str: string = ""): string =>
    str.replace(/[\r\n\t]/g, " ").replace(/\s+/g, " ").trim();


export function normalizeDate(input: string): string | null {
    const monthMap: { [key: string]: string } = {
        jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
        jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12"
    };

    // Normalize input
    input = input.toLowerCase().trim();

    // Try ISO format directly
    const isoMatch = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) return isoMatch[0];

    // Match formats like "Born on 19 December 1987" or "19 Dec 1987"
    const dateRegex = /(\d{1,2})[\s\-](\w{3,9})[\s\-](\d{4})/;
    const match = input.match(dateRegex);

    if (match) {
        let [, day, monthStr, year] = match;
        const month = monthMap[monthStr.slice(0, 3).toLowerCase()];
        if (!month) return null;

        if (day.length === 1) day = "0" + day;
        return `${year}-${month}-${day}`;
    }

    return null;
}

type PlayerTypeWithoutID = Omit<PlayerType, "_id">;

export function isPlayerMatch(oldPlayer: PlayerType, p: PlayerTypeWithoutID ): boolean {
    if (!oldPlayer.name || !p.name) return false;

    const oldFullNameNormalized = normalizeName(oldPlayer.fullName ?? oldPlayer.name);
    const pFullNameNormalized = normalizeName(p.fullName ?? p.name);

    const bornOld = normalizeDate(oldPlayer.born);
    const bornNew = normalizeDate(p.born);

    // Split Namen
    const { firstName: oldFirst, lastName: oldLast } = splitName(oldPlayer.name);
    const { firstName: pFirst, lastName: pLast } = splitName(p.name);

    // Check, ob Vorname gleich oder Teilstring (mit startsWith für bessere Genauigkeit)
    const checkName =
        (oldFirst === pFirst && oldLast === pLast) ||
        (oldFirst.startsWith(pFirst) && oldLast === pLast);

    // 1) Vollständiger Name + Geburtsdatum match
    if (oldFullNameNormalized === pFullNameNormalized && bornOld === bornNew) {
        return true;
    }

    // 2) Fallback: Land, Name/Titel, Nummer vergleichen
    const countryMatch = oldPlayer.country && p.country && oldPlayer.country === p.country;
    const nameOrTitleMatch =
        normalizeName(oldPlayer.name) === normalizeName(p.name) ||
        normalizeName(oldPlayer.title) === normalizeName(p.title) ||
        checkName;
    const numberMatch = oldPlayer.number !== undefined && p.number !== undefined && oldPlayer.number === p.number;

    return !!(countryMatch && nameOrTitleMatch && bornOld === bornNew);


}

function splitName(fullName: string): { firstName: string; lastName: string } {
    const parts = fullName.trim().split(/\s+/);
    return {
        firstName: parts[0].toLowerCase(),
        lastName: parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "",
    };
}
