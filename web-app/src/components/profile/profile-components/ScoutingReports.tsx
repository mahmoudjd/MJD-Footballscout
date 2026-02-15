"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import { useQueryClient } from "@tanstack/react-query"
import { Panel } from "@/components/ui/panel"
import { StatusState } from "@/components/ui/status-state"
import { useGetPlayerReports } from "@/lib/hooks/queries/use-get-player-reports"
import { useUpsertPlayerReport } from "@/lib/hooks/mutations/use-upsert-player-report"
import { useDeleteScoutingReport } from "@/lib/hooks/mutations/use-delete-scouting-report"
import { useToast } from "@/lib/hooks/use-toast"
import { Select } from "@/components/ui/select"

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
  const reportsQuery = useGetPlayerReports(playerId)
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

  const upsertMutation = useUpsertPlayerReport({
    onSuccess: async () => {
      await refetchReports()
      toast.success("Scouting report saved")
    },
    onError: () => toast.error("Failed to save scouting report"),
  })

  const deleteMutation = useDeleteScoutingReport({
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
      <h3 className="text-xl font-semibold text-gray-900">Scouting Reports</h3>

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
          <Panel className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs text-gray-500 uppercase">Reports</p>
              <p className="mt-1 text-xl font-semibold text-gray-900">
                {reportsQuery.data?.summary.totalReports || 0}
              </p>
            </div>
            <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs text-gray-500 uppercase">Avg rating</p>
              <p className="mt-1 text-xl font-semibold text-gray-900">
                {reportsQuery.data?.summary.averageRating ?? "-"}
              </p>
            </div>
            <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs text-gray-500 uppercase">Sign</p>
              <p className="mt-1 text-xl font-semibold text-gray-900">
                {reportsQuery.data?.summary.decisions.sign || 0}
              </p>
            </div>
            <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs text-gray-500 uppercase">Reject</p>
              <p className="mt-1 text-xl font-semibold text-gray-900">
                {reportsQuery.data?.summary.decisions.reject || 0}
              </p>
            </div>
          </Panel>

          <Panel>
            <h4 className="mb-3 text-sm font-semibold text-gray-900">Your evaluation</h4>
            <form className="space-y-3" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  value={form.rating}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, rating: event.target.value }))
                  }
                  placeholder="Rating (1-10)"
                  inputMode="numeric"
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
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
              <input
                value={form.strengths}
                onChange={(event) =>
                  setForm((current) => ({ ...current, strengths: event.target.value }))
                }
                placeholder="Strengths, comma separated"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
              />
              <input
                value={form.weaknesses}
                onChange={(event) =>
                  setForm((current) => ({ ...current, weaknesses: event.target.value }))
                }
                placeholder="Weaknesses, comma separated"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
              />
              <textarea
                value={form.notes}
                onChange={(event) =>
                  setForm((current) => ({ ...current, notes: event.target.value }))
                }
                placeholder="Notes"
                className="h-28 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
              />
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="submit"
                  className="rounded-md bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-600"
                >
                  Save report
                </button>
                {ownReport ? (
                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate({ reportId: ownReport._id })}
                    className="rounded-md border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                  >
                    Delete my report
                  </button>
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
                <article key={report._id} className="rounded-md border border-gray-200 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900">
                      Rating {report.rating}/10 • {report.decision.toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-500">
                      Updated {new Date(report.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-gray-700">
                    {report.notes || "No notes provided."}
                  </p>
                  {report.strengths.length > 0 || report.weaknesses.length > 0 ? (
                    <div className="mt-2 grid grid-cols-1 gap-2 text-xs text-gray-600 sm:grid-cols-2">
                      <p>
                        <span className="font-semibold text-gray-700">Strengths:</span>{" "}
                        {report.strengths.join(", ") || "-"}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-700">Weaknesses:</span>{" "}
                        {report.weaknesses.join(", ") || "-"}
                      </p>
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
