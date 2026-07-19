// components/pagination.tsx
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/cn"
import { Text } from "@/components/ui/text"

interface Props {
  currentPage: number
  totalPages: number
  renderElementsOfPage: (page: number) => void
}

const Pagination = ({ currentPage, totalPages, renderElementsOfPage }: Props) => {
  const visiblePages = (): (number | "…")[] => {
    const pages: (number | "…")[] = []
    const max = totalPages

    if (max <= 7) {
      for (let i = 1; i <= max; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push("…")
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(max - 1, currentPage + 1); i++)
        pages.push(i)
      if (currentPage < max - 2) pages.push("…")
      pages.push(max)
    }

    return pages
  }

  return (
    <nav className="mt-4 flex flex-wrap items-center justify-center gap-1.5 tabular-nums" aria-label="Pagination">
      <Button
        variant="outline"
        size="xs"
        className="rounded-xl"
        onClick={() => renderElementsOfPage(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Previous"
      >
        <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
        <Text as="span" className="hidden sm:inline">
          Prev
        </Text>
      </Button>

      {visiblePages().map((page, idx) =>
        page === "…" ? (
          <Text key={idx} as="span" className="px-2 text-emerald-950/45" aria-hidden="true">
            …
          </Text>
        ) : (
          <Button
            key={idx}
            onClick={() => renderElementsOfPage(page)}
            variant={page === currentPage ? "primary" : "outline"}
            size="xs"
            className={cn("min-w-10 rounded-xl sm:text-sm", page === currentPage && "shadow-sm")}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </Button>
        ),
      )}

      <Button
        variant="outline"
        size="xs"
        className="rounded-xl"
        onClick={() => renderElementsOfPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Next"
      >
        <Text as="span" className="hidden sm:inline">
          Next
        </Text>
        <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
      </Button>
    </nav>
  )
}

export default Pagination
