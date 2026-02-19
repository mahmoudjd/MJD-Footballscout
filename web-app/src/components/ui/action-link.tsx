import Link from "next/link"
import { ReactNode } from "react"
import { buttonVariants } from "@/components/ui/button"

interface ActionLinkProps {
  href: string
  children: ReactNode
  className?: string
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger"
  size?: "sm" | "md" | "lg"
  fullWidth?: boolean
}

export function ActionLink({
  href,
  children,
  className,
  variant = "primary",
  size = "lg",
  fullWidth = true,
}: ActionLinkProps) {
  return (
    <Link href={href} className={buttonVariants({ variant, size, fullWidth, className })}>
      {children}
    </Link>
  )
}
