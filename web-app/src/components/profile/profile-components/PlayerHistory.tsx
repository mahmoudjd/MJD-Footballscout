"use client"

import { Panel } from "@/components/ui/panel"
import { StatusState } from "@/components/ui/status-state"
import { useGetPlayerHistory } from "@/lib/hooks/queries/use-get-player-history"

interface PlayerHistoryProps {
  playerId: string
}

function formatEloDelta(value: number | null | undefined) {
  if (typeof value !== "number" || value === 0) return "0"
  return value > 0 ? `+${value}` : `${value}`
}

export default function PlayerHistory({ playerId }: PlayerHistoryProps) {
  const historyQuery = useGetPlayerHistory(playerId, 40)

  return (
    <section className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-900">History & Alerts</h3>

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
            <h4 className="mb-3 text-sm font-semibold text-gray-900">Recent alerts</h4>
            {historyQuery.data?.alerts.length ? (
              <ul className="space-y-2">
                {historyQuery.data.alerts.map((alert, index) => (
                  <li
                    key={`${alert.type}-${alert.timestamp.toString()}-${index}`}
                    className={`rounded-md border px-3 py-2 text-sm ${
                      alert.severity === "high"
                        ? "border-red-200 bg-red-50 text-red-900"
                        : alert.severity === "medium"
                          ? "border-amber-200 bg-amber-50 text-amber-900"
                          : "border-cyan-200 bg-cyan-50 text-cyan-900"
                    }`}
                  >
                    <p className="font-medium">{alert.message}</p>
                    <p className="mt-0.5 text-xs opacity-80">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <StatusState tone="empty" title="No notable alerts yet" />
            )}
          </Panel>

          <Panel className="overflow-x-auto p-0">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Timestamp</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">ELO Delta</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Value</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Club</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(historyQuery.data?.history || []).map((entry) => (
                  <tr key={entry._id}>
                    <td className="px-4 py-3 text-gray-700">
                      {new Date(entry.timestamp).toLocaleString()}
                    </td>
                    <td
                      className={`px-4 py-3 font-medium ${
                        (entry.eloDelta || 0) > 0
                          ? "text-emerald-700"
                          : (entry.eloDelta || 0) < 0
                            ? "text-red-700"
                            : "text-gray-700"
                      }`}
                    >
                      {formatEloDelta(entry.eloDelta)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {entry.valueChanged
                        ? `${entry.oldValue || "-"} -> ${entry.newValue || "-"}`
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {entry.clubChanged
                        ? `${entry.oldClub || "-"} -> ${entry.newClub || "-"}`
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
