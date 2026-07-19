import { OutlineIcons } from "@/components/icons/outline-icons"
import { ActionLink } from "@/components/ui/action-link"
import { Panel } from "@/components/ui/panel"
import { Text } from "@/components/ui/text"

type PremiumRequiredStateProps = {
  feature: string
  description: string
}

export function PremiumRequiredState({ feature, description }: PremiumRequiredStateProps) {
  return (
    <Panel className="overflow-hidden p-0!">
      <div className="grid gap-6 bg-linear-to-br from-emerald-950 via-emerald-900 to-emerald-800 p-6 text-white sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="flex min-w-0 gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-lime-300 text-emerald-950 shadow-lg shadow-emerald-950/25">
            <OutlineIcons.SparklesIcon className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <Text
              as="p"
              variant="caption"
              tone="inherit"
              className="font-bold tracking-widest text-lime-200 uppercase"
            >
              Premium feature
            </Text>
            <Text as="h2" variant="h2" weight="extrabold" tone="inherit" className="mt-1">
              Unlock {feature}
            </Text>
            <Text
              as="p"
              variant="body"
              tone="inherit"
              className="mt-2 max-w-2xl text-emerald-100/85"
            >
              {description}
            </Text>
          </div>
        </div>
        <ActionLink href="/pricing" variant="secondary" size="md" fullWidth={false}>
          View Premium
        </ActionLink>
      </div>
    </Panel>
  )
}
