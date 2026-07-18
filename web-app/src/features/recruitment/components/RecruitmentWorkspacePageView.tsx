"use client"

import { useMemo, useState, type FormEvent } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Input } from "@/components/ui/input"
import { LoginRequiredState } from "@/components/ui/login-required-state"
import { PageContainer } from "@/components/ui/page-container"
import { Panel } from "@/components/ui/panel"
import { SectionHeader } from "@/components/ui/section-header"
import { StatusState } from "@/components/ui/status-state"
import { Text } from "@/components/ui/text"
import { Textarea } from "@/components/ui/textarea"
import { usePlayersQuery } from "@/features/players/hooks/usePlayersQuery"
import {
  useRecruitmentCandidates,
  useRecruitmentPipelineMutations,
} from "@/features/recruitment/hooks/useRecruitmentPipeline"
import { useToast } from "@/lib/hooks/useToast"
import { RecruitmentToolsPanel } from "@/features/recruitment/components/RecruitmentToolsPanel"
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

function toDateInput(date: Date | null) {
  if (!date) return ""
  const safeDate = date instanceof Date ? date : new Date(date)
  return Number.isNaN(safeDate.getTime()) ? "" : safeDate.toISOString().slice(0, 10)
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
  const player = candidate.player
  return (
    <article className="rounded-2xl border border-emerald-950/10 bg-white p-3.5 shadow-[0_14px_28px_-24px_rgba(15,50,36,0.55)]">
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="min-w-0">
          {player ? (
            <Link
              href={`/players/${player._id}`}
              className="block truncate font-bold text-emerald-950 hover:underline"
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
        <span className="rounded-full bg-emerald-950 px-2 py-1 text-[10px] font-extrabold text-white tabular-nums">
          {player?.elo || "—"} ELO
        </span>
      </div>

      <div className="mt-3 grid gap-2">
        <label className="space-y-1 text-xs font-semibold text-emerald-950">
          Stage
          <select
            value={candidate.stage}
            onChange={(event) =>
              onUpdate(
                candidatePayload(candidate, { stage: event.target.value as RecruitmentStageType }),
              )
            }
            disabled={pending}
            className="mt-1 min-h-9 w-full rounded-lg border border-emerald-950/15 bg-white px-2 text-xs focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:outline-none"
          >
            {stages.map((stage) => (
              <option key={stage.value} value={stage.value}>
                {stage.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-xs font-semibold text-emerald-950">
          Priority
          <select
            value={candidate.priority}
            onChange={(event) =>
              onUpdate(
                candidatePayload(candidate, {
                  priority: event.target.value as RecruitmentPriorityType,
                }),
              )
            }
            disabled={pending}
            className="mt-1 min-h-9 w-full rounded-lg border border-emerald-950/15 bg-white px-2 text-xs capitalize focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:outline-none"
          >
            {priorities.map((priority) => (
              <option key={priority}>{priority}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-xs font-semibold text-emerald-950">
          Assignee
          <Input
            value={assignee}
            onChange={(event) => setAssignee(event.target.value)}
            onBlur={() =>
              assignee !== candidate.assignee && onUpdate(candidatePayload(candidate, { assignee }))
            }
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
                  deadline: event.target.value ? new Date(`${event.target.value}T12:00:00`) : null,
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
            rows={3}
          />
        </label>
      </div>
      <div className="mt-3 flex gap-2">
        <Button
          size="xs"
          fullWidth
          disabled={pending || notes === candidate.notes}
          onClick={() => onUpdate(candidatePayload(candidate, { notes }))}
        >
          Save Notes
        </Button>
        <Button size="xs" variant="ghost" onClick={onDelete}>
          Remove
        </Button>
      </div>
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
        description="Move every target through a clear, accountable recruitment process."
        icon="RocketLaunchIcon"
        badge={`${candidates.length} candidates`}
      />
      <RecruitmentToolsPanel players={playersQuery.data ?? []} candidates={candidates} />
      <Panel>
        <form
          onSubmit={handleCreate}
          className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_12rem_auto] lg:items-end"
        >
          <label className="space-y-1.5 text-sm font-semibold text-emerald-950">
            Add Player
            <select
              value={playerId}
              onChange={(event) => setPlayerId(event.target.value)}
              className="mt-1 min-h-11 w-full rounded-xl border border-emerald-950/15 bg-white px-3 text-sm focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:outline-none"
            >
              <option value="">Choose a player…</option>
              {availablePlayers.map((player) => (
                <option key={player._id} value={player._id}>
                  {player.name} · {player.position} · {player.currentClub || player.country}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5 text-sm font-semibold text-emerald-950">
            Priority
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value as RecruitmentPriorityType)}
              className="mt-1 min-h-11 w-full rounded-xl border border-emerald-950/15 bg-white px-3 text-sm capitalize focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:outline-none"
            >
              {priorities.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <Button type="submit" disabled={!playerId || mutations.create.isPending}>
            Add To Pipeline
          </Button>
        </form>
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
        <div className="overflow-x-auto overscroll-x-contain pb-4">
          <div className="grid min-w-[112rem] grid-cols-7 gap-4">
            {stages.map((stage) => {
              const stageCandidates = candidates.filter(
                (candidate) => candidate.stage === stage.value,
              )
              return (
                <section
                  key={stage.value}
                  className="rounded-3xl border border-emerald-950/8 bg-emerald-50/45 p-3"
                >
                  <div className="mb-3 flex items-start justify-between gap-2 px-1">
                    <div>
                      <Text as="h2" variant="title" weight="bold">
                        {stage.label}
                      </Text>
                      <Text as="p" variant="caption" tone="muted">
                        {stage.description}
                      </Text>
                    </div>
                    <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-emerald-800 tabular-nums">
                      {stageCandidates.length}
                    </span>
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
                        No candidates
                      </Text>
                    ) : null}
                  </div>
                </section>
              )
            })}
          </div>
        </div>
      ) : null}

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
