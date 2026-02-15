// components/pagination.tsx
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid"

interface Props {
  currentPage: number
  totalPages: number
  renderElementsOfPage: (page: number) => void
}

const Pagination = ({ currentPage, totalPages, renderElementsOfPage }: Props) => {
  const visiblePages = (): (number | "...")[] => {
    const pages: (number | "...")[] = []
    const max = totalPages

    if (max <= 7) {
      for (let i = 1; i <= max; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push("...")
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(max - 1, currentPage + 1); i++)
        pages.push(i)
      if (currentPage < max - 2) pages.push("...")
      pages.push(max)
    }

    return pages
  }

  return (
    <nav className="mt-4 flex flex-wrap items-center justify-center gap-1">
      <button
        className="cursor-pointer rounded-md bg-gray-200 p-2 hover:bg-gray-300 disabled:opacity-50"
        onClick={() => renderElementsOfPage(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Previous"
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </button>

      {visiblePages().map((page, idx) =>
        page === "..." ? (
          <span key={idx} className="px-2 text-gray-500">
            ...
          </span>
        ) : (
          <button
            key={idx}
            onClick={() => renderElementsOfPage(page)}
            className={`min-w-8 cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium sm:text-sm ${
              page === currentPage
                ? "bg-cyan-700 text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            {page}
          </button>
        ),
      )}

      <button
        className="cursor-pointer rounded-md bg-gray-200 p-2 hover:bg-gray-300 disabled:opacity-50"
        onClick={() => renderElementsOfPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Next"
      >
        <ChevronRightIcon className="h-4 w-4" />
      </button>
    </nav>
  )
}

export default Pagination
