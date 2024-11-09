export default function ProductRating({
  averageRating,
  ratingsCount,
  viewCount,
}) {
  return (
    <div className="rating">
      <div className="stars">
        <span className="score">{averageRating.toFixed(1)}</span>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= averageRating ? "filled" : ""}`}
            style={{
              color: star <= averageRating ? "#FFD700" : "#ddd",
              fontSize: "24px",
            }}
          >
            ★
          </span>
        ))}
      </div>

      <div className="review-count">
        <span>{ratingsCount}</span>
        <span>Ulasan</span>
      </div>

      <div className="view-count">
        <span>{viewCount}</span>
        <span>View</span>
      </div>
    </div>
  );
}
