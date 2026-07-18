"use client"

import { useMemo, useState, type FormEvent } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Panel } from "@/components/ui/panel"
import { Select } from "@/components/ui/select"
import { StatusState } from "@/components/ui/status-state"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Text } from "@/components/ui/text"
import {
  useRecruitmentWorkspace,
  useRecruitmentWorkspaceMutation,
} from "@/features/recruitment/hooks/useRecruitmentPipeline"
import { parseCompactCurrency } from "@/features/players/lib/player-filtering"
import { cn } from "@/lib/cn"
import { useToast } from "@/lib/hooks/useToast"
import type {
  FitProfileType,
  PlayerType,
  RecruitmentCandidateType,
  RecruitmentTemplateType,
  RecruitmentWorkspaceInputType,
  SavedRecruitmentSearchType,
} from "@/lib/types/type"

type ToolTab = "templates" | "replacements" | "searches" | "fit"
const tabs: Array<{ id: ToolTab; label: string }> = [
  { id: "templates", label: "Scouting Templates" },
  { id: "replacements", label: "Replacement Planner" },
  { id: "searches", label: "Saved Searches & Alerts" },
  { id: "fit", label: "Fit Score" },
]
const positionGroups = ["All", "Goalkeeper", "Defender", "Midfielder", "Forward"] as const
const positionGroupOptions = positionGroups.map((value) => ({ value, label: value }))
const searchPositionOptions = [
  { value: "", label: "All" },
  ...positionGroups.slice(1).map((value) => ({ value, label: value })),
]
const replacementReasonOptions = [
  { value: "contract_end", label: "Contract End" },
  { value: "sale", label: "Potential Sale" },
  { value: "performance", label: "Performance" },
  { value: "age", label: "Age Profile" },
  { value: "depth", label: "Squad Depth" },
]
const money = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "EUR",
  notation: "compact",
})
const id = () => crypto.randomUUID()

function matchesSearch(player: PlayerType, search: SavedRecruitmentSearchType) {
  const value = parseCompactCurrency(player.value, player.currency)
  return (
    (!search.position || player.position === search.position) &&
    (search.minAge === null || player.age >= search.minAge) &&
    (search.maxAge === null || player.age <= search.maxAge) &&
    (search.minElo === null || player.elo >= search.minElo) &&
    (search.maxElo === null || player.elo <= search.maxElo) &&
    (search.maxValue === null || value <= search.maxValue)
  )
}

function FitResults({
  profile,
  players,
  candidates,
}: {
  profile: FitProfileType
  players: PlayerType[]
  candidates: RecruitmentCandidateType[]
}) {
  const stageScores = new Map(
    candidates.map((candidate) => [
      candidate.playerId,
      (
        {
          discovered: 40,
          video_review: 55,
          live_scouting: 65,
          shortlist: 78,
          approval: 88,
          negotiation: 96,
          rejected: 10,
        } as const
      )[candidate.stage],
    ]),
  )
  const totalWeight = Math.max(
    1,
    Object.values(profile.weights).reduce((sum, weight) => sum + weight, 0),
  )
  const ranked = players
    .map((player) => {
      const value = parseCompactCurrency(player.value, player.currency)
      const eloScore = Math.max(0, Math.min(100, player.elo || 0))
      const ageScore = Math.max(0, 100 - Math.abs(player.age - profile.targetAge) * 10)
      const valueScore =
        profile.maxValue <= 0
          ? 50
          : Math.max(0, Math.min(100, 100 - (value / profile.maxValue) * 50))
      const scoutingScore = stageScores.get(player._id) ?? 50
      const score = Math.round(
        (eloScore * profile.weights.elo +
          ageScore * profile.weights.age +
          valueScore * profile.weights.value +
          scoutingScore * profile.weights.scouting) /
          totalWeight,
      )
      return { player, score }
    })
    .toSorted((a, b) => b.score - a.score)
    .slice(0, 8)
  return (
    <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {ranked.map(({ player, score }) => (
        <Link
          key={player._id}
          href={`/players/${player._id}`}
          className="rounded-2xl border border-emerald-950/10 bg-white p-3 transition-[border-color,background-color] hover:border-lime-400 hover:bg-lime-50 focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:outline-none"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="truncate font-bold text-emerald-950">{player.name}</span>
            <span className="rounded-full bg-emerald-950 px-2 py-1 text-xs font-extrabold text-white tabular-nums">
              {score}%
            </span>
          </div>
          <Text as="p" variant="caption" tone="muted">
            {player.position} · {player.age} years ·{" "}
            {money.format(parseCompactCurrency(player.value, player.currency))}
          </Text>
        </Link>
      ))}
    </div>
  )
}

