import React, { useState } from 'react';
import Modal from '@/components/hooks/admin/product/category/Modal';

export default function CategoryTable({ categories, deleteCategory, editCategory }) {
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");
    const [isModalOpen, setModalOpen] = useState(false);

    const handleEditClick = (category) => {
        setEditingId(category.id);
        setEditName(category.name);
        setModalOpen(true);
    };

    const handleSaveClick = (id) => {
        editCategory(id, editName);
        setEditingId(null);
        setModalOpen(false);
    };

    return (
        <>
            <table className="content-table">
                <thead>
                    <tr>
                        <th>Category Name</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.map((category) => (
                        <tr key={category.id}>
                            <td className='name'>
                                {category.name}
                            </td>
                            <td>
                                <button
                                    type="button"
                                    onClick={() => handleEditClick(category)}
                                >
                                    Edit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => deleteCategory(category.id)}
                                    className='delete-button'
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
                <h2>Edit Category</h2>
                <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                />
                <div className="btn">
                    <button onClick={() => handleSaveClick(editingId)}>Save</button>
                    <button onClick={() => setModalOpen(false)}>Close</button>
                </div>
            </Modal>
        </>
    );
}