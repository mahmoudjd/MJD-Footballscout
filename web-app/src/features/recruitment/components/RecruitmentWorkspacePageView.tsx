"use client"

import { useMemo, useState, type FormEvent } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { OutlineIcons } from "@/components/icons/outline-icons"
import { Button, buttonVariants } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Input } from "@/components/ui/input"
import { LoginRequiredState } from "@/components/ui/login-required-state"
import { PageContainer } from "@/components/ui/page-container"
import { Panel } from "@/components/ui/panel"
import { SectionHeader } from "@/components/ui/section-header"
import { Select } from "@/components/ui/select"
import { StatusState } from "@/components/ui/status-state"
import { StatTile } from "@/components/ui/stat-tile"
import { Text } from "@/components/ui/text"
import { Textarea } from "@/components/ui/textarea"
import { usePlayersQuery } from "@/features/players/hooks/usePlayersQuery"
import {
  useRecruitmentCandidates,
  useRecruitmentPipelineMutations,
} from "@/features/recruitment/hooks/useRecruitmentPipeline"
import { useToast } from "@/lib/hooks/useToast"
import { RecruitmentToolsPanel } from "@/features/recruitment/components/RecruitmentToolsPanel"
import { cn } from "@/lib/cn"
import { getPlayerImageSrc } from "@/lib/player-image"
import type {
  RecruitmentCandidateInputType,
  RecruitmentCandidateType,
  RecruitmentPriorityType,
  RecruitmentStageType,
} from "@/lib/types/type"

const stages: Array<{ value: RecruitmentStageType; label: string; description: string }> = [
  { value: "discovered", label: "Discovered", description: "Newly identified targets" },
  { value: "video_review", label: "Video Review", description: "Desk & video assessment" },
  { value: "live_scouting", label: "Live Scouting", description: "In-person observation" },
  { value: "shortlist", label: "Shortlist", description: "Validated candidates" },
  { value: "approval", label: "Approval", description: "Decision-maker review" },
  { value: "negotiation", label: "Negotiation", description: "Active deal process" },
  { value: "rejected", label: "Rejected", description: "Closed candidates" },
]
const priorities: RecruitmentPriorityType[] = ["low", "medium", "high", "critical"]
const stageOptions = stages.map(({ value, label }) => ({ value, label }))
const priorityOptions = priorities.map((value) => ({
  value,
  label: `${value.charAt(0).toUpperCase()}${value.slice(1)}`,
}))
const priorityTone: Record<RecruitmentPriorityType, "neutral" | "amber" | "rose" | "danger"> = {
  low: "neutral",
  medium: "amber",
  high: "rose",
  critical: "danger",
}
const dateFormatter = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" })

function toDateInput(date: Date | null) {
  if (!date) return ""
  const safeDate = date instanceof Date ? date : new Date(date)
  return Number.isNaN(safeDate.getTime()) ? "" : safeDate.toISOString().slice(0, 10)
}

function formatDeadline(date: Date | null) {
  if (!date) return null
  const safeDate = date instanceof Date ? date : new Date(date)
  return Number.isNaN(safeDate.getTime()) ? null : dateFormatter.format(safeDate)
}

function isDeadlineOverdue(date: Date | null) {
  if (!date) return false
  const safeDate = date instanceof Date ? date : new Date(date)
  return !Number.isNaN(safeDate.getTime()) && safeDate.getTime() < Date.now()
}

function candidatePayload(
  candidate: RecruitmentCandidateType,
  changes: Partial<RecruitmentCandidateInputType>,
): RecruitmentCandidateInputType {
  return {
    playerId: candidate.playerId,
    stage: candidate.stage,
    priority: candidate.priority,
    assignee: candidate.assignee,
    deadline: candidate.deadline,
    notes: candidate.notes,
    ...changes,
  }
}

