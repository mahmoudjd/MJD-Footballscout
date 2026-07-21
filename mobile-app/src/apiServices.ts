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
  RecruitmentCandidate,
  RecruitmentCandidateInput,
  ShadowTeamAssignment,
  ShadowTeamDetail,
  ShadowTeamFormation,
  ShadowTeamSummary,
  AccountProfile,
  MfaSetupResponse,
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

export async function requestPasswordReset(email: string) {
  return requestJson<{ message?: string; resetUrl?: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(input: { token: string; newPassword: string }) {
  return requestJson<{ message?: string }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function verifyEmail(token: string) {
  return requestJson<{ message?: string }>("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

export async function resendVerificationEmail(email: string) {
  return requestJson<{ message?: string; verificationUrl?: string }>("/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify({ email }),
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

export async function getRecruitmentCandidates(accessToken: string) {
  return requestJson<RecruitmentCandidate[]>("/recruitment/candidates", { accessToken });
}

export async function createRecruitmentCandidate(
  accessToken: string,
  input: RecruitmentCandidateInput,
) {
  return requestJson<RecruitmentCandidate>("/recruitment/candidates", {
    method: "POST",
    accessToken,
    body: JSON.stringify(input),
  });
}

export async function updateRecruitmentCandidate(
  accessToken: string,
  candidateId: string,
  input: RecruitmentCandidateInput,
) {
  return requestJson<RecruitmentCandidate>(`/recruitment/candidates/${candidateId}`, {
    method: "PUT",
    accessToken,
    body: JSON.stringify(input),
  });
}

export async function deleteRecruitmentCandidate(accessToken: string, candidateId: string) {
  return requestJson<void>(`/recruitment/candidates/${candidateId}`, {
    method: "DELETE",
    accessToken,
  });
}

export async function getShadowTeams(accessToken: string) {
  return requestJson<ShadowTeamSummary[]>("/shadow-teams", { accessToken });
}

export async function getShadowTeam(accessToken: string, teamId: string) {
  return requestJson<ShadowTeamDetail>(`/shadow-teams/${teamId}`, { accessToken });
}

export async function createShadowTeam(
  accessToken: string,
  input: { name: string; formation: ShadowTeamFormation },
) {
  return requestJson<ShadowTeamSummary>("/shadow-teams", {
    method: "POST",
    accessToken,
    body: JSON.stringify(input),
  });
}

export async function updateShadowTeam(
  accessToken: string,
  teamId: string,
  input: { name: string; formation: ShadowTeamFormation; assignments: ShadowTeamAssignment[] },
) {
  return requestJson<ShadowTeamSummary>(`/shadow-teams/${teamId}`, {
    method: "PUT",
    accessToken,
    body: JSON.stringify(input),
  });
}

export async function deleteShadowTeam(accessToken: string, teamId: string) {
  return requestJson<void>(`/shadow-teams/${teamId}`, {
    method: "DELETE",
    accessToken,
  });
}

// --- Account / profile management (mirrors web-app accountApi) ---

export async function getAccountProfile(accessToken: string) {
  return requestJson<AccountProfile>("/auth/me", { accessToken });
}

export async function updateAccountProfile(accessToken: string, name: string) {
  return requestJson<Pick<AccountProfile, "name" | "email" | "updatedAt">>("/auth/me", {
    method: "PATCH",
    accessToken,
    body: JSON.stringify({ name }),
  });
}

export async function changeAccountPassword(
  accessToken: string,
  input: { currentPassword: string; newPassword: string },
) {
  return requestJson<{ message: string }>("/auth/change-password", {
    method: "POST",
    accessToken,
    body: JSON.stringify(input),
  });
}

export async function deactivateAccount(
  accessToken: string,
  input: { password?: string; reason?: string },
) {
  return requestJson<{ message: string }>("/auth/me", {
    method: "DELETE",
    accessToken,
    body: JSON.stringify(input),
  });
}

export async function updateNotificationPreferences(
  accessToken: string,
  preferences: { securityEmailsEnabled?: boolean; onboardingEmailsEnabled?: boolean },
) {
  return requestJson<{ message: string } & typeof preferences>("/auth/notification-preferences", {
    method: "PATCH",
    accessToken,
    body: JSON.stringify(preferences),
  });
}

export async function startMfaSetup(accessToken: string, password?: string) {
  return requestJson<MfaSetupResponse>("/auth/mfa/setup", {
    method: "POST",
    accessToken,
    body: JSON.stringify({ password }),
  });
}

export async function enableMfa(accessToken: string, code: string) {
  return requestJson<{ message: string; recoveryCodes: string[] }>("/auth/mfa/enable", {
    method: "POST",
    accessToken,
    body: JSON.stringify({ code }),
  });
}

export async function disableMfa(
  accessToken: string,
  input: { code: string; password?: string },
) {
  return requestJson<{ message: string }>("/auth/mfa/disable", {
    method: "POST",
    accessToken,
    body: JSON.stringify(input),
  });
}
