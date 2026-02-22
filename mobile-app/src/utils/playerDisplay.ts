import { PlayerType, SearchPlayerType } from "@/src/data/Types";

type PlayerLike = Partial<PlayerType | SearchPlayerType> | null | undefined;

function normalizeText(value: unknown) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : "";
}

export function safeDecodeURIComponent(value: unknown) {
  const text = normalizeText(value);
  if (!text) return "";
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}

export function getPlayerDisplayName(player: PlayerLike) {
  if (!player) return "Unknown Player";

  const title = safeDecodeURIComponent(player.title);
  const name = safeDecodeURIComponent(player.name);
  const fullName = safeDecodeURIComponent(player.fullName);

  return title || name || fullName || "Unknown Player";
}

export function getPlayerSubtitle(player: PlayerLike) {
  if (!player) return "";
  const club = normalizeText(player.currentClub);
  const country = normalizeText(player.country);
  const position = normalizeText(player.position);

  const location = club || country || "-";
  const role = position || "-";
  return `${location} • ${role}`;
}
