export class ScraperError extends Error {
    constructor(message: string, public source: string) {
        super(`[${source}] ${message}`);
        this.name = "ScraperError";
    }
}

export class ApiError extends Error {
    constructor(
        public readonly status: number,
        message: string,
    ) {
        super(message);
        this.name = "ApiError";
    }
}
