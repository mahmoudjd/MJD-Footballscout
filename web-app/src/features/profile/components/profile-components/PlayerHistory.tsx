"use client"

import { Panel } from "@/components/ui/panel"
import { StatusState } from "@/components/ui/status-state"
import { usePlayerHistoryQuery } from "@/features/players/hooks/usePlayerHistoryQuery"
import { Text } from "@/components/ui/text"

const historyDateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
})

interface PlayerHistoryProps {
  playerId: string
}

function formatEloDelta(value: number | null | undefined) {
  if (typeof value !== "number" || value === 0) return "0"
  return value > 0 ? `+${value}` : `${value}`
}

export default function PlayerHistory({ playerId }: PlayerHistoryProps) {
  const historyQuery = usePlayerHistoryQuery(playerId, 40)

  return (
    <section className="space-y-4">
      <Text as="h2" variant="h3" weight="bold" className="text-emerald-950">
        History & Alerts
      </Text>

      {historyQuery.isLoading ? (
        <Panel>
          <StatusState tone="loading" title="Loading player history" />
        </Panel>
      ) : historyQuery.isError ? (
        <Panel>
          <StatusState tone="error" title="Player history unavailable" />
        </Panel>
      ) : (
        <>
          <Panel>
            <Text as="h4" weight="semibold" className="mb-3 text-slate-900">
              Recent alerts
            </Text>
            {historyQuery.data?.alerts.length ? (
              <ul className="space-y-2">
                {historyQuery.data.alerts.map((alert, index) => (
                  <li
                    key={`${alert.type}-${alert.timestamp.toString()}-${index}`}
                    className={`rounded-xl border px-3 py-2 text-sm ${
                      alert.severity === "high"
                        ? "border-red-200 bg-red-50 text-red-900"
                        : alert.severity === "medium"
                          ? "border-amber-200 bg-amber-50 text-amber-900"
                          : "border-stone-200 bg-stone-50 text-stone-900"
                    }`}
                  >
                    <Text as="p" weight="medium">
                      {alert.message}
                    </Text>
                    <Text as="p" variant="caption" className="mt-0.5 opacity-80">
                      {historyDateFormatter.format(new Date(alert.timestamp))}
                    </Text>
                  </li>
                ))}
              </ul>
            ) : (
              <StatusState tone="empty" title="No notable alerts yet" />
            )}
          </Panel>

          <Panel className="overflow-x-auto p-0">
            <table className="min-w-full divide-y divide-emerald-950/8 text-sm tabular-nums">
              <thead className="bg-emerald-50/70">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left font-bold text-emerald-950">
                    Timestamp
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-bold text-emerald-950">
                    ELO Delta
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-bold text-emerald-950">
                    Value
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-bold text-emerald-950">
                    Club
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {(historyQuery.data?.history || []).map((entry) => (
                  <tr key={entry._id}>
                    <td className="px-4 py-3 text-slate-700">
                      {historyDateFormatter.format(new Date(entry.timestamp))}
                    </td>
                    <td
                      className={`px-4 py-3 font-medium ${
                        (entry.eloDelta || 0) > 0
                          ? "text-emerald-700"
                          : (entry.eloDelta || 0) < 0
                            ? "text-red-700"
                            : "text-slate-700"
                      }`}
                    >
                      {formatEloDelta(entry.eloDelta)}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {entry.valueChanged
                        ? `${entry.oldValue || "-"} → ${entry.newValue || "-"}`
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {entry.clubChanged
                        ? `${entry.oldClub || "-"} → ${entry.newClub || "-"}`
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </>
      )}
    </section>
  )
}
