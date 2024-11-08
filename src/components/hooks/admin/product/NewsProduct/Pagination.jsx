import ReactPaginate from "react-paginate";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  return (
    <div className="pagination">
      <span>
        Page {currentPage} of {totalPages}
      </span>

      <ReactPaginate
        previousLabel={"Previous"}
        nextLabel={"Next"}
        breakLabel={"..."}
        pageCount={totalPages}
        marginPagesDisplayed={2}
        pageRangeDisplayed={5}
        onPageChange={onPageChange}
        containerClassName={"pagination"}
        activeClassName={"active"}
      />
    </div>
  );
}
