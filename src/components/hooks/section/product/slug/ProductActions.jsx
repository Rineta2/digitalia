export default function ProductActions({
  types,
  selectedPrice,
  product,
  onTypeChange,
  onAddToCart,
  onBuyNow,
  isAddingToCart,
}) {
  return (
    <>
      {types.length > 0 && (
        <div className="types">
          <label>Select Type:</label>
          <div className="type-buttons">
            <button
              onClick={() => onTypeChange("")}
              className={`type-button ${
                !selectedPrice || selectedPrice === product.price
                  ? "active"
                  : ""
              }`}
            >
              Default
            </button>

            {types.map((type, index) => (
              <button
                key={index}
                onClick={() => onTypeChange(type)}
                className={`type-button ${
                  product.prices?.[type] === selectedPrice ? "active" : ""
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="actions">
        <button
          className="button"
          onClick={onAddToCart}
          disabled={isAddingToCart || !product.stock || product.stock <= 0}
        >
          {isAddingToCart
            ? "Adding..."
            : product.stock <= 0
            ? "Out of Stock"
            : "Add to Cart"}
        </button>

        <button
          onClick={onBuyNow}
          disabled={!product.stock || product.stock <= 0}
        >
          {product.stock <= 0 ? "Out of Stock" : "Beli Sekarang"}
        </button>
      </div>
    </>
  );
}
