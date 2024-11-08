"use client";

import React, { useState } from "react";

import {
  addTag,
  updateTag,
  deleteTag,
} from "@/components/hooks/admin/product/tags/utils/TagService";

import "@/components/styling/Admin.scss";

import dynamic from "next/dynamic";

import AddTagForm from "@/components/hooks/admin/product/tags/AddTagForm";

import SearchBar from "@/components/hooks/admin/product/tags/SearchBar";

import PaginationControls from "@/components/hooks/admin/product/tags/PaginationControls";

import { useFetchCategories } from "@/components/hooks/admin/product/tags/utils/useFetchCategories";

import { useFetchTags } from "@/components/hooks/admin/product/tags/utils/useFetchTags";

const TagList = dynamic(
  () => import("@/components/hooks/admin/product/tags/TagList"),
  { ssr: false }
);
const TagModal = dynamic(
  () => import("@/components/hooks/admin/product/tags/TagModal"),
  { ssr: false }
);

export default function Tags() {
  const [tags, setTags] = useFetchTags();
  const categories = useFetchCategories();
  const [newTag, setNewTag] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTagId, setEditingTagId] = useState(null);
  const [editingTagName, setEditingTagName] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

  const handleAddTag = async () => {
    if (newTag.trim() && selectedCategory) {
      await addTag(newTag, selectedCategory, setNewTag, setTags);
      setSelectedCategory("");
    }
  };

  const handleSaveEdit = async () => {
    if (editingTagName.trim()) {
      await updateTag(editingTagId, editingTagName, selectedCategory, setTags);
      setEditingTagId(null);
      setEditingTagName("");
      setSelectedCategory("");
    }
  };

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  const startEditing = (tag) => {
    setEditingTagId(tag.id);
    setEditingTagName(tag.name);
    setSelectedCategory(tag.category);
  };

  return (
    <section className="tags-manager">
      <div className="tags__container container">
        <h1>Tags</h1>

        <AddTagForm
          newTag={newTag}
          setNewTag={setNewTag}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
          onAddTag={handleAddTag}
        />

        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        <TagList
          tags={tags}
          searchQuery={searchQuery}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          startEditing={startEditing}
          deleteTag={deleteTag}
          setTags={setTags}
        />

        <PaginationControls
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={tags.length}
          onPageChange={handlePageClick}
        />

        {editingTagId && (
          <TagModal
            editingTagName={editingTagName}
            setEditingTagName={setEditingTagName}
            saveEdit={handleSaveEdit}
            cancelEdit={() => setEditingTagId(null)}
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        )}
      </div>
    </section>
  );
}
