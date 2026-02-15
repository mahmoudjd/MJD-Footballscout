import { OutlineIcons } from "@/components/outline-icons"
import { TransferType } from "@/lib/types/type"
import { JSX } from "react"

interface Props {
  transfers: Array<TransferType>
}

function parseAmount(amount: string): { display: string; fullValue?: string; icon: JSX.Element } {
  const cleaned = amount?.toString()?.trim()

  if (!cleaned) {
    return {
      display: "Undisclosed",
      icon: <OutlineIcons.QuestionMarkCircleIcon className="h-5 w-5 text-gray-400" />,
    }
  }

  if (/^\d{4}$/.test(cleaned)) {
    return {
      display: `Until ${cleaned}`,
      icon: <OutlineIcons.ClockIcon className="h-5 w-5 text-amber-500" />,
    }
  }

  if (cleaned === "Free Transfer") {
    return {
      display: "Free Transfer",
      icon: <OutlineIcons.ArrowsRightLeftIcon className="h-5 w-5 text-indigo-500" />,
    }
  }

  // Format amounts like 180M or 15K
  const match = cleaned.match(/^(\d+(?:\.\d+)?)([MK])$/i)
  if (match) {
    const num = parseFloat(match[1])
    const unit = match[2].toUpperCase()
    const fullValue =
      unit === "M" ? `€${(num * 1_000_000).toLocaleString()}` : `€${(num * 1_000).toLocaleString()}`
    return {
      display: `€${cleaned.toUpperCase()}`,
      fullValue,
      icon: <OutlineIcons.CurrencyEuroIcon className="h-5 w-5 text-green-600" />,
    }
  }

  // fallback: just return raw value with €
  return {
    display: `€${cleaned}`,
    icon: <OutlineIcons.CurrencyEuroIcon className="h-5 w-5 text-green-600" />,
  }
}

export default function Transfers({ transfers }: Props) {
  return (
    <section className="rounded-2xl bg-gray-50 p-4 shadow-lg sm:p-6">
      <h3 className="mb-6 pb-2 text-xl font-semibold text-gray-800 sm:text-2xl">Transfers</h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {transfers.map((t, idx) => {
          const { display, fullValue, icon } = parseAmount(t.amount)

          return (
            <div
              key={`${t.season}-${t.team}-${t.amount}-${idx}`}
              className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              {/* Season */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <OutlineIcons.CalendarIcon className="h-5 w-5 text-cyan-600" />
                <span className="font-medium">{t.season}</span>
              </div>

              {/* Team */}
              <div className="flex items-center gap-2">
                <OutlineIcons.ArrowsRightLeftIcon className="h-6 w-6 text-indigo-600" />
                <span className="text-base font-semibold text-indigo-700">{t.team}</span>
              </div>

              {/* Amount */}
              <div className="mt-auto flex items-center gap-2 text-sm text-gray-600">
                {icon}
                <span className="font-bold text-gray-800" title={fullValue ?? ""}>
                  {display}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
