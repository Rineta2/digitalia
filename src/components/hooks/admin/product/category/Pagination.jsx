import React from 'react';
import ReactPaginate from 'react-paginate';

export default function Pagination({ pageCount, handlePageClick, currentPage }) {
    return (
        <div className="pagination">
            <div className='page-info'>Page {currentPage} of {pageCount}</div>

            <ReactPaginate
                previousLabel={"previous"}
                nextLabel={"next"}
                breakLabel={"..."}
                pageCount={pageCount}
                marginPagesDisplayed={2}
                pageRangeDisplayed={5}
                onPageChange={(data) => handlePageClick(data.selected + 1)}
                containerClassName={"pagination"}
                activeClassName={"active"}
            />
        </div>
    );
}