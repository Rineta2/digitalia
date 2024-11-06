import React from 'react';

export default function Modal({ isOpen, onClose, children }) {
    if (!isOpen) return null;

    return (
        <div className="modal" onClick={onClose}>
            <div className="model" onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
}