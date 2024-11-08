"use client";
import React, { useState } from "react";

import { useTypes } from "@/components/hooks/admin/product/type/useTypes";

import { useCategories } from "@/components/hooks/admin/product/type/useCategories";

import "@/components/styling/Admin.scss";

import dynamic from "next/dynamic";

const Pagination = dynamic(
  () => import("@/components/hooks/admin/product/type/Pagination"),
  { ssr: false }
);

const TypeTable = dynamic(
  () => import("@/components/hooks/admin/product/type/TypeTable"),
  { ssr: false }
);

export default function TypeManager() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newType, setNewType] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

  const { types, addType, deleteType } = useTypes(
    selectedCategory,
    newType,
    setNewType
  );

  const { categories } = useCategories();

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  return (
    <section className="type-manager">
      <div className="type__container container">
        <h1>Manage Types</h1>

        <select
          onChange={(e) => setSelectedCategory(e.target.value)}
          value={selectedCategory}
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Type Name"
          value={newType}
          onChange={(e) => setNewType(e.target.value)}
        />

        <button onClick={addType} className="add-type">
          Add Type
        </button>

        <TypeTable
          types={types}
          selectedCategory={selectedCategory}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          deleteType={deleteType}
        />

        <Pagination
          pageCount={Math.ceil(types.length / itemsPerPage)}
          handlePageClick={handlePageClick}
          currentPage={currentPage}
        />
      </div>
    </section>
  );
}
