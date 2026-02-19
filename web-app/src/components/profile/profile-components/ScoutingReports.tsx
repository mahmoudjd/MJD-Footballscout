"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import { useQueryClient } from "@tanstack/react-query"
import { Panel } from "@/components/ui/panel"
import { StatusState } from "@/components/ui/status-state"
import { usePlayerReportsQuery } from "@/lib/hooks/queries/usePlayerReportsQuery"
import { useUpsertPlayerReportMutation } from "@/lib/hooks/mutations/useUpsertPlayerReportMutation"
import { useDeleteScoutingReportMutation } from "@/lib/hooks/mutations/useDeleteScoutingReportMutation"
import { useToast } from "@/lib/hooks/useToast"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

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
    await queryClient.invalidateQueries({ queryKey: ["players", playerId, "reports"] })
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

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const rating = Number(form.rating)
    if (!Number.isFinite(rating) || rating < 1 || rating > 10) {
      toast.error("Rating must be between 1 and 10")
      return
    }
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
      <Text as="h3" variant="h3" weight="semibold" className="text-slate-900">
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
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <Text as="p" variant="overline" tone="subtle">
                Reports
              </Text>
              <Text as="p" variant="h3" weight="semibold" className="mt-1 text-slate-900">
                {reportsQuery.data?.summary.totalReports || 0}
              </Text>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <Text as="p" variant="overline" tone="subtle">
                Avg rating
              </Text>
              <Text as="p" variant="h3" weight="semibold" className="mt-1 text-slate-900">
                {reportsQuery.data?.summary.averageRating ?? "-"}
              </Text>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <Text as="p" variant="overline" tone="subtle">
                Sign
              </Text>
              <Text as="p" variant="h3" weight="semibold" className="mt-1 text-slate-900">
                {reportsQuery.data?.summary.decisions.sign || 0}
              </Text>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <Text as="p" variant="overline" tone="subtle">
                Reject
              </Text>
              <Text as="p" variant="h3" weight="semibold" className="mt-1 text-slate-900">
                {reportsQuery.data?.summary.decisions.reject || 0}
              </Text>
            </div>
          </Panel>

          <Panel>
            <Text as="h4" weight="semibold" className="mb-3 text-slate-900">
              Your evaluation
            </Text>
            <form className="space-y-3" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input
                  value={form.rating}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, rating: event.target.value }))
                  }
                  placeholder="Rating (1-10)"
                  inputMode="numeric"
                  inputSize="sm"
                />
                <Select
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
              </div>
              <Input
                value={form.strengths}
                onChange={(event) =>
                  setForm((current) => ({ ...current, strengths: event.target.value }))
                }
                placeholder="Strengths, comma separated"
                inputSize="sm"
              />
              <Input
                value={form.weaknesses}
                onChange={(event) =>
                  setForm((current) => ({ ...current, weaknesses: event.target.value }))
                }
                placeholder="Weaknesses, comma separated"
                inputSize="sm"
              />
              <Textarea
                value={form.notes}
                onChange={(event) =>
                  setForm((current) => ({ ...current, notes: event.target.value }))
                }
                placeholder="Notes"
                textareaSize="sm"
                className="h-28"
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                >
                  Save report
                </Button>
                {ownReport ? (
                  <Button
                    type="button"
                    onClick={() => deleteMutation.mutate({ reportId: ownReport._id })}
                    variant="outline"
                    size="md"
                    className="border-red-200 text-red-700 hover:bg-red-50"
                  >
                    Delete my report
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
                <article key={report._id} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Text as="p" weight="semibold" className="text-slate-900">
                      Rating {report.rating}/10 • {report.decision.toUpperCase()}
                    </Text>
                    <Text as="p" variant="caption" tone="subtle">
                      Updated {new Date(report.updatedAt).toLocaleString()}
                    </Text>
                  </div>
                  <Text as="p" className="mt-2 text-slate-700">
                    {report.notes || "No notes provided."}
                  </Text>
                  {report.strengths.length > 0 || report.weaknesses.length > 0 ? (
                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <Text as="p" variant="caption" tone="muted">
                        <Text as="span" variant="caption" weight="semibold" className="text-slate-700">
                          Strengths:
                        </Text>{" "}
                        {report.strengths.join(", ") || "-"}
                      </Text>
                      <Text as="p" variant="caption" tone="muted">
                        <Text as="span" variant="caption" weight="semibold" className="text-slate-700">
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
    </section>
  )
}
