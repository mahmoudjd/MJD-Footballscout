"use client"

import type { ComponentPropsWithoutRef, ReactNode } from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { OutlineIcons } from "@/components/icons/outline-icons"
import { cn } from "@/lib/cn"
import { Button } from "@/components/ui/button"

type DialogProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Root>
type DialogContentProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  size?: "sm" | "md" | "lg"
}
type DialogTriggerProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>
type DialogTitleProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
type DialogDescriptionProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Description>

export function Dialog(props: DialogProps) {
  return <DialogPrimitive.Root {...props} />
}

export function DialogTrigger(props: DialogTriggerProps) {
  return <DialogPrimitive.Trigger {...props} />
}

const contentSizeClasses: Record<NonNullable<DialogContentProps["size"]>, string> = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-4xl",
}

export function DialogContent({ className, children, size = "md", ...props }: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-[80] bg-slate-950/45 backdrop-blur-[2px]" />
      <DialogPrimitive.Content
        className={cn(
          "fixed top-1/2 left-1/2 z-[90] max-h-[85vh] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-stone-200 bg-white p-6 shadow-[0_36px_70px_-34px_rgba(15,23,42,0.5)]",
          contentSizeClasses[size],
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute top-3 right-3 text-stone-500 hover:bg-stone-100 hover:text-stone-800"
            aria-label="Close dialog"
          >
            <OutlineIcons.XMarkIcon className="h-5 w-5" />
          </Button>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export function DialogHeader({ children }: { children: ReactNode }) {
  return <div className="space-y-1.5">{children}</div>
}

export function DialogTitle({ className, ...props }: DialogTitleProps) {
  return (
    <DialogPrimitive.Title className={cn("text-xl font-semibold tracking-tight text-stone-900", className)} {...props} />
  )
}

export function DialogDescription({ className, ...props }: DialogDescriptionProps) {
  return (
    <DialogPrimitive.Description
      className={cn("text-sm leading-relaxed text-stone-600", className)}
      {...props}
    />
  )
}

export function DialogFooter({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return <div className={cn("mt-5 flex flex-wrap items-center justify-end gap-2", className)}>{children}</div>
}
