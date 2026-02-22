export interface Award {
  number: string;
  name: string;
}

export interface Title {
  number: string;
  name: string;
}

export interface Transfer {
  season: string;
  team: string;
  amount: string;
}

export interface Attribute {
  name: string;
  value: string;
}

export interface PlayerType {
  _id: string;
  name: string;
  title: string;
  number: number | null;
  fullName: string;
  weight: number | null;
  height: number | null;
  preferredFoot: string;
  value: string;
  currency: string;
  age: number | null;
  currentClub: string;
  image: string;
  position: string;
  country: string;
  birthCountry: string;
  otherNation: string;
  website: string;
  status: string;
  caps: string;
  highstValue: string;
  elo: number;
  born: string;
  playerAttributes: Array<Attribute>;
  titles: Array<Title>;
  awards: Array<Award>;
  transfers: Array<Transfer>;
  timestamp: string;
}

export type SearchPlayerType = Omit<PlayerType, "_id"> & {
  _id?: string;
};

export type RootStackParamList = {
  Profile: { playerId: string };
};

export type UserRole = "admin" | "user";

export interface AuthSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface AuthResponse {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  accessToken: string;
  refreshToken: string;
}

export interface CompareRankingItem {
  playerId: string;
  score: number;
}

export interface CompareMetrics {
  highestElo: string[];
  highestMarketValue: string[];
  youngest: string[];
  recentlyUpdated: string[];
}

export interface ComparePlayersResponse {
  players: PlayerType[];
  metrics: CompareMetrics;
  ranking: CompareRankingItem[];
}

export interface PositionStat {
  position: string;
  count: number;
}

export interface CountryStat {
  country: string;
  count: number;
}

export interface PlayerStatsResponse {
  totalPlayers: number;
  averageAge: number;
  averageElo: number;
  positions: PositionStat[];
  topCountries: CountryStat[];
  latestUpdate: string | null;
}

export interface PlayerHighlightItem {
  _id: string;
  name: string;
  age: number;
  country: string;
  position: string;
  elo: number;
  image: string;
  currentClub: string;
  value: string;
  currency: string;
}

export interface PlayerHighlightsResponse {
  topEloPlayers: PlayerHighlightItem[];
  youngTalents: PlayerHighlightItem[];
  marketLeaders: PlayerHighlightItem[];
}

export interface WatchlistSummary {
  _id: string;
  userId?: string;
  name: string;
  description?: string;
  playerCount?: number;
  createdAt: string;
  updatedAt: string;
  playerIds?: string[];
}

export interface WatchlistDetails {
  _id: string;
  userId?: string;
  name: string;
  description?: string;
  playerIds: string[];
  players: PlayerType[];
  createdAt: string;
  updatedAt: string;
}

export type AdvancedSortBy = "elo" | "age" | "value" | "name" | "timestamp";
export type AdvancedSortOrder = "asc" | "desc";

export interface AdvancedPlayersFilters {
  position?: string | null;
  country?: string | null;
  club?: string | null;
  minAge?: number | null;
  maxAge?: number | null;
  minElo?: number | null;
  maxElo?: number | null;
  minValue?: number | null;
  maxValue?: number | null;
  sortBy?: AdvancedSortBy;
  order?: AdvancedSortOrder;
  limit?: number;
  offset?: number;
}

export interface AdvancedPlayersResponse {
  items: PlayerType[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  appliedFilters: {
    position: string | null;
    country: string | null;
    club: string | null;
    minAge: number | null;
    maxAge: number | null;
    minElo: number | null;
    maxElo: number | null;
    minValue: number | null;
    maxValue: number | null;
    sortBy: AdvancedSortBy;
    order: AdvancedSortOrder;
  };
}

export type ScoutingDecision = "watch" | "sign" | "reject";

export interface ScoutingReport {
  _id: string;
  playerId: string;
  userId: string;
  rating: number;
  decision: ScoutingDecision;
  strengths: string[];
  weaknesses: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScoutingReportInput {
  rating: number;
  decision: ScoutingDecision;
  strengths: string[];
  weaknesses: string[];
  notes: string;
}

export interface PlayerReportsResponse {
  reports: ScoutingReport[];
  summary: {
    totalReports: number;
    averageRating: number | null;
    decisions: {
      watch: number;
      sign: number;
      reject: number;
    };
  };
}

export interface PlayerHistoryEntry {
  _id: string;
  playerId: string;
  timestamp: string;
  oldElo?: number | null;
  newElo?: number | null;
  eloDelta?: number | null;
  oldValue?: string | null;
  newValue?: string | null;
  valueChanged: boolean;
  oldClub?: string | null;
  newClub?: string | null;
  clubChanged: boolean;
}

export interface PlayerHistoryAlert {
  type: string;
  severity: "low" | "medium" | "high";
  message: string;
  timestamp: string;
}

export interface PlayerHistoryResponse {
  history: PlayerHistoryEntry[];
  alerts: PlayerHistoryAlert[];
}
