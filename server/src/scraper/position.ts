const POSITION_RULES: Array<{position: string; pattern: RegExp}> = [
    {
        position: "Goalkeeper",
        pattern: /\b(goalkeeper|goalie|keeper|goa|gk|torwart)\b/,
    },
    {
        position: "Defender",
        pattern: /\b(defender|defence|defense|def|centre[- ]?back|center[- ]?back|full[- ]?back|right[- ]?back|left[- ]?back|sweeper|verteidiger)\b/,
    },
    {
        position: "Midfielder",
        pattern: /\b(midfielder|midfield|mid|central[- ]?midfield|attacking[- ]?midfield|defensive[- ]?midfield|mittelfeld)\b/,
    },
    {
        position: "Forward",
        pattern: /\b(forward|for|fw|striker|attacker|attack|centre[- ]?forward|center[- ]?forward|second[- ]?striker|winger|stuermer)\b/,
    },
    {
        position: "Manager",
        pattern: /\b(manager|coach|trainer)\b/,
    },
];

/** Maps source-specific abbreviations and labels to the values used by the API. */
export function normalizePosition(position: string | null | undefined): string {
    const cleaned = (position || "").replace(/[\r\n\t]/g, " ").replace(/\s+/g, " ").trim();
    if (!cleaned) return "";

    const comparable = cleaned
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[_/|,;()]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    return POSITION_RULES.find(({pattern}) => pattern.test(comparable))?.position || cleaned;
}
