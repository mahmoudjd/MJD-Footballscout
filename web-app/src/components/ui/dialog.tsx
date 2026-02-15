"use client"

import type { ComponentPropsWithoutRef, ReactNode } from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { OutlineIcons } from "@/components/outline-icons"

type DialogProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Root>
type DialogContentProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
type DialogTriggerProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>
type DialogTitleProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
type DialogDescriptionProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Description>

export function Dialog(props: DialogProps) {
  return <DialogPrimitive.Root {...props} />
}

export function DialogTrigger(props: DialogTriggerProps) {
  return <DialogPrimitive.Trigger {...props} />
}

export function DialogContent({ className = "", children, ...props }: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-[1px]" />
      <DialogPrimitive.Content
        className={`fixed top-1/2 left-1/2 z-50 max-h-[85vh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl ${className}`.trim()}
        {...props}
      >
        {children}
        <DialogPrimitive.Close asChild>
          <button
            type="button"
            className="absolute top-3 right-3 rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close dialog"
          >
            <OutlineIcons.XMarkIcon className="h-5 w-5" />
          </button>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export function DialogHeader({ children }: { children: ReactNode }) {
  return <div className="space-y-1">{children}</div>
}

export function DialogTitle({ className = "", ...props }: DialogTitleProps) {
  return (
    <DialogPrimitive.Title
      className={`text-xl font-bold text-slate-900 ${className}`.trim()}
      {...props}
    />
  )
}

export function DialogDescription({ className = "", ...props }: DialogDescriptionProps) {
  return (
    <DialogPrimitive.Description
      className={`text-sm leading-relaxed text-slate-600 ${className}`.trim()}
      {...props}
    />
  )
}

export function DialogFooter({
  className = "",
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <div className={`mt-5 flex flex-wrap items-center justify-end gap-2 ${className}`.trim()}>
      {children}
    </div>
  )
}
