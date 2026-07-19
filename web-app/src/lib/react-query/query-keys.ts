export const queryKeys = {
  billing: {
    status: ["billing", "status"] as const,
  },
  players: {
    all: ["players"] as const,
    detail: (playerId: string) => ["players", playerId] as const,
    stats: () => ["players", "stats"] as const,
    highlights: () => ["players", "highlights"] as const,
    reports: (playerId: string) => ["players", playerId, "reports"] as const,
    history: (playerId: string, limit: number) =>
      ["players", playerId, "history", limit] as const,
    compare: (scope: "all" | string[]) => ["players", "compare", scope] as const,
    similar: (playerId: string, limit: number) =>
      ["players", playerId, "similar", limit] as const,
  },
  watchlists: {
    all: ["watchlists"] as const,
    detail: (watchlistId: string) => ["watchlists", watchlistId] as const,
  },
  shadowTeams: {
    all: ["shadow-teams"] as const,
    detail: (teamId: string) => ["shadow-teams", teamId] as const,
  },
  recruitment: {
    candidates: ["recruitment", "candidates"] as const,
    workspace: ["recruitment", "workspace"] as const,
  },
} as const
