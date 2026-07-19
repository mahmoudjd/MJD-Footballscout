import { Text } from "@/components/ui/text"
import { ActionLink } from "@/components/ui/action-link"
import { PageContainer } from "@/components/ui/page-container"
import { Panel } from "@/components/ui/panel"
import { StatusState } from "@/components/ui/status-state"

export default function NotFound() {
  return (
    <PageContainer size="narrow" spacing="relaxed">
      <Panel className="space-y-5 text-center">
        <Text as="h1" variant="h1" weight="bold" className="tracking-tight text-emerald-950">
          Player Not Found
        </Text>
        <StatusState
          tone="empty"
          title="This Player Is Unavailable"
          description="The profile may have moved or no longer exists. Browse the player database to continue scouting."
        />
        <ActionLink href="/players" size="md" fullWidth={false}>
          Browse Players
        </ActionLink>
      </Panel>
    </PageContainer>
  )
}
