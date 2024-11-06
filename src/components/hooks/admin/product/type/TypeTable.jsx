import React from 'react';

export default function TypeTable({ types, selectedCategory, currentPage, itemsPerPage, deleteType }) {
    return (
        <table>
            <thead>
                <tr>
                    <th>Type Name</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {types
                    .filter(type => !selectedCategory || type.category === selectedCategory)
                    .slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
                    .map(type => (
                        <tr key={type.id}>
                            <td>{type.name}</td>
                            <td>
                                <button onClick={() => deleteType(type.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
            </tbody>
        </table>
    );
}