import { API_URL } from "./apiURLs";
import {
  AdvancedPlayersFilters,
  AdvancedPlayersResponse,
  AuthResponse,
  ComparePlayersResponse,
  PlayerHistoryResponse,
  PlayerHighlightsResponse,
  PlayerReportsResponse,
  ScoutingReport,
  ScoutingReportInput,
  SearchPlayerType,
  PlayerStatsResponse,
  PlayerType,
  WatchlistDetails,
  WatchlistSummary,
} from "@/src/data/Types";

type RequestOptions = RequestInit & {
  accessToken?: string;
};

type RefreshResponse = {
  accessToken: string;
  refreshToken: string;
  role: "admin" | "user";
};

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

async function requestJson<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  const isJsonBody = Boolean(options.body);
  if (isJsonBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (options.accessToken) {
    headers.set("Authorization", `Bearer ${options.accessToken}`);
  }

  const requestUrl = `${API_URL}${path}`;
  let response: Response;
  try {
    response = await fetch(requestUrl, {
      ...options,
      headers,
    });
  } catch (error) {
    const message =
      `Network request failed for ${requestUrl}. ` +
      "Check EXPO_PUBLIC_API_URL and server availability.";
    throw new ApiError(message, 0, error);
  }

  const payloadText = await response.text();
  let payload: unknown = null;
  if (payloadText) {
    try {
      payload = JSON.parse(payloadText);
    } catch {
      payload = payloadText;
    }
  }

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload !== null && "error" in payload
        ? String((payload as { error: string }).error)
        : `Request failed (${response.status})`;
    throw new ApiError(message, response.status, payload);
  }

  return payload as T;
}

export async function getAllPlayers(accessToken?: string) {
  return requestJson<PlayerType[]>("/players", { accessToken });
}

export async function getPlayersHighlights() {
  return requestJson<PlayerHighlightsResponse>("/players/highlights");
}

export async function getAdvancedPlayers(filters: AdvancedPlayersFilters) {
  const params = new URLSearchParams();

  const append = (key: string, value: unknown) => {
    if (value === null || value === undefined) return;
    const stringValue = String(value).trim();
    if (!stringValue) return;
    params.set(key, stringValue);
  };

  append("position", filters.position);
  append("country", filters.country);
  append("club", filters.club);
  append("minAge", filters.minAge);
  append("maxAge", filters.maxAge);
  append("minElo", filters.minElo);
  append("maxElo", filters.maxElo);
  append("minValue", filters.minValue);
  append("maxValue", filters.maxValue);
  append("sortBy", filters.sortBy);
  append("order", filters.order);
  append("limit", filters.limit);
  append("offset", filters.offset);

  const query = params.toString();
  return requestJson<AdvancedPlayersResponse>(`/players/advanced${query ? `?${query}` : ""}`);
}

export async function getPlayersStats() {
  return requestJson<PlayerStatsResponse>("/players/stats");
}

export async function searchPlayers(name: string) {
  return requestJson<SearchPlayerType[]>("/search", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function saveSearchedPlayer(accessToken: string, player: SearchPlayerType) {
  return requestJson<PlayerType>("/players", {
    method: "POST",
    accessToken,
    body: JSON.stringify({ data: player }),
  });
}

export async function fetchPlayer(id: string, accessToken: string) {
  return requestJson<PlayerType>(`/players/${id}`, { accessToken });
}

export async function updatePlayer(id: string, accessToken: string) {
  return requestJson<PlayerType>(`/players/${id}`, {
    method: "PUT",
    accessToken,
  });
}

export async function deletePlayer(id: string, accessToken: string) {
  return requestJson<void>(`/players/${id}`, {
    method: "DELETE",
    accessToken,
  });
}

export async function updateAllPlayers(accessToken: string) {
  return requestJson<{ message: string }>(`/update-players`, {
    method: "PUT",
    accessToken,
  });
}

export async function loginUser(input: { email: string; password: string }) {
  return requestJson<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function googleLoginUser(input: { idToken: string }) {
  return requestJson<AuthResponse>("/auth/google-login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
}) {
  return requestJson<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function refreshAccessToken(refreshToken: string) {
  return requestJson<RefreshResponse>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}

export async function comparePlayers(input: {
  accessToken: string;
  ids?: string[];
  all?: boolean;
}) {
  try {
    return await requestJson<ComparePlayersResponse>("/players/compare", {
      method: "POST",
      accessToken: input.accessToken,
      body: JSON.stringify(input.all ? { all: true } : { ids: input.ids || [] }),
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      const query = input.all
        ? "/players/compare?all=true"
        : `/players/compare?ids=${encodeURIComponent((input.ids || []).join(","))}`;
      return requestJson<ComparePlayersResponse>(query, {
        method: "GET",
        accessToken: input.accessToken,
      });
    }
    throw error;
  }
}

export async function getWatchlists(accessToken: string) {
  return requestJson<WatchlistSummary[]>("/watchlists", { accessToken });
}

export async function createWatchlist(
  accessToken: string,
  input: { name: string; description?: string },
) {
  return requestJson<WatchlistSummary>("/watchlists", {
    method: "POST",
    accessToken,
    body: JSON.stringify(input),
  });
}

export async function getWatchlistById(accessToken: string, watchlistId: string) {
  return requestJson<WatchlistDetails>(`/watchlists/${watchlistId}`, {
    accessToken,
  });
}

export async function reorderWatchlistPlayers(
  accessToken: string,
  watchlistId: string,
  playerIds: string[],
) {
  return requestJson<WatchlistDetails>(`/watchlists/${watchlistId}/players/reorder`, {
    method: "PUT",
    accessToken,
    body: JSON.stringify({ playerIds }),
  });
}

export async function addPlayerToWatchlist(
  accessToken: string,
  watchlistId: string,
  playerId: string,
) {
  return requestJson<WatchlistDetails>(`/watchlists/${watchlistId}/players`, {
    method: "POST",
    accessToken,
    body: JSON.stringify({ playerId }),
  });
}

export async function removePlayerFromWatchlist(
  accessToken: string,
  watchlistId: string,
  playerId: string,
) {
  return requestJson<WatchlistDetails>(`/watchlists/${watchlistId}/players/${playerId}`, {
    method: "DELETE",
    accessToken,
  });
}

export async function updateWatchlist(
  accessToken: string,
  watchlistId: string,
  input: { name: string; description?: string },
) {
  return requestJson<WatchlistDetails>(`/watchlists/${watchlistId}`, {
    method: "PUT",
    accessToken,
    body: JSON.stringify(input),
  });
}

export async function deleteWatchlist(accessToken: string, watchlistId: string) {
  return requestJson<void>(`/watchlists/${watchlistId}`, {
    method: "DELETE",
    accessToken,
  });
}

export async function getPlayerReports(accessToken: string, playerId: string) {
  return requestJson<PlayerReportsResponse>(`/players/${playerId}/reports`, {
    accessToken,
  });
}

export async function upsertPlayerReport(
  accessToken: string,
  playerId: string,
  report: ScoutingReportInput,
) {
  return requestJson<ScoutingReport>(`/players/${playerId}/reports`, {
    method: "POST",
    accessToken,
    body: JSON.stringify(report),
  });
}

export async function deleteScoutingReport(accessToken: string, reportId: string) {
  return requestJson<void>(`/reports/${reportId}`, {
    method: "DELETE",
    accessToken,
  });
}

export async function getPlayerHistory(accessToken: string, playerId: string, limit = 30) {
  return requestJson<PlayerHistoryResponse>(`/players/${playerId}/history?limit=${limit}`, {
    accessToken,
  });
}
