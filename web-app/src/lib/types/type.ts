import { z } from "zod"

export const AwardSchema = z.object({
  name: z.string(),
  number: z.string(),
})

export const AttributeSchema = z.object({
  name: z.string(),
  value: z.string(),
})

export const TitleSchema = z.object({
  name: z.string(),
  number: z.string(),
})

export const TransferSchema = z.object({
  season: z.string(),
  team: z.string(),
  amount: z.string(),
})

export const PlayerSchema = z.object({
  _id: z.string(),
  title: z.string(),
  name: z.string(),
  age: z.number(),
  number: z.number(),
  fullName: z.string(),
  currentClub: z.string(),
  image: z.string(),
  caps: z.string(),
  country: z.string(),
  birthCountry: z.string().optional(),
  weight: z.number(),
  height: z.number(),
  status: z.string(),
  position: z.string(),
  preferredFoot: z.string().optional(),
  value: z.string(),
  website: z.string(),
  currency: z.string(),
  highstValue: z.string(),
  otherNation: z.string(),
  elo: z.number(),
  born: z.string(),
  playerAttributes: z.array(AttributeSchema),
  titles: z.array(TitleSchema),
  awards: z.array(AwardSchema),
  transfers: z.array(TransferSchema),
  timestamp: z.coerce.date(),
})

export const PositionStatSchema = z.object({
  position: z.string(),
  count: z.number(),
})

export const CountryStatSchema = z.object({
  country: z.string(),
  count: z.number(),
})

export const PlayerStatsSchema = z.object({
  totalPlayers: z.number(),
  averageAge: z.number(),
  averageElo: z.number(),
  positions: z.array(PositionStatSchema),
  topCountries: z.array(CountryStatSchema),
  latestUpdate: z.string().nullable(),
})

export const PlayerHighlightItemSchema = z.object({
  _id: z.string(),
  name: z.string(),
  age: z.number(),
  country: z.string(),
  position: z.string(),
  elo: z.number(),
  image: z.string(),
  currentClub: z.string(),
  value: z.string(),
  currency: z.string(),
})

export const PlayerHighlightsSchema = z.object({
  topEloPlayers: z.array(PlayerHighlightItemSchema),
  youngTalents: z.array(PlayerHighlightItemSchema),
  marketLeaders: z.array(PlayerHighlightItemSchema),
})

export const AdvancedPlayersFiltersSchema = z.object({
  position: z.string().nullable(),
  country: z.string().nullable(),
  club: z.string().nullable(),
  minAge: z.number().nullable(),
  maxAge: z.number().nullable(),
  minElo: z.number().nullable(),
  maxElo: z.number().nullable(),
  minValue: z.number().nullable(),
  maxValue: z.number().nullable(),
  sortBy: z.enum(["elo", "age", "value", "name", "timestamp"]),
  order: z.enum(["asc", "desc"]),
})

export const AdvancedPlayersResponseSchema = z.object({
  items: z.array(PlayerSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
  hasMore: z.boolean(),
  appliedFilters: AdvancedPlayersFiltersSchema,
})

export const CompareRankingItemSchema = z.object({
  playerId: z.string(),
  score: z.number(),
})

export const CompareMetricsSchema = z.object({
  highestElo: z.array(z.string()),
  highestMarketValue: z.array(z.string()),
  youngest: z.array(z.string()),
  recentlyUpdated: z.array(z.string()),
})

export const ComparePlayersResponseSchema = z.object({
  players: z.array(PlayerSchema),
  metrics: CompareMetricsSchema,
  ranking: z.array(CompareRankingItemSchema),
})

export const ScoutingDecisionSchema = z.enum(["watch", "sign", "reject"])

export const ScoutingReportSchema = z.object({
  _id: z.string(),
  playerId: z.string(),
  userId: z.string(),
  rating: z.number(),
  decision: ScoutingDecisionSchema,
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  notes: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const ScoutingReportInputSchema = z.object({
  rating: z.number().min(1).max(10),
  decision: ScoutingDecisionSchema,
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  notes: z.string(),
})

export const ScoutingReportSummarySchema = z.object({
  totalReports: z.number(),
  averageRating: z.number().nullable(),
  decisions: z.object({
    watch: z.number(),
    sign: z.number(),
    reject: z.number(),
  }),
})

export const PlayerReportsResponseSchema = z.object({
  reports: z.array(ScoutingReportSchema),
  summary: ScoutingReportSummarySchema,
})

export const PlayerHistoryEntrySchema = z.object({
  _id: z.string(),
  playerId: z.string(),
  timestamp: z.coerce.date(),
  oldElo: z.number().nullable().optional(),
  newElo: z.number().nullable().optional(),
  eloDelta: z.number().nullable().optional(),
  oldValue: z.string().nullable().optional(),
  newValue: z.string().nullable().optional(),
  valueChanged: z.boolean(),
  oldClub: z.string().nullable().optional(),
  newClub: z.string().nullable().optional(),
  clubChanged: z.boolean(),
})

export const PlayerHistoryAlertSchema = z.object({
  type: z.string(),
  severity: z.enum(["low", "medium", "high"]),
  message: z.string(),
  timestamp: z.coerce.date(),
})

export const PlayerHistoryResponseSchema = z.object({
  history: z.array(PlayerHistoryEntrySchema),
  alerts: z.array(PlayerHistoryAlertSchema),
})

export const WatchlistSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  name: z.string(),
  description: z.string(),
  playerIds: z.array(z.string()),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  playerCount: z.number().optional(),
})

export const WatchlistDetailSchema = WatchlistSchema.extend({
  players: z.array(PlayerSchema),
})

export const WatchlistInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().default(""),
})

export type AttributeType = z.infer<typeof AttributeSchema>
export type AwardType = z.infer<typeof AwardSchema>
export type TransferType = z.infer<typeof TransferSchema>
export type TitleType = z.infer<typeof TitleSchema>
export type PlayerType = z.infer<typeof PlayerSchema>
export type PositionStatType = z.infer<typeof PositionStatSchema>
export type CountryStatType = z.infer<typeof CountryStatSchema>
export type PlayerStatsType = z.infer<typeof PlayerStatsSchema>
export type PlayerHighlightItemType = z.infer<typeof PlayerHighlightItemSchema>
export type PlayerHighlightsType = z.infer<typeof PlayerHighlightsSchema>
export type AdvancedPlayersFiltersType = z.infer<typeof AdvancedPlayersFiltersSchema>
export type AdvancedPlayersResponseType = z.infer<typeof AdvancedPlayersResponseSchema>
export type CompareMetricsType = z.infer<typeof CompareMetricsSchema>
export type CompareRankingItemType = z.infer<typeof CompareRankingItemSchema>
export type ComparePlayersResponseType = z.infer<typeof ComparePlayersResponseSchema>
export type ScoutingDecisionType = z.infer<typeof ScoutingDecisionSchema>
export type ScoutingReportType = z.infer<typeof ScoutingReportSchema>
export type ScoutingReportInputType = z.infer<typeof ScoutingReportInputSchema>
export type PlayerReportsResponseType = z.infer<typeof PlayerReportsResponseSchema>
export type PlayerHistoryEntryType = z.infer<typeof PlayerHistoryEntrySchema>
export type PlayerHistoryAlertType = z.infer<typeof PlayerHistoryAlertSchema>
export type PlayerHistoryResponseType = z.infer<typeof PlayerHistoryResponseSchema>
export type WatchlistType = z.infer<typeof WatchlistSchema>
export type WatchlistDetailType = z.infer<typeof WatchlistDetailSchema>
export type WatchlistInputType = z.infer<typeof WatchlistInputSchema>
