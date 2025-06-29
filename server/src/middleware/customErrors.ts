export class ScraperError extends Error {
    constructor(message: string, public source: string) {
        super(`[${source}] ${message}`);
        this.name = "ScraperError";
    }
}