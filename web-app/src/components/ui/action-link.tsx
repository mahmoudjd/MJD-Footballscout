import Link from "next/link"

interface ActionLinkProps {
  href: string
  children: string
  className?: string
}

export function ActionLink({ href, children, className = "" }: ActionLinkProps) {
  return (
    <Link
      href={href}
      className={`inline-flex w-full items-center justify-center rounded-xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500 sm:text-base ${className}`.trim()}
    >
      {children}
    </Link>
  )
}
