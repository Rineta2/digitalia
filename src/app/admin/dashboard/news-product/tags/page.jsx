"use client";

import React, { useState, useEffect } from "react";
import ReactPaginate from "react-paginate";
import {
  fetchTags,
  addTag,
  updateTag,
  deleteTag,
} from "@/components/hooks/admin/product/tags/TagService";
import TagList from "@/components/hooks/admin/product/tags/TagList";
import TagModal from "@/components/hooks/admin/product/tags/TagModal";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/utils/firebase";
import "@/components/styling/Admin.scss";

export default function Tags() {
  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTagId, setEditingTagId] = useState(null);
  const [editingTagName, setEditingTagName] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;
  const [editingTag, setEditingTag] = useState(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryCollection = collection(db, "categories");
        const categorySnapshot = await getDocs(categoryCollection);
        const categoryList = categorySnapshot.docs.map(
          (doc) => doc.data().name
        );
        setCategories(categoryList);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTags(setTags);
  }, []);

  const handleAddTag = async () => {
    if (newTag.trim() && selectedCategory) {
      await addTag(newTag, selectedCategory, setNewTag, setTags);
      setSelectedCategory(""); // Reset selected category after adding
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
    setEditingTag(tag);
  };

  return (
    <section className="tags-manager">
      <div className="tags__container container">
        <h1>Tags</h1>
        <div className="add-tag-form">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add new tag"
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            required
          >
            <option value="">Select Category</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>

          <button
            onClick={handleAddTag}
            className="add-tag"
            disabled={!newTag.trim() || !selectedCategory}
          >
            Add Tag
          </button>
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tags"
        />

        <TagList
          tags={tags}
          searchQuery={searchQuery}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          startEditing={startEditing}
          deleteTag={deleteTag}
          setTags={setTags}
        />

        <div className="pagination">
          <div className="page-info">
            Page {currentPage + 1} of {Math.ceil(tags.length / itemsPerPage)}
          </div>
          <ReactPaginate
            previousLabel={"previous"}
            nextLabel={"next"}
            breakLabel={"..."}
            pageCount={Math.ceil(tags.length / itemsPerPage)}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={handlePageClick}
            containerClassName={"pagination"}
            activeClassName={"active"}
          />
        </div>

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
