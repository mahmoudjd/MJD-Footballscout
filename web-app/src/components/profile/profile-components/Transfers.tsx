import { OutlineIcons } from "@/components/outline-icons"
import { TransferType } from "@/lib/types/type"
import { JSX } from "react"
import { Text } from "@/components/ui/text"

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
    <section className="space-y-4">
      <Text as="h3" variant="h3" weight="semibold" className="text-slate-900">
        Transfers
      </Text>

      <div className="space-y-2">
        {transfers.map((t, idx) => {
          const { display, fullValue, icon } = parseAmount(t.amount)
          const isLast = idx === transfers.length - 1

          return (
            <div
              key={`${t.season}-${t.team}-${t.amount}-${idx}`}
              className="flex items-stretch gap-3"
            >
              <div className="flex w-4 flex-col items-center pt-1">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-600" />
                {!isLast ? <span className="mt-1 h-full w-0.5 rounded-full bg-slate-200" /> : null}
              </div>

              <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <OutlineIcons.CalendarIcon className="h-5 w-5 text-cyan-600" />
                  <Text as="span" weight="medium">
                    {t.season || "-"}
                  </Text>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <OutlineIcons.ArrowsRightLeftIcon className="h-5 w-5 text-indigo-600" />
                  <Text as="span" weight="semibold" className="text-slate-800">
                    {t.team || "-"}
                  </Text>
                </div>

                <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                  <span className="h-5 w-5 text-green-700">{icon}</span>
                  <Text as="span" weight="semibold" className="text-slate-800" title={fullValue ?? ""}>
                    {display}
                  </Text>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
