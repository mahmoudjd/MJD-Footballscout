// components/pagination.tsx
import {ChevronLeftIcon, ChevronRightIcon} from "@heroicons/react/20/solid";

interface Props {
    currentPage: number;
    totalPages: number;
    renderElementsOfPage: (page: number) => void;
}

const Pagination = ({currentPage, totalPages, renderElementsOfPage}: Props) => {
    const visiblePages = (): (number | "...")[] => {
        const pages: (number | "...")[] = [];
        const max = totalPages;

        if (max <= 7) {
            for (let i = 1; i <= max; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push("...");
            for (
                let i = Math.max(2, currentPage - 1);
                i <= Math.min(max - 1, currentPage + 1);
                i++
            )
                pages.push(i);
            if (currentPage < max - 2) pages.push("...");
            pages.push(max);
        }

        return pages;
    };

    return (
        <nav className="flex justify-center items-center space-x-1 mt-4">
            <button
                className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                onClick={() => renderElementsOfPage(currentPage - 1)}
                disabled={currentPage <= 1}
                aria-label="Previous"
            >
                <ChevronLeftIcon className="w-4 h-4"/>
            </button>

            {visiblePages().map((page, idx) =>
                page === "..." ? (
                    <span key={idx} className="px-2 text-gray-500">...</span>
                ) : (
                    <button
                        key={idx}
                        onClick={() => renderElementsOfPage(page)}
                        className={`px-3 py-1 rounded-md text-sm font-medium ${
                            page === currentPage
                                ? "bg-cyan-700 text-white"
                                : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                        }`}
                    >
                        {page}
                    </button>
                )
            )}

            <button
                className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                onClick={() => renderElementsOfPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                aria-label="Next"
            >
                <ChevronRightIcon className="w-4 h-4"/>
            </button>
        </nav>
    );
};

export default Pagination;
