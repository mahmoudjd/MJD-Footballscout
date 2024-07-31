import "./Pagination.css";

interface Props {
  currentPage: number;
  totalPages: number;
  renderElementsOfPage: (page: number) => void;
}
const Pagination = ({
  currentPage,
  renderElementsOfPage,
  totalPages,
}: Props) => {
  return (
    <nav className="nav-pagination">
      <button
        onClick={() => renderElementsOfPage(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Prev
      </button>
      <span>
        {currentPage}/{totalPages}
      </span>
      <button
        onClick={() => renderElementsOfPage(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </nav>
  );
};

export default Pagination;
