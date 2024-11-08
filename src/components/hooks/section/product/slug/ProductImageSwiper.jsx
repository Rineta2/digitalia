import { useState, Fragment } from "react";

import ImageWithOriginalSize from "@/components/hooks/section/product/ImageWithOriginalSize";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode, Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";
import "swiper/css/thumbs";

export default function ProductImageSwiper({ images }) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  return (
    <Fragment>
      <Swiper
        style={{
          "--swiper-navigation-color": "#fff",
          "--swiper-pagination-color": "#fff",
        }}
        spaceBetween={10}
        navigation={true}
        thumbs={{
          swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
        }}
        modules={[FreeMode, Navigation, Thumbs]}
        className="top"
      >
        {images.map((url, index) => (
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
        {images.map((url, index) => (
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
    </Fragment>
  );
}
