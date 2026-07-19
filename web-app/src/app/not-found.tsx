import { ActionLink } from "@/components/ui/action-link"
import { PageContainer } from "@/components/ui/page-container"
import { Panel } from "@/components/ui/panel"
import { StatusState } from "@/components/ui/status-state"
import { Text } from "@/components/ui/text"

export default function GlobalNotFound() {
  return (
    <PageContainer size="narrow" spacing="relaxed">
      <Panel className="space-y-5 text-center">
        <Text as="p" variant="overline" className="text-emerald-700">
          Error 404
        </Text>
        <Text as="h1" variant="h1" weight="extrabold" className="text-emerald-950">
          Page Not Found
        </Text>
        <StatusState
          tone="empty"
          title="This Page Is Unavailable"
          description="Check the address or return to your scouting workspace."
        />
        <ActionLink href="/" size="md" fullWidth={false}>
          Return Home
        </ActionLink>
      </Panel>
    </PageContainer>
  )
}
