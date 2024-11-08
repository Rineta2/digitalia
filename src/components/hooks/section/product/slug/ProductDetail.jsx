"use client";
import { useState, useEffect } from "react";

import { db } from "@/utils/firebase";

import { collection, query, where, getDocs } from "firebase/firestore";

import ProductImageSwiper from "@/components/hooks/section/product/slug/ProductImageSwiper";

export default function ProductDetail({ slug }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [types, setTypes] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productsRef = collection(db, "products");
        const q = query(productsRef, where("slug", "==", slug));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const productData = {
            id: querySnapshot.docs[0].id,
            ...querySnapshot.docs[0].data(),
          };
          setProduct(productData);

          if (productData.types) {
            setTypes(productData.types);
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const handleTypeClick = (type) => {
    const prices = product.prices?.[type] || null;
    setSelectedPrice(prices);
  };

  if (loading) return <div>Loading...</div>;

  if (!product) return <div>Product not found</div>;

  return (
    <div className="content">
      <div className="side">
        <div className="image">
          {product.additionalImageUrls?.length > 0 && (
            <ProductImageSwiper images={product.additionalImageUrls} />
          )}
        </div>

        <div className="product__details">
          <h1>{product.title}</h1>

          <div className="stock">
            <label htmlFor="stock">Stock:</label>
            <span id="stock">{product.stock}</span>
          </div>

          <div className="price__list">
            <label>Price:</label>
            <span>{product.price}</span>
          </div>

          {selectedPrice && (
            <div className="price">
              <label htmlFor="price">Price:</label>
              <span id="price">{selectedPrice}</span>
            </div>
          )}

          {types.length > 0 && (
            <div className="types">
              <label>Types:</label>
              <div className="types-list">
                {types.map((type, index) => (
                  <button
                    key={index}
                    className="type-item"
                    onClick={() => handleTypeClick(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
