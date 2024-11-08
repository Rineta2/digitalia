"use client";

import React, { useState, useEffect } from "react";

import { collection, getDocs } from "firebase/firestore";

import { db } from "@/utils/firebase";

import { formatDistanceToNow } from "date-fns";

import { id } from "date-fns/locale";

import Image from "next/image";

import Link from "next/link";

import { Eye, Link as LucideLink, X } from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode, Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";
import "swiper/css/thumbs";

function formatTimeAgo(date) {
  const now = new Date();
  const diffInDays = (now - date) / (1000 * 60 * 60 * 24);
  if (diffInDays < 1)
    return formatDistanceToNow(date, { addSuffix: true, locale: id }).replace(
      "sekitar ",
      ""
    );
  if (diffInDays < 7) return `${Math.floor(diffInDays)} hari yang lalu`;
  if (diffInDays < 28) return `${Math.floor(diffInDays / 7)} minggu yang lalu`;

  return date
    .toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
    .replace(/ /g, " - ");
}

function ImageWithOriginalSize({ src, alt, quality }) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
  }, [src]);

  return (
    <Image
      src={src}
      alt={alt}
      width={dimensions.width}
      height={dimensions.height}
      quality={quality}
    />
  );
}

export default function NewsProduct() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [tags, setTags] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [currentPrice, setCurrentPrice] = useState(null);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [filteredTags, setFilteredTags] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productsData);

        const allTags = [
          ...new Set(productsData.flatMap((product) => product.tags || [])),
        ];
        setTags(allTags);
        setFilteredTags(allTags);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedCategory !== "Website") setSelectedTag("");
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedProduct) {
      if (selectedProduct.types && selectedProduct.types.length > 0) {
        setSelectedType(selectedProduct.types[0]);
      } else {
        setSelectedType("");
      }
      setCurrentPrice(formatNumber(selectedProduct.price));
    }
  }, [selectedProduct]);

  useEffect(() => {
    if (selectedProduct && selectedType && selectedProduct.prices) {
      const typePrice = selectedProduct.prices[selectedType];
      setCurrentPrice(
        typePrice
          ? formatNumber(typePrice)
          : formatNumber(selectedProduct.price)
      );
    }
  }, [selectedType, selectedProduct]);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  const categories = [...new Set(products.map((product) => product.category))];

  const formatNumber = (num) => {
    if (!num) return "";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Reset thumbsSwiper when modal is closed
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setThumbsSwiper(null);
    setSelectedProduct(null);
    setSelectedType("");
  };

  // Add this new function to get random products
  const getRandomProducts = (allProducts, count) => {
    const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const getLatestProducts = (products) => {
    return products
      .filter(
        (product) =>
          (!selectedCategory || product.category === selectedCategory) &&
          (!selectedTag || product.tags.includes(selectedTag))
      )
      .sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.toDate() - a.createdAt.toDate();
      })
      .slice(0, 4);
  };

  const getOlderProducts = (products) => {
    return products
      .sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.toDate() - a.createdAt.toDate();
      })
      .slice(4);
  };

  const ProductBox = ({ product }) => (
    <div key={product.id} className="box">
      <div className="img">
        <Image
          width={500}
          height={500}
          quality={100}
          src={product.imageUrl || "/placeholder-image.jpg"}
          alt={product.title}
        />
      </div>

      <div className="date">
        {product.createdAt
          ? formatTimeAgo(new Date(product.createdAt.toDate()))
          : "Tanggal tidak tersedia"}
      </div>

      <h1>{product.title}</h1>

      <span className="price">Rp. {formatNumber(product.price)}</span>

      <div className="overlay">
        <Link href={`/product/${product.id}`}>
          <LucideLink size={30} />
        </Link>

        <button
          onClick={() => {
            setSelectedProduct(product);
            setIsModalOpen(true);
          }}
        >
          <Eye size={30} />
        </button>
      </div>
    </div>
  );

  return (
    <section className="news__product">
      <div className="product__container container">
        <div className="heading">
          <h1>Product Terbaru</h1>
        </div>

        <div className="toolbar">
          <div className="category">
            <button
              onClick={() => setSelectedCategory("")}
              className={selectedCategory === "" ? "active" : ""}
            >
              Semua Kategori
            </button>

            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? "active" : ""}
              >
                {category}
              </button>
            ))}
          </div>

          {selectedCategory === "Website" && (
            <div className="tag-select">
              <label htmlFor="tag">Pilih Tag:</label>
              <select
                id="tag"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
              >
                <option value="">Semua Tag</option>
                {tags.map((tag, index) => (
                  <option key={index} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="content">
          {getLatestProducts(products).map((product) => (
            <ProductBox key={product.id} product={product} />
          ))}
        </div>

        {getOlderProducts(products).length > 0 && (
          <div className="older-products">
            <div className="heading">
              <h2>Produk Lainnya</h2>
            </div>
            <div className="content">
              {getOlderProducts(products).map((product) => (
                <ProductBox key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>

      {isModalOpen && selectedProduct && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="image">
                {selectedProduct.additionalImageUrls?.length > 0 && (
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
                )}
                {(!selectedProduct.additionalImageUrls ||
                  selectedProduct.additionalImageUrls.length === 0) && (
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
                      onChange={(e) => {
                        setSelectedType(e.target.value);
                      }}
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
                          href={`/product/${tag}`}
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

            <div className="close-modal" onClick={handleCloseModal}>
              <X size={30} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
