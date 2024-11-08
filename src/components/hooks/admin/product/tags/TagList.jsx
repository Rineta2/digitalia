import React from "react";

export default function TagList({
  tags,
  searchQuery,
  currentPage,
  itemsPerPage,
  startEditing,
  deleteTag,
  setTags,
}) {
  const filteredTags = tags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tag.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedTags = filteredTags.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <div className="tags-list">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedTags.map((tag) => (
            <tr key={tag.id}>
              <td>{tag.name}</td>
              <td>{tag.category}</td>
              <td>
                <button onClick={() => startEditing(tag)}>Edit</button>
                <button onClick={() => deleteTag(tag.id, setTags)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
