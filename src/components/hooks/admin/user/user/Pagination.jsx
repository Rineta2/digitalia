import React from "react";
import ReactPaginate from "react-paginate";

export default function Pagination({ pageCount, currentPage, onPageChange }) {
  return (
    <div className="pagination">
      <span>
        Page {currentPage + 1} of {pageCount}
      </span>

      <ReactPaginate
        previousLabel={"Previous"}
        nextLabel={"Next"}
        breakLabel={"..."}
        pageCount={pageCount}
        marginPagesDisplayed={2}
        pageRangeDisplayed={5}
        onPageChange={onPageChange}
        containerClassName={"pagination"}
        activeClassName={"active"}
        previousClassName={"pagination-btn"}
        nextClassName={"pagination-btn"}
        pageClassName={"pagination-btn"}
        breakClassName={"pagination-btn"}
        disabledClassName={"disabled"}
      />
    </div>
  );
}
