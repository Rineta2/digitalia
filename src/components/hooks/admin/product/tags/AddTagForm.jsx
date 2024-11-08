export default function AddTagForm({
  newTag,
  setNewTag,
  selectedCategory,
  setSelectedCategory,
  categories,
  onAddTag,
}) {
  return (
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
        onClick={onAddTag}
        className="add-tag"
        disabled={!newTag.trim() || !selectedCategory}
      >
        Add Tag
      </button>
    </div>
  );
}
