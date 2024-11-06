"use client"
import React, { useState } from 'react';

import { useCategoryManager } from '@/components/hooks/admin/product/category/useCategoryManager';

import CategoryInput from '@/components/hooks/admin/product/category/CategoryInput';

import CategoryTable from '@/components/hooks/admin/product/category/CategoryTable';

import CustomPagination from '@/components/hooks/admin/product/category/Pagination';

import "@/components/styling/Admin.scss";

export default function CategoryManager() {
    const {
        categories,
        newCategory,
        setNewCategory,
        addCategory,
        deleteCategory,
        editCategory
    } = useCategoryManager();

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const pageCount = Math.ceil(categories.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const paginatedCategories = categories.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <section className='category-manager'>
            <div className="category__container container">
                <CategoryInput
                    newCategory={newCategory}
                    setNewCategory={setNewCategory}
                    addCategory={addCategory}
                />
                <CategoryTable
                    categories={paginatedCategories}
                    deleteCategory={deleteCategory}
                    editCategory={editCategory}
                />
                <CustomPagination
                    activePage={currentPage}
                    itemsCountPerPage={itemsPerPage}
                    totalItemsCount={categories.length}
                    onChange={handlePageChange}
                    pageCount={pageCount}
                />
            </div>
        </section>
    );
}