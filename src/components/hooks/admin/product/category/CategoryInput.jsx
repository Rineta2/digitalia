import React from 'react';

export default function CategoryInput({ newCategory, setNewCategory, addCategory }) {
    return (
        <div className="content-input">
            <label>Category:</label>
            <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Add new category"
            />
            <button
                type="button"
                onClick={addCategory}
            >
                Add
            </button>
        </div>
    );
}