function PipelineCard({
  candidate,
  onUpdate,
  onDelete,
  pending,
}: {
  candidate: RecruitmentCandidateType
  onUpdate: (payload: RecruitmentCandidateInputType) => void
  onDelete: () => void
  pending: boolean
}) {
  const [assignee, setAssignee] = useState(candidate.assignee)
  const [notes, setNotes] = useState(candidate.notes)
  const [isEditing, setIsEditing] = useState(false)
  const player = candidate.player
  const deadline = formatDeadline(candidate.deadline)
  const detailsChanged = assignee !== candidate.assignee || notes !== candidate.notes
  return (
    <article className="group overflow-hidden rounded-2xl border border-emerald-950/10 bg-white shadow-[0_16px_32px_-26px_rgba(15,50,36,0.52)] transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-emerald-800/20 hover:shadow-[0_22px_38px_-26px_rgba(15,50,36,0.48)] motion-reduce:transform-none">
      <div className="p-3.5">
        <div className="flex min-w-0 items-start gap-3">
          {player ? (
            <Image
              src={getPlayerImageSrc(player.image)}
              alt=""
              width={44}
              height={44}
              className="h-11 w-11 shrink-0 rounded-xl border border-emerald-950/10 bg-emerald-50 object-cover"
              sizes="44px"
            />
          ) : (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-500">
              <OutlineIcons.UserIcon className="h-5 w-5" aria-hidden="true" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            {player ? (
              <Link
                href={`/players/${player._id}`}
                className="block truncate font-bold text-emerald-950 hover:text-emerald-700 hover:underline focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:outline-none"
              >
                {player.name}
              </Link>
            ) : (
              <Text as="p" variant="body" weight="bold">
                Unavailable player
              </Text>
            )}
            <Text as="p" variant="caption" tone="muted" className="truncate">
              {player?.position || "Unknown position"} ·{" "}
              {player?.currentClub || player?.country || "No club"}
            </Text>
          </div>
          <span className="shrink-0 rounded-lg bg-emerald-950 px-2 py-1 text-[11px] font-extrabold text-white tabular-nums">
            {player?.elo || "—"}
            <span className="ml-1 text-[9px] font-semibold text-emerald-100">ELO</span>
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <Chip tone={priorityTone[candidate.priority]} size="xs" className="capitalize">
            {candidate.priority} priority
          </Chip>
          {candidate.assignee ? (
            <Chip tone="neutral" size="xs">
              {candidate.assignee}
            </Chip>
          ) : null}
          {deadline ? (
            <Chip tone={isDeadlineOverdue(candidate.deadline) ? "danger" : "neutral"} size="xs">
              {isDeadlineOverdue(candidate.deadline) ? "Overdue" : "Due"} {deadline}
            </Chip>
          ) : null}
        </div>

        <div className="mt-3 grid grid-cols-[minmax(0,1fr)_7.5rem] gap-2">
          <div className="space-y-1">
            <label
              htmlFor={`candidate-stage-${candidate._id}`}
              className="block text-xs font-semibold text-emerald-950"
            >
              Stage
            </label>
            <Select
              id={`candidate-stage-${candidate._id}`}
              value={candidate.stage}
              onValueChange={(value) =>
                onUpdate(candidatePayload(candidate, { stage: value as RecruitmentStageType }))
              }
              disabled={pending}
              options={stageOptions}
              ariaLabel="Candidate stage"
              triggerClassName="h-9 min-h-9 rounded-lg px-2 text-xs"
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor={`candidate-priority-${candidate._id}`}
              className="block text-xs font-semibold text-emerald-950"
            >
              Priority
            </label>
            <Select
              id={`candidate-priority-${candidate._id}`}
              value={candidate.priority}
              onValueChange={(value) =>
                onUpdate(
                  candidatePayload(candidate, {
                    priority: value as RecruitmentPriorityType,
                  }),
                )
              }
              disabled={pending}
              options={priorityOptions}
              ariaLabel="Candidate priority"
              triggerClassName="h-9 min-h-9 rounded-lg px-2 text-xs"
            />
          </div>
        </div>

        {candidate.notes ? (
          <Text as="p" variant="caption" tone="muted" className="mt-3 line-clamp-2 text-pretty">
            {candidate.notes}
          </Text>
        ) : null}

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-emerald-950/8 pt-3">
          <Button
            size="xs"
            variant="ghost"
            aria-expanded={isEditing}
            onClick={() => setIsEditing((current) => !current)}
          >
            <OutlineIcons.AdjustmentsVerticalIcon className="h-4 w-4" aria-hidden="true" />
            {isEditing ? "Close Details" : "Edit Details"}
          </Button>
          <Button size="xs" variant="ghost" onClick={onDelete}>
            Remove
          </Button>
        </div>
      </div>

      {isEditing ? (
        <div className="grid gap-3 border-t border-emerald-950/8 bg-emerald-50/40 p-3.5">
          <label className="space-y-1 text-xs font-semibold text-emerald-950">
            Assignee
            <Input
              value={assignee}
              onChange={(event) => setAssignee(event.target.value)}
              placeholder="Scout name…"
              name={`assignee-${candidate._id}`}
              autoComplete="off"
            />
          </label>
          <label className="space-y-1 text-xs font-semibold text-emerald-950">
            Deadline
            <Input
              type="date"
              value={toDateInput(candidate.deadline)}
              onChange={(event) =>
                onUpdate(
                  candidatePayload(candidate, {
                    deadline: event.target.value
                      ? new Date(`${event.target.value}T12:00:00`)
                      : null,
                  }),
                )
              }
              name={`deadline-${candidate._id}`}
            />
          </label>
          <label className="space-y-1 text-xs font-semibold text-emerald-950">
            Notes
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Add decision context…"
              name={`notes-${candidate._id}`}
              autoComplete="off"
              rows={3}
            />
          </label>
          <Button
            size="xs"
            fullWidth
            disabled={pending || !detailsChanged}
            onClick={() => onUpdate(candidatePayload(candidate, { assignee, notes }))}
          >
            Save Candidate Details
          </Button>
        </div>
      ) : null}
    </article>
  )
}

export function RecruitmentWorkspacePageView() {
  const { status, data: session } = useSession()
  const loggedIn = Boolean(session?.user?.id)
  const toast = useToast()
  const candidatesQuery = useRecruitmentCandidates(loggedIn)
  const playersQuery = usePlayersQuery(loggedIn)
  const mutations = useRecruitmentPipelineMutations()
  const [playerId, setPlayerId] = useState("")
  const [priority, setPriority] = useState<RecruitmentPriorityType>("medium")
  const [candidateToDelete, setCandidateToDelete] = useState<RecruitmentCandidateType | null>(null)
  const candidates = useMemo(() => candidatesQuery.data ?? [], [candidatesQuery.data])
  const candidatePlayerIds = useMemo(
    () => new Set(candidates.map((candidate) => candidate.playerId)),
    [candidates],
  )
  const availablePlayers = useMemo(
    () =>
      (playersQuery.data ?? [])
        .filter((player) => !candidatePlayerIds.has(player._id))
        .toSorted((a, b) => a.name.localeCompare(b.name)),
    [candidatePlayerIds, playersQuery.data],
  )
  const availablePlayerOptions = useMemo(
    () => [
      { value: "", label: "Choose a player…" },
      ...availablePlayers.map((player) => ({
        value: player._id,
        label: `${player.name} · ${player.position} · ${player.currentClub || player.country}`,
      })),
    ],
    [availablePlayers],
  )
  const candidatesByStage = useMemo(
    () =>
      new Map(
        stages.map((stage) => [
          stage.value,
          candidates.filter((candidate) => candidate.stage === stage.value),
        ]),
      ),
    [candidates],
  )
  const pipelineMetrics = useMemo(() => {
    const now = Date.now()
    const nextWeek = now + 7 * 24 * 60 * 60 * 1000
    return {
      active: candidates.filter((candidate) => candidate.stage !== "rejected").length,
      decisionReady: candidates.filter((candidate) =>
        ["shortlist", "approval", "negotiation"].includes(candidate.stage),
      ).length,
      critical: candidates.filter(
        (candidate) => candidate.priority === "critical" && candidate.stage !== "rejected",
      ).length,
      dueSoon: candidates.filter((candidate) => {
        if (!candidate.deadline || candidate.stage === "rejected") return false
        const time = new Date(candidate.deadline).getTime()
        return !Number.isNaN(time) && time <= nextWeek
      }).length,
    }
  }, [candidates])

  const handleCreate = (event: FormEvent) => {
    event.preventDefault()
    if (!playerId) return
    mutations.create.mutate(
      { playerId, stage: "discovered", priority, assignee: "", deadline: null, notes: "" },
      {
        onSuccess: () => {
          setPlayerId("")
          toast.success("Candidate added to pipeline")
        },
        onError: () => toast.error("Candidate could not be added"),
      },
    )
  }

  if (status === "loading")
    return (
      <PageContainer>
        <Panel>
          <StatusState tone="loading" title="Checking session…" />
        </Panel>
      </PageContainer>
    )
  if (!loggedIn)
    return (
      <PageContainer className="space-y-4">
        <SectionHeader
          title="Recruitment Workspace"
          description="Manage candidates from discovery to negotiation."
          icon="RocketLaunchIcon"
        />
        <LoginRequiredState callbackUrl="/recruitment" />
      </PageContainer>
    )

  return (
    <PageContainer size="wide" className="space-y-6">
      <SectionHeader
        title="Recruitment Workspace"
        description="A single decision workspace for scouting ownership, deadlines and candidate progression."
        icon="RocketLaunchIcon"
        badge={`${candidates.length} candidates`}
        right={
          <>
            <Link href="/players" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Browse Players
            </Link>
            <Link
              href="/shadow-team"
              className={buttonVariants({ variant: "primary", size: "sm" })}
            >
              Open Squad Builder
            </Link>
          </>
        }
      />

      <section
        aria-label="Recruitment overview"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatTile label="Active Pipeline" value={pipelineMetrics.active} />
        <StatTile label="Decision Ready" value={pipelineMetrics.decisionReady} />
        <StatTile label="Critical Priority" value={pipelineMetrics.critical} />
        <StatTile label="Due or Overdue" value={pipelineMetrics.dueSoon} />
      </section>

      <Panel
        tone="soft"
        className="overflow-hidden border-emerald-900/15 bg-linear-to-br from-emerald-950 via-emerald-900 to-emerald-800 text-white"
      >
        <div className="grid gap-5 xl:grid-cols-[18rem_minmax(0,1fr)] xl:items-end">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-300 text-emerald-950 shadow-lg shadow-emerald-950/20">
              <OutlineIcons.UserGroupIcon className="h-5 w-5" aria-hidden="true" />
            </div>
            <Text as="h2" variant="h2" weight="extrabold" tone="inherit" className="mt-3">
              Add a Recruitment Target
            </Text>
            <Text as="p" variant="body" tone="inherit" className="mt-1 text-emerald-100/80">
              Start in discovery, set urgency and assign ownership from the candidate card.
            </Text>
          </div>
          <form
            onSubmit={handleCreate}
            className="grid gap-3 rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm lg:grid-cols-[minmax(0,1fr)_12rem_auto] lg:items-end"
          >
            <div className="space-y-1.5">
              <label
                htmlFor="recruitment-player"
                className="block text-sm font-semibold text-white"
              >
                Add Player
              </label>
              <Select
                id="recruitment-player"
                value={playerId}
                onValueChange={setPlayerId}
                options={availablePlayerOptions}
                placeholder="Choose a player…"
                ariaLabel="Add player"
                tone="glass"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="recruitment-priority"
                className="block text-sm font-semibold text-white"
              >
                Priority
              </label>
              <Select
                id="recruitment-priority"
                value={priority}
                onValueChange={(value) => setPriority(value as RecruitmentPriorityType)}
                options={priorityOptions}
                ariaLabel="Priority"
                tone="glass"
              />
            </div>
            <Button
              type="submit"
              variant="secondary"
              disabled={!playerId || mutations.create.isPending}
            >
              {mutations.create.isPending ? "Adding Target…" : "Add Target"}
            </Button>
          </form>
        </div>
      </Panel>

      {candidatesQuery.isLoading ? (
        <Panel>
          <StatusState tone="loading" title="Loading recruitment pipeline…" />
        </Panel>
      ) : null}
      {candidatesQuery.isError ? (
        <Panel>
          <StatusState
            tone="error"
            title="Pipeline could not be loaded"
            description="Check the backend connection and try again."
          />
        </Panel>
      ) : null}
      {!candidatesQuery.isLoading && !candidates.length ? (
        <Panel>
          <StatusState
            title="Your recruitment pipeline is empty"
            description="Add a player above to start the process."
          />
        </Panel>
      ) : null}

      {candidates.length ? (
        <section aria-labelledby="pipeline-title" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Text id="pipeline-title" as="h2" variant="h2" weight="extrabold">
                Candidate Pipeline
              </Text>
              <Text as="p" variant="body" tone="muted" className="mt-1">
                Update the stage directly on each card. Scroll horizontally to review the full flow.
              </Text>
            </div>
            <div className="flex flex-wrap items-center gap-2" aria-label="Pipeline status summary">
              {stages.map((stage) => (
                <Chip key={stage.value} tone="neutral" size="xs">
                  {stage.label} {candidatesByStage.get(stage.value)?.length ?? 0}
                </Chip>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto overscroll-x-contain pb-4">
            <div className="grid min-w-[133rem] grid-cols-7 gap-4">
              {stages.map((stage) => {
                const stageCandidates = candidatesByStage.get(stage.value) ?? []
                return (
                  <section
                    key={stage.value}
                    aria-labelledby={`stage-${stage.value}`}
                    className={cn(
                      "min-w-0 rounded-3xl border border-emerald-950/8 bg-emerald-50/35 p-3",
                      stage.value === "rejected" && "bg-stone-100/70",
                    )}
                  >
                    <div className="mb-3 border-b border-emerald-950/8 px-1 pb-3">
                      <div className="flex items-center justify-between gap-2">
                        <Text id={`stage-${stage.value}`} as="h3" variant="title" weight="bold">
                          {stage.label}
                        </Text>
                        <span className="flex h-7 min-w-7 items-center justify-center rounded-lg bg-white px-2 text-xs font-extrabold text-emerald-900 tabular-nums shadow-sm">
                          {stageCandidates.length}
                        </span>
                      </div>
                      <Text as="p" variant="caption" tone="muted">
                        {stage.description}
                      </Text>
                    </div>
                    <div className="space-y-3">
                      {stageCandidates.map((candidate) => (
                        <PipelineCard
                          key={candidate._id}
                          candidate={candidate}
                          pending={mutations.update.isPending}
                          onUpdate={(payload) =>
                            mutations.update.mutate(
                              { id: candidate._id, payload },
                              { onError: () => toast.error("Candidate could not be updated") },
                            )
                          }
                          onDelete={() => setCandidateToDelete(candidate)}
                        />
                      ))}
                      {!stageCandidates.length ? (
                        <Text
                          as="p"
                          variant="caption"
                          tone="muted"
                          className="rounded-2xl border border-dashed border-emerald-950/15 bg-white/60 p-4 text-center"
                        >
                          No Candidates
                        </Text>
                      ) : null}
                    </div>
                  </section>
                )
              })}
            </div>
          </div>
        </section>
      ) : null}

      <section aria-labelledby="intelligence-title" className="space-y-3">
        <div>
          <Text id="intelligence-title" as="h2" variant="h2" weight="extrabold">
            Recruitment Intelligence
          </Text>
          <Text as="p" variant="body" tone="muted" className="mt-1 max-w-3xl">
            Build reusable scouting standards, replacement scenarios, alerts and club-specific fit
            models.
          </Text>
        </div>
        <RecruitmentToolsPanel players={playersQuery.data ?? []} candidates={candidates} />
      </section>

      <ConfirmDialog
        open={Boolean(candidateToDelete)}
        onOpenChange={(open) => !open && setCandidateToDelete(null)}
        title="Remove Candidate?"
        description={`${candidateToDelete?.player?.name || "This player"} will be removed from the recruitment pipeline.`}
        confirmLabel="Remove Candidate"
        isConfirming={mutations.remove.isPending}
        onConfirm={() =>
          candidateToDelete &&
          mutations.remove.mutate(candidateToDelete._id, {
            onSuccess: () => {
              setCandidateToDelete(null)
              toast.success("Candidate removed")
            },
            onError: () => toast.error("Candidate could not be removed"),
          })
        }
      />
    </PageContainer>
  )
}
