"use client"

import * as AlertDialog from "@radix-ui/react-alert-dialog"
import { Spinner } from "@/components/common/spinner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/cn"
import { Text } from "@/components/ui/text"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  isConfirming?: boolean
  confirmTone?: "danger" | "primary"
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  isConfirming = false,
  confirmTone = "danger",
}: ConfirmDialogProps) {
  const confirmVariant = confirmTone === "danger" ? "danger" : "primary"

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-emerald-950/55 backdrop-blur-sm transition-opacity motion-reduce:transition-none" />
        <AlertDialog.Content
          className={cn(
            "fixed top-1/2 left-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto overscroll-contain rounded-3xl border border-emerald-950/10 bg-white p-6 shadow-[0_34px_80px_-30px_rgba(6,78,59,0.52)] sm:p-7",
          )}
        >
          <AlertDialog.Title asChild>
            <Text as="h3" variant="title" weight="bold" className="text-emerald-950">
              {title}
            </Text>
          </AlertDialog.Title>
          {description ? (
            <AlertDialog.Description asChild>
              <Text as="p" variant="body" tone="muted" className="mt-2">
                {description}
              </Text>
            </AlertDialog.Description>
          ) : null}

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <AlertDialog.Cancel asChild>
              <Button
                type="button"
                disabled={isConfirming}
                variant="outline"
                size="md"
                fullWidth
                className="sm:w-auto"
              >
                {cancelLabel}
              </Button>
            </AlertDialog.Cancel>

            <AlertDialog.Action asChild>
              <Button
                type="button"
                onClick={onConfirm}
                disabled={isConfirming}
                variant={confirmVariant}
                size="md"
                fullWidth
                className="sm:w-auto"
              >
                {isConfirming ? (
                  <>
                    <Spinner size="sm" tone="light" />
                    Processing…
                  </>
                ) : (
                  confirmLabel
                )}
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
