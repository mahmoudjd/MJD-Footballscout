"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
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
    <Panel className={cn("space-y-4", className)}>
      <StatusState tone="empty" title={title} description={description} />
      <Button
        type="button"
        onClick={() => signIn(undefined, { callbackUrl })}
        variant="primary"
        size="md"
      >
        {buttonLabel}
      </Button>
    </Panel>
  )
}
