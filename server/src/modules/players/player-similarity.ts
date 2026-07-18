export interface PlayerSimilarityInput {
    position?: string | null;
    age?: number | null;
    elo?: number | null;
    marketValue?: number | null;
    preferredFoot?: string | null;
    country?: string | null;
}

export interface PlayerSimilarityResult {
    score: number;
    reasons: string[];
}

function normalizeText(value: string | null | undefined) {
    return String(value || "")
        .trim()
        .toLowerCase();
}

function isPositiveNumber(value: number | null | undefined): value is number {
    return typeof value === "number" && Number.isFinite(value) && value > 0;
}

export function calculatePlayerSimilarity(
    source: PlayerSimilarityInput,
    candidate: PlayerSimilarityInput,
): PlayerSimilarityResult {
    let score = 0;
    const reasons: string[] = [];

    const sourcePosition = normalizeText(source.position);
    const candidatePosition = normalizeText(candidate.position);
    if (sourcePosition && sourcePosition === candidatePosition) {
        score += 35;
        reasons.push("Same position");
    }

    if (isPositiveNumber(source.age) && isPositiveNumber(candidate.age)) {
        const ageDifference = Math.abs(source.age - candidate.age);
        score += Math.max(0, 20 - ageDifference * 4);
        if (ageDifference <= 2) reasons.push("Similar age");
    }

    if (isPositiveNumber(source.elo) && isPositiveNumber(candidate.elo)) {
        const eloDifference = Math.abs(source.elo - candidate.elo);
        score += Math.max(0, 25 - eloDifference * 0.5);
        if (eloDifference <= 10) reasons.push("Similar ELO");
    }

    if (isPositiveNumber(source.marketValue) && isPositiveNumber(candidate.marketValue)) {
        const valueRatio =
            Math.min(source.marketValue, candidate.marketValue) / Math.max(source.marketValue, candidate.marketValue);
        score += valueRatio * 10;
        if (valueRatio >= 0.7) reasons.push("Similar market value");
    }

    const sourceFoot = normalizeText(source.preferredFoot);
    if (sourceFoot && sourceFoot === normalizeText(candidate.preferredFoot)) {
        score += 5;
        reasons.push("Same preferred foot");
    }

    const sourceCountry = normalizeText(source.country);
    if (sourceCountry && sourceCountry === normalizeText(candidate.country)) {
        score += 5;
        reasons.push("Same nationality");
    }

    return {
        score: Math.min(100, Math.max(0, Math.round(score))),
        reasons,
    };
}
