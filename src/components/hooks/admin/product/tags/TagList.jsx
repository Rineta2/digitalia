import React from 'react';

export default function TagList({ tags, searchQuery, currentPage, itemsPerPage, startEditing, deleteTag, setTags }) {
    return (
        <table>
            <thead>
                <tr>
                    <th>Tag Name</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {tags
                    .filter(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
                    .map(tag => (
                        <tr key={tag.id}>
                            <td>{tag.name}</td>
                            <td>
                                <button onClick={() => startEditing(tag.id, tag.name)}>Edit</button>
                                <button onClick={() => deleteTag(tag.id, setTags)}>Delete</button>
                            </td>
                        </tr>
                    ))}
            </tbody>
        </table>
    );
}