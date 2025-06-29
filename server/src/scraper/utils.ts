import type * as cheerio from "cheerio";


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
