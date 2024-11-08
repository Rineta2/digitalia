"use client";
import { useState, useEffect } from "react";

import ProductBox from "@/components/hooks/section/product/ProductBox";

import ProductModal from "@/components/hooks/section/product/ProductModal";

import { useFetchProducts } from "@/components/hooks/section/product/utils/useFetchProducts";

import { useProductSelection } from "@/components/hooks/section/product/utils/useProductHook";

import { useModalEffect } from "@/components/hooks/section/product/utils/useProductHook";

export default function NewsProduct() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  const { products, tags, filteredTags } = useFetchProducts();
  const { selectedType, setSelectedType, currentPrice } =
    useProductSelection(selectedProduct);
  useModalEffect(isModalOpen);

  useEffect(() => {
    if (selectedCategory !== "Website") setSelectedTag("");
  }, [selectedCategory]);

  const categories = [...new Set(products.map((product) => product.category))];

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setThumbsSwiper(null);
    setSelectedProduct(null);
    setSelectedType("");
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
            <ProductBox
              key={product.id}
              product={product}
              onProductSelect={(product) => {
                setSelectedProduct(product);
                setIsModalOpen(true);
              }}
            />
          ))}
        </div>

        {getOlderProducts(products).length > 0 && (
          <div className="older-products">
            <div className="heading">
              <h1>Produk Lainnya</h1>
            </div>

            <div className="content">
              {getOlderProducts(products).map((product) => (
                <ProductBox
                  key={product.id}
                  product={product}
                  onProductSelect={(product) => {
                    setSelectedProduct(product);
                    setIsModalOpen(true);
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {isModalOpen && selectedProduct && (
        <ProductModal
          selectedProduct={selectedProduct}
          onClose={handleCloseModal}
          currentPrice={currentPrice}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          thumbsSwiper={thumbsSwiper}
          setThumbsSwiper={setThumbsSwiper}
          filteredTags={filteredTags}
        />
      )}
    </section>
  );
}
