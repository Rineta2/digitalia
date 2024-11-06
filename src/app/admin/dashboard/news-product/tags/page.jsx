"use client";

import React, { useState, useEffect } from 'react';
import ReactPaginate from 'react-paginate';
import { fetchTags, addTag, updateTag, deleteTag } from '@/components/hooks/admin/product/tags/TagService';
import TagList from '@/components/hooks/admin/product/tags/TagList';
import TagModal from '@/components/hooks/admin/product/tags/TagModal';
import "@/components/styling/Admin.scss";

export default function Tags() {
    const [tags, setTags] = useState([]);
    const [newTag, setNewTag] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [editingTagId, setEditingTagId] = useState(null);
    const [editingTagName, setEditingTagName] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 5;

    useEffect(() => {
        fetchTags(setTags);
    }, []);

    const handleAddTag = async () => {
        if (newTag.trim()) {
            await addTag(newTag, setNewTag, setTags);
        }
    };

    const handleSaveEdit = async () => {
        if (editingTagName.trim()) {
            await updateTag(editingTagId, editingTagName, setTags);
            setEditingTagId(null);
            setEditingTagName('');
        }
    };

    const handlePageClick = (event) => {
        setCurrentPage(event.selected);
    };

    return (
        <section className='tags-manager'>
            <div className="tags__container container">
                <h1>Tags</h1>
                <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add new tag"
                />

                <button onClick={handleAddTag} className='add-tag'>Add Tag</button>

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
                    startEditing={setEditingTagId}
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
                    />
                )}
            </div>
        </section>
    );
}