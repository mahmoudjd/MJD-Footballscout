import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";

const STORAGE_KEY = "mjd.help.guides";
const FILE_NAME = "mjd-help-guides.json";

type HelpGuideMap = Record<string, boolean>;

function getFileUri() {
  if (!FileSystem.documentDirectory) return null;
  return `${FileSystem.documentDirectory}${FILE_NAME}`;
}

function normalizeGuideMap(value: unknown): HelpGuideMap {
  if (!value || typeof value !== "object") return {};

  const entries = Object.entries(value as Record<string, unknown>);
  const normalized: HelpGuideMap = {};
  for (const [key, rawValue] of entries) {
    if (!key || typeof rawValue !== "boolean") continue;
    normalized[key] = rawValue;
  }
  return normalized;
}

async function saveGuideMap(map: HelpGuideMap) {
  const payload = JSON.stringify(map);
  if (Platform.OS === "web") {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, payload);
    return;
  }

  const uri = getFileUri();
  if (!uri) return;
  await FileSystem.writeAsStringAsync(uri, payload);
}

async function loadGuideMap(): Promise<HelpGuideMap> {
  try {
    let raw: string | null = null;

    if (Platform.OS === "web") {
      if (typeof window === "undefined") return {};
      raw = window.localStorage.getItem(STORAGE_KEY);
    } else {
      const uri = getFileUri();
      if (!uri) return {};
      raw = await FileSystem.readAsStringAsync(uri);
    }

    if (!raw) return {};
    return normalizeGuideMap(JSON.parse(raw));
  } catch {
    return {};
  }
}

export async function hasSeenHelpGuide(guideId: string) {
  const normalizedId = guideId.trim();
  if (!normalizedId) return true;
  const map = await loadGuideMap();
  return Boolean(map[normalizedId]);
}

export async function markHelpGuideAsSeen(guideId: string) {
  const normalizedId = guideId.trim();
  if (!normalizedId) return;
  const map = await loadGuideMap();
  if (map[normalizedId]) return;
  map[normalizedId] = true;
  await saveGuideMap(map);
}