export function RecruitmentToolsPanel({
  players,
  candidates,
}: {
  players: PlayerType[]
  candidates: RecruitmentCandidateType[]
}) {
  const [tab, setTab] = useState<ToolTab>("templates")
  const query = useRecruitmentWorkspace(true)
  const mutation = useRecruitmentWorkspaceMutation()
  const toast = useToast()
  const workspace = query.data
  const save = (changes: Partial<RecruitmentWorkspaceInputType>, message: string) => {
    if (!workspace) return
    mutation.mutate(
      {
        templates: workspace.templates,
        replacementPlans: workspace.replacementPlans,
        savedSearches: workspace.savedSearches,
        fitProfiles: workspace.fitProfiles,
        ...changes,
      },
      {
        onSuccess: () => toast.success(message),
        onError: () => toast.error("Recruitment workspace could not be saved"),
      },
    )
  }

  if (query.isLoading)
    return (
      <Panel>
        <StatusState tone="loading" title="Loading recruitment tools…" />
      </Panel>
    )
  if (!workspace || query.isError)
    return (
      <Panel>
        <StatusState tone="error" title="Recruitment tools could not be loaded" />
      </Panel>
    )

  return (
    <Panel>
      <Tabs value={tab} onValueChange={(value) => setTab(value as ToolTab)}>
        <TabsList className="flex w-full gap-1 overflow-x-auto" aria-label="Recruitment tools">
          {tabs.map((item) => (
            <TabsTrigger key={item.id} value={item.id} className="shrink-0">
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="templates">
          <TemplatesPanel
            templates={workspace.templates}
            onSave={(templates) => save({ templates }, "Scouting templates updated")}
          />
        </TabsContent>
        <TabsContent value="replacements">
          <ReplacementPanel
            players={players}
            plans={workspace.replacementPlans}
            onSave={(replacementPlans) => save({ replacementPlans }, "Replacement plan updated")}
          />
        </TabsContent>
        <TabsContent value="searches">
          <SearchesPanel
            players={players}
            searches={workspace.savedSearches}
            onSave={(savedSearches) => save({ savedSearches }, "Saved searches updated")}
          />
        </TabsContent>
        <TabsContent value="fit">
          <FitPanel
            players={players}
            candidates={candidates}
            profiles={workspace.fitProfiles}
            onSave={(fitProfiles) => save({ fitProfiles }, "Fit profile updated")}
          />
        </TabsContent>
      </Tabs>
    </Panel>
  )
}

function TemplatesPanel({
  templates,
  onSave,
}: {
  templates: RecruitmentTemplateType[]
  onSave: (items: RecruitmentTemplateType[]) => void
}) {
  const [name, setName] = useState("")
  const [position, setPosition] = useState<(typeof positionGroups)[number]>("All")
  const create = (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) return
    onSave([
      ...templates,
      {
        id: id(),
        name: name.trim(),
        positionGroup: position,
        criteria: [
          { id: id(), label: "Technical", weight: 30 },
          { id: id(), label: "Tactical", weight: 30 },
          { id: id(), label: "Physical", weight: 20 },
          { id: id(), label: "Mental", weight: 20 },
        ],
      },
    ])
    setName("")
  }
  return (
    <section>
      <Text as="h2" variant="h2" weight="extrabold">
        Custom Scouting Templates
      </Text>
      <Text as="p" variant="body" tone="muted">
        Standardize evaluations with position-specific weighted criteria.
      </Text>
      <form onSubmit={create} className="mt-4 grid gap-3 sm:grid-cols-[1fr_14rem_auto]">
        <label className="text-sm font-semibold">
          Template Name
          <Input
            name="template-name"
            autoComplete="off"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ball-playing centre-back…"
          />
        </label>
        <div className="space-y-1.5">
          <label htmlFor="template-position" className="block text-sm font-semibold">
            Position
          </label>
          <Select
            id="template-position"
            value={position}
            onValueChange={(value) => setPosition(value as typeof position)}
            options={positionGroupOptions}
            ariaLabel="Template position"
          />
        </div>
        <Button type="submit" disabled={!name.trim()}>
          Create Template
        </Button>
      </form>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {templates.map((template) => (
          <article
            key={template.id}
            className="rounded-2xl border border-emerald-950/10 bg-emerald-50/40 p-4"
          >
            <div className="flex justify-between gap-3">
              <div>
                <Text as="h3" variant="title" weight="bold">
                  {template.name}
                </Text>
                <Text as="p" variant="caption" tone="muted">
                  {template.positionGroup}
                </Text>
              </div>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => onSave(templates.filter((item) => item.id !== template.id))}
              >
                Delete
              </Button>
            </div>
            <div className="mt-3 space-y-2">
              {template.criteria.map((criterion) => (
                <label
                  key={criterion.id}
                  className="grid grid-cols-[1fr_5rem] items-center gap-2 text-sm"
                >
                  <span>{criterion.label}</span>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={criterion.weight}
                    aria-label={`${criterion.label} weight`}
                    onChange={(e) =>
                      onSave(
                        templates.map((item) =>
                          item.id === template.id
                            ? {
                                ...item,
                                criteria: item.criteria.map((entry) =>
                                  entry.id === criterion.id
                                    ? { ...entry, weight: Number(e.target.value) }
                                    : entry,
                                ),
                              }
                            : item,
                        ),
                      )
                    }
                  />
                </label>
              ))}
            </div>
          </article>
        ))}
      </div>
      {!templates.length ? (
        <StatusState
          className="mt-4"
          title="No templates yet"
          description="Create a reusable evaluation framework above."
        />
      ) : null}
    </section>
  )
}

function ReplacementPanel({
  players,
  plans,
  onSave,
}: {
  players: PlayerType[]
  plans: RecruitmentWorkspaceInputType["replacementPlans"]
  onSave: (items: RecruitmentWorkspaceInputType["replacementPlans"]) => void
}) {
  const [incumbent, setIncumbent] = useState("")
  const [reason, setReason] =
    useState<RecruitmentWorkspaceInputType["replacementPlans"][number]["reason"]>("contract_end")
  const create = (e: FormEvent) => {
    e.preventDefault()
    const player = players.find((item) => item._id === incumbent)
    if (!player) return
    const targets = players
      .filter((item) => item._id !== incumbent && item.position === player.position)
      .toSorted((a, b) => b.elo - a.elo)
      .slice(0, 3)
      .map((item) => item._id)
    onSave([
      ...plans,
      { id: id(), incumbentPlayerId: incumbent, reason, targetPlayerIds: targets, notes: "" },
    ])
    setIncumbent("")
  }
  const byId = useMemo(() => new Map(players.map((player) => [player._id, player])), [players])
  const playerOptions = useMemo(
    () => [
      { value: "", label: "Choose player…" },
      ...players.map((player) => ({
        value: player._id,
        label: `${player.name} · ${player.position}`,
      })),
    ],
    [players],
  )
  return (
    <section>
      <Text as="h2" variant="h2" weight="extrabold">
        Squad-Gap & Replacement Planner
      </Text>
      <Text as="p" variant="body" tone="muted">
        Flag an outgoing or vulnerable squad role and compare immediate successors.
      </Text>
      <form onSubmit={create} className="mt-4 grid gap-3 sm:grid-cols-[1fr_14rem_auto]">
        <div className="space-y-1.5">
          <label htmlFor="replacement-player" className="block text-sm font-semibold">
            Current Player
          </label>
          <Select
            id="replacement-player"
            value={incumbent}
            onValueChange={setIncumbent}
            options={playerOptions}
            placeholder="Choose player…"
            ariaLabel="Current player"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="replacement-reason" className="block text-sm font-semibold">
            Reason
          </label>
          <Select
            id="replacement-reason"
            value={reason}
            onValueChange={(value) => setReason(value as typeof reason)}
            options={replacementReasonOptions}
            ariaLabel="Replacement reason"
          />
        </div>
        <Button type="submit" disabled={!incumbent}>
          Create Plan
        </Button>
      </form>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {plans.map((plan) => (
          <article key={plan.id} className="rounded-2xl border border-emerald-950/10 p-4">
            <div className="flex justify-between">
              <div>
                <Text as="h3" variant="title" weight="bold">
                  Replace {byId.get(plan.incumbentPlayerId)?.name || "Unknown"}
                </Text>
                <Text as="p" variant="caption" tone="muted">
                  {plan.reason.replaceAll("_", " ")}
                </Text>
              </div>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => onSave(plans.filter((item) => item.id !== plan.id))}
              >
                Delete
              </Button>
            </div>
            <Text as="p" variant="overline" className="mt-3">
              Recommended Successors
            </Text>
            <div className="mt-2 space-y-2">
              {plan.targetPlayerIds.map((targetId) => {
                const player = byId.get(targetId)
                return player ? (
                  <Link
                    key={targetId}
                    href={`/players/${targetId}`}
                    className="flex justify-between rounded-xl bg-emerald-50 p-2 text-sm font-semibold hover:bg-lime-50"
                  >
                    <span>{player.name}</span>
                    <span className="tabular-nums">ELO {player.elo}</span>
                  </Link>
                ) : null
              })}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function SearchesPanel({
  players,
  searches,
  onSave,
}: {
  players: PlayerType[]
  searches: SavedRecruitmentSearchType[]
  onSave: (items: SavedRecruitmentSearchType[]) => void
}) {
  const [name, setName] = useState("")
  const [position, setPosition] = useState("")
  const [minElo, setMinElo] = useState(70)
  const [maxAge, setMaxAge] = useState(25)
  const create = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    const draft: SavedRecruitmentSearchType = {
      id: id(),
      name: name.trim(),
      position,
      minAge: null,
      maxAge,
      minElo,
      maxElo: null,
      maxValue: null,
      alertsEnabled: true,
      lastMatchCount: 0,
    }
    const count = players.filter((player) => matchesSearch(player, draft)).length
    onSave([...searches, { ...draft, lastMatchCount: count }])
    setName("")
  }
  return (
    <section>
      <Text as="h2" variant="h2" weight="extrabold">
        Saved Searches & Alerts
      </Text>
      <Text as="p" variant="body" tone="muted">
        Keep repeatable talent filters and see when the matching pool changes.
      </Text>
      <form
        onSubmit={create}
        className="mt-4 grid gap-3 md:grid-cols-4 xl:grid-cols-[1fr_12rem_9rem_9rem_auto]"
      >
        <label className="text-sm font-semibold">
          Search Name
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="U23 high-ELO forwards…"
            autoComplete="off"
          />
        </label>
        <div className="space-y-1.5">
          <label htmlFor="saved-search-position" className="block text-sm font-semibold">
            Position
          </label>
          <Select
            id="saved-search-position"
            value={position}
            onValueChange={setPosition}
            options={searchPositionOptions}
            ariaLabel="Search position"
          />
        </div>
        <label className="text-sm font-semibold">
          Min ELO
          <Input type="number" value={minElo} onChange={(e) => setMinElo(Number(e.target.value))} />
        </label>
        <label className="text-sm font-semibold">
          Max Age
          <Input type="number" value={maxAge} onChange={(e) => setMaxAge(Number(e.target.value))} />
        </label>
        <Button type="submit" disabled={!name.trim()}>
          Save Search
        </Button>
      </form>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {searches.map((search) => {
          const count = players.filter((player) => matchesSearch(player, search)).length
          const delta = count - search.lastMatchCount
          return (
            <article key={search.id} className="rounded-2xl border border-emerald-950/10 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <Text as="h3" variant="title" weight="bold">
                    {search.name}
                  </Text>
                  <Text as="p" variant="caption" tone="muted">
                    {search.position || "All positions"} · ELO ≥ {search.minElo ?? "Any"} · Age ≤{" "}
                    {search.maxAge ?? "Any"}
                  </Text>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2 py-1 text-xs font-bold",
                    delta > 0 ? "bg-lime-200 text-emerald-950" : "bg-stone-100 text-stone-600",
                  )}
                >
                  {delta > 0 ? `+${delta} new` : `${count} matches`}
                </span>
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() =>
                    onSave(
                      searches.map((item) =>
                        item.id === search.id ? { ...item, lastMatchCount: count } : item,
                      ),
                    )
                  }
                >
                  Refresh Alert
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => onSave(searches.filter((item) => item.id !== search.id))}
                >
                  Delete
                </Button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function FitPanel({
  players,
  candidates,
  profiles,
  onSave,
}: {
  players: PlayerType[]
  candidates: RecruitmentCandidateType[]
  profiles: FitProfileType[]
  onSave: (items: FitProfileType[]) => void
}) {
  const [name, setName] = useState("")
  const [activeId, setActiveId] = useState(profiles[0]?.id || "")
  const create = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    const profile = {
      id: id(),
      name: name.trim(),
      targetAge: 24,
      maxValue: 20_000_000,
      weights: { elo: 40, age: 20, value: 20, scouting: 20 },
    }
    onSave([...profiles, profile])
    setActiveId(profile.id)
    setName("")
  }
  const active = profiles.find((profile) => profile.id === activeId) || profiles[0]
  return (
    <section>
      <Text as="h2" variant="h2" weight="extrabold">
        Recruitment Fit Score
      </Text>
      <Text as="p" variant="body" tone="muted">
        Rank the database against your club strategy and pipeline evidence.
      </Text>
      <form onSubmit={create} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <label className="flex-1 text-sm font-semibold">
          Profile Name
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="First-team value strategy…"
            autoComplete="off"
          />
        </label>
        <Button type="submit" disabled={!name.trim()} className="sm:self-end">
          Create Fit Profile
        </Button>
      </form>
      {profiles.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {profiles.map((profile) => (
            <Button
              key={profile.id}
              onClick={() => setActiveId(profile.id)}
              size="sm"
              variant={active?.id === profile.id ? "primary" : "outline"}
              aria-pressed={active?.id === profile.id}
            >
              {profile.name}
            </Button>
          ))}
        </div>
      ) : null}
      {active ? (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <label className="text-sm font-semibold">
              Target Age
              <Input
                type="number"
                value={active.targetAge}
                onChange={(e) =>
                  onSave(
                    profiles.map((item) =>
                      item.id === active.id ? { ...item, targetAge: Number(e.target.value) } : item,
                    ),
                  )
                }
              />
            </label>
            <label className="text-sm font-semibold">
              Max Value (€)
              <Input
                type="number"
                value={active.maxValue}
                onChange={(e) =>
                  onSave(
                    profiles.map((item) =>
                      item.id === active.id ? { ...item, maxValue: Number(e.target.value) } : item,
                    ),
                  )
                }
              />
            </label>
            {Object.entries(active.weights).map(([key, value]) => (
              <label key={key} className="text-sm font-semibold capitalize">
                {key} Weight
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={value}
                  onChange={(e) =>
                    onSave(
                      profiles.map((item) =>
                        item.id === active.id
                          ? { ...item, weights: { ...item.weights, [key]: Number(e.target.value) } }
                          : item,
                      ),
                    )
                  }
                />
              </label>
            ))}
          </div>
          <FitResults profile={active} players={players} candidates={candidates} />
          <Button
            className="mt-4"
            size="xs"
            variant="ghost"
            onClick={() => onSave(profiles.filter((item) => item.id !== active.id))}
          >
            Delete Fit Profile
          </Button>
        </>
      ) : (
        <StatusState
          className="mt-4"
          title="No fit profile yet"
          description="Create one to rank players against your recruitment strategy."
        />
      )}
    </section>
  )
}
