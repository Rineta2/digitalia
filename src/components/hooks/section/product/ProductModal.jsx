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
