export default function ProductReviews({ ratings }) {
  return (
    <div className="ulasan">
      <h2>Ulasan</h2>
      <div className="ulasan-list">
        {ratings.length > 0 ? (
          ratings.map((rating, index) => (
            <div key={`rating-${index}`} className="ulasan-item">
              <div className="user-info">
                <div className="user-profile">
                  <img
                    src={
                      rating.userInfo?.photoURL || "/images/default-avatar.png"
                    }
                    alt={`${rating.userInfo?.firstName || "User"}'s profile`}
                    className="profile-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/images/default-avatar.png";
                    }}
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "1px solid #ddd",
                    }}
                  />
                  <span className="user-name">
                    {rating.userInfo?.firstName || ""}{" "}
                    {rating.userInfo?.lastName || ""}
                  </span>
                </div>

                <div className="rating-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star ${
                        star <= rating.rating ? "filled" : ""
                      }`}
                      style={{
                        color: star <= rating.rating ? "#FFD700" : "#ddd",
                      }}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <p className="review-text">{rating.review}</p>
              <span className="rating-date">
                {rating.createdAt?.toDate instanceof Function
                  ? rating.createdAt.toDate().toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Tanggal tidak tersedia"}
              </span>
            </div>
          ))
        ) : (
          <div className="no-reviews">
            <p>Belum ada ulasan untuk produk ini</p>
            <p>Jadilah yang pertama memberikan ulasan!</p>
          </div>
        )}
      </div>
    </div>
  );
}
