import { ActionLink } from "@/components/ui/action-link"
import { Panel } from "@/components/ui/panel"
import { StatusState } from "@/components/ui/status-state"
import { cn } from "@/lib/cn"

interface LoginRequiredStateProps {
  callbackUrl: string
  title?: string
  description?: string
  buttonLabel?: string
  className?: string
}

export function LoginRequiredState({
  callbackUrl,
  title = "Login required",
  description = "You need to sign in to continue.",
  buttonLabel = "Go to login",
  className,
}: LoginRequiredStateProps) {
  return (
    <Panel className={cn("space-y-4 text-center", className)}>
      <StatusState tone="empty" title={title} description={description} />
      <ActionLink
        href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
        variant="primary"
        size="md"
        fullWidth={false}
        className="mx-auto"
      >
        {buttonLabel}
      </ActionLink>
    </Panel>
  )
}
