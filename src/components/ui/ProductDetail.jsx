import React, { useState, useEffect } from "react";
import RatingForm from "../Rating/RatingForm";
import { getProductRatings } from "../../hooks/admin/product/NewsProduct/utils/productServices";

const ProductDetail = () => {
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [productId, setProductId] = useState(null);

  const fetchRatings = async () => {
    try {
      const productRatings = await getProductRatings(productId);
      setRatings(productRatings);

      // Hitung rata-rata rating
      if (productRatings.length > 0) {
        const average =
          productRatings.reduce((acc, curr) => acc + curr.rating, 0) /
          productRatings.length;
        setAverageRating(average);
      }
    } catch (error) {
      console.error("Error fetching ratings:", error);
    }
  };

  // Panggil fetchRatings saat komponen dimuat
  useEffect(() => {
    fetchRatings();
  }, [productId]);

  return (
    <div>
      {/* Tampilkan rating */}
      <div>
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= averageRating ? "filled" : ""}>
            ★
          </span>
        ))}
        ({ratings.length} ulasan)
      </div>

      {/* Form Rating */}
      <RatingForm
        productId={productId}
        onSuccess={fetchRatings} // Passing fungsi untuk memperbarui rating
      />
    </div>
  );
};

export default ProductDetail;
