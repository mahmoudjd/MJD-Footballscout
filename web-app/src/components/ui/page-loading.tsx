import { PageContainer } from "@/components/ui/page-container"
import { Panel } from "@/components/ui/panel"
import { StatusState } from "@/components/ui/status-state"

interface PageLoadingProps {
  label?: string
}

export function PageLoading({ label = "Loading Page…" }: PageLoadingProps) {
  return (
    <PageContainer size="narrow" spacing="relaxed">
      <Panel tone="soft">
        <StatusState
          tone="loading"
          title={label}
          description="Your workspace will be ready in a moment."
        />
      </Panel>
    </PageContainer>
  )
}
