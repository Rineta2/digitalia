import ReactPaginate from "react-paginate";

export default function PaginationControls({
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
}) {
  return (
    <div className="pagination">
      <div className="page-info">
        Page {currentPage + 1} of {Math.ceil(totalItems / itemsPerPage)}
      </div>
      <ReactPaginate
        previousLabel={"previous"}
        nextLabel={"next"}
        breakLabel={"..."}
        pageCount={Math.ceil(totalItems / itemsPerPage)}
        marginPagesDisplayed={2}
        pageRangeDisplayed={5}
        onPageChange={onPageChange}
        containerClassName={"pagination"}
        activeClassName={"active"}
      />
    </div>
  );
}
