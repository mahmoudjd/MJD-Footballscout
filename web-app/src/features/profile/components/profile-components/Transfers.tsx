import { OutlineIcons } from "@/components/icons/outline-icons"
import { TransferType } from "@/lib/types/type"
import { JSX } from "react"
import { Text } from "@/components/ui/text"

interface Props {
  transfers: Array<TransferType>
}

const amountFormatter = new Intl.NumberFormat("en-GB")

function parseAmount(amount: string): { display: string; fullValue?: string; icon: JSX.Element } {
  const cleaned = amount?.toString()?.trim()

  if (!cleaned) {
    return {
      display: "Undisclosed",
      icon: (
        <OutlineIcons.QuestionMarkCircleIcon className="h-5 w-5 text-stone-500" aria-hidden="true" />
      ),
    }
  }

  if (/^\d{4}$/.test(cleaned)) {
    return {
      display: `Until ${cleaned}`,
      icon: <OutlineIcons.ClockIcon className="h-5 w-5 text-amber-500" aria-hidden="true" />,
    }
  }

  if (cleaned === "Free Transfer") {
    return {
      display: "Free Transfer",
      icon: (
        <OutlineIcons.ArrowsRightLeftIcon className="h-5 w-5 text-indigo-500" aria-hidden="true" />
      ),
    }
  }

  // Format amounts like 180M or 15K
  const match = cleaned.match(/^(\d+(?:\.\d+)?)([MK])$/i)
  if (match) {
    const num = parseFloat(match[1])
    const unit = match[2].toUpperCase()
    const fullValue =
      unit === "M"
        ? `€${amountFormatter.format(num * 1_000_000)}`
        : `€${amountFormatter.format(num * 1_000)}`
    return {
      display: `€${cleaned.toUpperCase()}`,
      fullValue,
      icon: <OutlineIcons.CurrencyEuroIcon className="h-5 w-5 text-green-600" aria-hidden="true" />,
    }
  }

  // fallback: just return raw value with €
  return {
    display: `€${cleaned}`,
    icon: <OutlineIcons.CurrencyEuroIcon className="h-5 w-5 text-green-600" aria-hidden="true" />,
  }
}

export default function Transfers({ transfers }: Props) {
  return (
    <section className="space-y-4">
      <Text as="h2" variant="h3" weight="bold" className="text-emerald-950">
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
                <span className="h-3 w-3 rounded-full border-2 border-lime-200 bg-emerald-700 shadow-sm" />
                {!isLast ? (
                  <span className="mt-1 h-full w-0.5 rounded-full bg-emerald-200" />
                ) : null}
              </div>

              <div className="min-w-0 flex-1 rounded-2xl border border-emerald-950/8 bg-linear-to-br from-white to-emerald-50/35 p-4 shadow-[0_16px_30px_-26px_rgba(15,50,36,0.38)]">
                <div className="flex items-center gap-2 text-sm text-emerald-950/55">
                  <OutlineIcons.CalendarIcon
                    className="h-5 w-5 text-emerald-700"
                    aria-hidden="true"
                  />
                  <Text as="span" weight="medium">
                    {t.season || "-"}
                  </Text>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <OutlineIcons.ArrowsRightLeftIcon
                    className="h-5 w-5 text-emerald-700"
                    aria-hidden="true"
                  />
                  <Text as="span" weight="bold" className="min-w-0 break-words text-emerald-950">
                    {t.team || "-"}
                  </Text>
                </div>

                <div className="mt-2 flex items-center gap-2 text-sm text-emerald-950/70">
                  <span className="h-5 w-5 text-green-700">{icon}</span>
                  <Text
                    as="span"
                    weight="semibold"
                    className="text-emerald-950 tabular-nums"
                    title={fullValue ?? ""}
                  >
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
