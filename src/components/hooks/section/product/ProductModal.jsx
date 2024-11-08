import { X } from "lucide-react";

import Link from "next/link";

import Image from "next/image";

import { Swiper, SwiperSlide } from "swiper/react";

import { Navigation, FreeMode, Thumbs } from "swiper/modules";

import ImageWithOriginalSize from "@/components/hooks/section/product/ImageWithOriginalSize";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";
import "swiper/css/thumbs";

import { useState, useEffect } from "react";
import RatingForm from "@/components/ui/Rating/RatingForm";

import { getProductRatings } from "@/components/hooks/admin/product/NewsProduct/utils/productServices";

export default function ProductModal({
  selectedProduct,
  onClose,
  currentPrice,
  selectedType,
  setSelectedType,
  thumbsSwiper,
  setThumbsSwiper,
  filteredTags,
}) {
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);

  const fetchRatings = async () => {
    try {
      if (selectedProduct) {
        const productRatings = await getProductRatings(selectedProduct.id);
        setRatings(productRatings);

        // Hitung rata-rata rating
        if (productRatings.length > 0) {
          const average =
            productRatings.reduce((acc, curr) => acc + curr.rating, 0) /
            productRatings.length;
          setAverageRating(average);
        }
      }
    } catch (error) {
      console.error("Error fetching ratings:", error);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, [selectedProduct]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "";

    // Jika timestamp adalah objek Timestamp Firebase
    if (timestamp?.toDate) {
      return timestamp.toDate().toLocaleDateString();
    }

    // Jika timestamp adalah objek Date
    if (timestamp instanceof Date) {
      return timestamp.toLocaleDateString();
    }

    // Jika timestamp adalah number atau string
    if (timestamp) {
      return new Date(timestamp).toLocaleDateString();
    }

    return "";
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="image">
            {selectedProduct.additionalImageUrls?.length > 0 ? (
              <>
                <Swiper
                  style={{
                    "--swiper-navigation-color": "#fff",
                    "--swiper-pagination-color": "#fff",
                  }}
                  spaceBetween={10}
                  navigation={true}
                  thumbs={{
                    swiper:
                      thumbsSwiper && !thumbsSwiper.destroyed
                        ? thumbsSwiper
                        : null,
                  }}
                  modules={[FreeMode, Navigation, Thumbs]}
                  className="top"
                >
                  {selectedProduct.additionalImageUrls.map((url, index) => (
                    <SwiperSlide key={`existing-${index}`}>
                      <div className="swiper-slide-preview">
                        <ImageWithOriginalSize
                          src={url}
                          alt={`Existing Additional ${index + 1}`}
                          quality={100}
                          loading="lazy"
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                <Swiper
                  onSwiper={setThumbsSwiper}
                  spaceBetween={10}
                  slidesPerView={5}
                  watchSlidesProgress={true}
                  modules={[FreeMode, Navigation, Thumbs]}
                  className="bottom"
                >
                  {selectedProduct.additionalImageUrls.map((url, index) => (
                    <SwiperSlide
                      key={`thumb-${index}`}
                      className="swiper-slide-thumbnail"
                    >
                      <ImageWithOriginalSize
                        src={url}
                        alt={`Thumbnail ${index + 1}`}
                        quality={100}
                        loading="lazy"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </>
            ) : (
              <Image
                src={selectedProduct.imageUrl || "/placeholder-image.jpg"}
                alt="Default Image"
                width={500}
                height={500}
                quality={100}
              />
            )}
          </div>

          <div className="text">
            <div className="header__modal">
              <p>Stock: {selectedProduct.stock}</p>
              <p className="modal-price">Rp. {currentPrice}</p>
            </div>

            {selectedProduct.types && selectedProduct.types.length > 0 && (
              <div className="type-select">
                <label>Types: </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  {selectedProduct.types.map((type, index) => (
                    <option key={index} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <h1>{selectedProduct.title}</h1>

            <div className="footer__modal">
              <div className="live-priview">
                <label htmlFor="live-preview">Detail:</label>
                <Link
                  href={selectedProduct.previewUrl}
                  className="view-more-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Lihat Detail
                </Link>
              </div>

              <div className="tags-section">
                <label>Tags:</label>
                <div className="tags-container">
                  {filteredTags.map((tag, index) => (
                    <Link
                      key={index}
                      href={`/pages/products/${tag}`}
                      className="tag"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="rating-section">
              <h3 className="rating-title">Rating Produk</h3>

              <div className="average-rating">
                <span className="rating-value">{averageRating.toFixed(1)}</span>
                <div className="stars">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <span
                      key={value}
                      className={`star ${
                        value <= averageRating ? "active" : ""
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="total-ratings">
                  ({ratings.length || 0} ulasan)
                </span>
              </div>

              <div className="ratings-list">
                {ratings.map((rating) => (
                  <div key={rating.id} className="rating-item">
                    <div className="rating-header">
                      <div className="stars">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <span
                            key={value}
                            className={`star ${
                              value <= rating.rating ? "active" : ""
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="rating-date">
                        {formatDate(rating.createdAt)}
                      </span>
                    </div>
                    {rating.review && (
                      <p className="rating-review">{rating.review}</p>
                    )}
                  </div>
                ))}
              </div>

              <RatingForm
                productId={selectedProduct.id}
                onSuccess={fetchRatings}
              />
            </div>
          </div>
        </div>

        <div className="modal-details">
          <div
            className="content-description"
            dangerouslySetInnerHTML={{ __html: selectedProduct.content }}
          />
        </div>

        <div className="close-modal" onClick={onClose}>
          <X size={30} />
        </div>
      </div>
    </div>
  );
}
