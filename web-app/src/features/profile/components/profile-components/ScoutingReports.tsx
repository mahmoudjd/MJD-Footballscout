"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import { useQueryClient } from "@tanstack/react-query"
import { Panel } from "@/components/ui/panel"
import { StatusState } from "@/components/ui/status-state"
import { usePlayerReportsQuery } from "@/features/players/hooks/usePlayerReportsQuery"
import { useUpsertPlayerReportMutation } from "@/features/players/hooks/useUpsertPlayerReportMutation"
import { useDeleteScoutingReportMutation } from "@/features/players/hooks/useDeleteScoutingReportMutation"
import { useToast } from "@/lib/hooks/useToast"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { queryKeys } from "@/lib/react-query/query-keys"
import { FormField } from "@/components/ui/form-field"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { StatTile } from "@/components/ui/stat-tile"

const reportDateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
})

interface ScoutingReportsProps {
  playerId: string
}

interface ReportFormState {
  rating: string
  decision: "watch" | "sign" | "reject"
  strengths: string
  weaknesses: string
  notes: string
}

const defaultForm: ReportFormState = {
  rating: "7",
  decision: "watch",
  strengths: "",
  weaknesses: "",
  notes: "",
}

function toTagList(raw: string) {
  return raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
}

export default function ScoutingReports({ playerId }: ScoutingReportsProps) {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const toast = useToast()
  const [form, setForm] = useState<ReportFormState>(defaultForm)
  const [ratingError, setRatingError] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const reportsQuery = usePlayerReportsQuery(playerId)
  const reports = useMemo(() => reportsQuery.data?.reports ?? [], [reportsQuery.data?.reports])
  const ownReport = useMemo(
    () => reports.find((report) => report.userId === session?.user?.id),
    [reports, session?.user?.id],
  )

  useEffect(() => {
    if (!ownReport) {
      setForm(defaultForm)
      return
    }
    setForm({
      rating: String(ownReport.rating),
      decision: ownReport.decision,
      strengths: ownReport.strengths.join(", "),
      weaknesses: ownReport.weaknesses.join(", "),
      notes: ownReport.notes || "",
    })
  }, [ownReport])

  const refetchReports = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.players.reports(playerId) })
  }

  const upsertMutation = useUpsertPlayerReportMutation({
    onSuccess: async () => {
      await refetchReports()
      toast.success("Scouting report saved")
    },
    onError: () => toast.error("Failed to save scouting report"),
  })

  const deleteMutation = useDeleteScoutingReportMutation({
    onSuccess: async () => {
      await refetchReports()
      toast.success("Scouting report deleted")
    },
    onError: () => toast.error("Failed to delete scouting report"),
  })
  const isMutating = upsertMutation.isPending || deleteMutation.isPending

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const rating = Number(form.rating)
    if (!Number.isFinite(rating) || rating < 1 || rating > 10) {
      setRatingError("Enter a rating between 1 and 10.")
      return
    }
    setRatingError("")
    upsertMutation.mutate({
      playerId,
      report: {
        rating,
        decision: form.decision,
        strengths: toTagList(form.strengths),
        weaknesses: toTagList(form.weaknesses),
        notes: form.notes.trim(),
      },
    })
  }

  return (
    <section className="space-y-4">
      <Text as="h2" variant="h3" weight="bold" className="text-emerald-950">
        Scouting Reports
      </Text>

      {reportsQuery.isLoading ? (
        <Panel>
          <StatusState tone="loading" title="Loading scouting reports" />
        </Panel>
      ) : reportsQuery.isError ? (
        <Panel>
          <StatusState tone="error" title="Scouting reports unavailable" />
        </Panel>
      ) : (
        <>
          <Panel tone="soft" className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <StatTile label="Reports" value={reportsQuery.data?.summary.totalReports || 0} />
            <StatTile label="Avg Rating" value={reportsQuery.data?.summary.averageRating ?? "-"} />
            <StatTile label="Sign" value={reportsQuery.data?.summary.decisions.sign || 0} />
            <StatTile label="Reject" value={reportsQuery.data?.summary.decisions.reject || 0} />
          </Panel>

          <Panel>
            <Text as="h3" variant="title" weight="bold" className="mb-4 text-emerald-950">
              Your Evaluation
            </Text>
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormField label="Rating" htmlFor="report-rating" error={ratingError} required>
                  <Input
                    id="report-rating"
                    name="rating"
                    type="number"
                    min={1}
                    max={10}
                    value={form.rating}
                    onChange={(event) => {
                      setRatingError("")
                      setForm((current) => ({ ...current, rating: event.target.value }))
                    }}
                    placeholder="Example: 8…"
                    inputMode="numeric"
                    inputSize="sm"
                    autoComplete="off"
                    aria-invalid={Boolean(ratingError)}
                    aria-describedby={ratingError ? "report-rating-error" : undefined}
                  />
                </FormField>
                <FormField label="Decision" htmlFor="report-decision" required>
                  <Select
                    id="report-decision"
                    name="decision"
                    ariaLabel="Decision"
                    placeholder="Select Decision…"
                    value={form.decision}
                    onValueChange={(value) =>
                      setForm((current) => ({
                        ...current,
                        decision: value as ReportFormState["decision"],
                      }))
                    }
                    options={[
                      { value: "watch", label: "Watch" },
                      { value: "sign", label: "Sign" },
                      { value: "reject", label: "Reject" },
                    ]}
                  />
                </FormField>
              </div>
              <FormField
                label="Strengths"
                htmlFor="report-strengths"
                hint="Separate multiple strengths with commas."
              >
                <Input
                  id="report-strengths"
                  name="strengths"
                  value={form.strengths}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, strengths: event.target.value }))
                  }
                  placeholder="Example: Pace, positioning…"
                  inputSize="sm"
                  autoComplete="off"
                />
              </FormField>
              <FormField
                label="Weaknesses"
                htmlFor="report-weaknesses"
                hint="Separate multiple weaknesses with commas."
              >
                <Input
                  id="report-weaknesses"
                  name="weaknesses"
                  value={form.weaknesses}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, weaknesses: event.target.value }))
                  }
                  placeholder="Example: Aerial duels…"
                  inputSize="sm"
                  autoComplete="off"
                />
              </FormField>
              <FormField label="Notes" htmlFor="report-notes">
                <Textarea
                  id="report-notes"
                  name="notes"
                  value={form.notes}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, notes: event.target.value }))
                  }
                  placeholder="Add your scouting observations…"
                  textareaSize="sm"
                  className="h-28"
                  autoComplete="off"
                />
              </FormField>
              <div className="flex flex-wrap items-center gap-2">
                <Button type="submit" variant="primary" size="md" disabled={isMutating}>
                  {upsertMutation.isPending ? "Saving…" : "Save Report"}
                </Button>
                {ownReport ? (
                  <Button
                    type="button"
                    onClick={() => setDeleteDialogOpen(true)}
                    variant="outline"
                    size="md"
                    className="border-red-200 text-red-700 hover:bg-red-50"
                    disabled={isMutating}
                  >
                    {deleteMutation.isPending ? "Deleting…" : "Delete My Report"}
                  </Button>
                ) : null}
              </div>
            </form>
          </Panel>

          {reports.length === 0 ? (
            <Panel>
              <StatusState
                tone="empty"
                title="No scouting reports yet"
                description="Create the first evaluation for this player."
              />
            </Panel>
          ) : (
            <Panel className="space-y-3">
              {reports.map((report) => (
                <article
                  key={report._id}
                  className="rounded-2xl border border-emerald-950/8 bg-linear-to-br from-white to-emerald-50/35 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Text as="p" weight="bold" className="text-emerald-950 tabular-nums">
                      Rating {report.rating}/10 • {report.decision.toUpperCase()}
                    </Text>
                    <Text as="p" variant="caption" tone="subtle">
                      Updated {reportDateFormatter.format(new Date(report.updatedAt))}
                    </Text>
                  </div>
                  <Text as="p" className="mt-2 break-words text-emerald-950/75">
                    {report.notes || "No notes provided."}
                  </Text>
                  {report.strengths.length > 0 || report.weaknesses.length > 0 ? (
                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <Text as="p" variant="caption" tone="muted">
                        <Text
                          as="span"
                          variant="caption"
                          weight="semibold"
                          className="text-stone-700"
                        >
                          Strengths:
                        </Text>{" "}
                        {report.strengths.join(", ") || "-"}
                      </Text>
                      <Text as="p" variant="caption" tone="muted">
                        <Text
                          as="span"
                          variant="caption"
                          weight="semibold"
                          className="text-stone-700"
                        >
                          Weaknesses:
                        </Text>{" "}
                        {report.weaknesses.join(", ") || "-"}
                      </Text>
                    </div>
                  ) : null}
                </article>
              ))}
            </Panel>
          )}
        </>
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Scouting Report?"
        description="This permanently removes your evaluation for this player."
        confirmLabel="Delete Report"
        onConfirm={() => {
          if (!ownReport) return
          deleteMutation.mutate(
            { reportId: ownReport._id },
            { onSuccess: () => setDeleteDialogOpen(false) },
          )
        }}
        isConfirming={deleteMutation.isPending}
      />
    </section>
  )
}
