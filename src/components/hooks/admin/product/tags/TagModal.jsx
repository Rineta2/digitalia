import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function TagModal({ editingTagName, setEditingTagName, saveEdit, cancelEdit }) {

    return (
        <div className={`modal active`}>
            <div className="model">
                <h2>Edit Tag</h2>
                <input
                    type="text"
                    value={editingTagName}
                    onChange={(e) => setEditingTagName(e.target.value)}
                />
                <div className="btn">
                    <button onClick={saveEdit}>Save</button>
                    <button onClick={cancelEdit}>Cancel</button>
                </div>
            </div>
        </div>
    );
}