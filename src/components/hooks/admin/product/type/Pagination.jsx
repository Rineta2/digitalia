import React from 'react';
import ReactPaginate from 'react-paginate';

export default function Pagination({ pageCount, handlePageClick, currentPage }) {
    return (
        <div className="pagination">
            <div className='page-info'>Page {currentPage + 1} of {pageCount}</div>

            <ReactPaginate
                previousLabel={"previous"}
                nextLabel={"next"}
                breakLabel={"..."}
                pageCount={pageCount}
                marginPagesDisplayed={2}
                pageRangeDisplayed={5}
                onPageChange={handlePageClick}
                containerClassName={"pagination"}
                activeClassName={"active"}
            />
        </div>
    );
}