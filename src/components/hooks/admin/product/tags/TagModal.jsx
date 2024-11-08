import React from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function TagModal({
  editingTagName,
  setEditingTagName,
  saveEdit,
  cancelEdit,
  categories,
  selectedCategory,
  setSelectedCategory,
}) {
  return (
    <div className={`modal active`}>
      <div className="model">
        <h3>Edit Tag</h3>

        <div className="form-group">
          <label>Category:</label>
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
        </div>

        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            value={editingTagName}
            onChange={(e) => setEditingTagName(e.target.value)}
            placeholder="Edit tag name"
          />
        </div>

        <div className="btn">
          <button
            onClick={saveEdit}
            disabled={!editingTagName.trim() || !selectedCategory}
          >
            Save
          </button>
          <button onClick={cancelEdit}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
