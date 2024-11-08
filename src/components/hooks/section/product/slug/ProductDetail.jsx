"use client";
import { useState, useEffect } from "react";
import { db } from "@/utils/firebase";
import { useAuth } from "@/utils/auth/context/AuthContext";

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

import { Timer, RefreshCcw, Users } from "lucide-react";

import ProductImageSwiper from "@/components/hooks/section/product/slug/ProductImageSwiper";

import { getProductRatings } from "@/components/hooks/admin/product/NewsProduct/utils/productServices";

export default function ProductDetail({ slug }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [types, setTypes] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [userIp, setUserIp] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const getUserIp = async () => {
      try {
        const response = await fetch(process.env.NEXT_PUBLIC_API_VIEW);
        const data = await response.json();
        setUserIp(data.ip);
      } catch (error) {
        console.error("Error fetching IP address:", error);
      }
    };
    getUserIp();
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!userIp) return;

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
          setSelectedPrice(productData.price);
          setTypes(Object.keys(productData.prices || {}));

          const productRatings = await getProductRatings(productData.id);
          setRatings(productRatings);
          if (productRatings.length > 0) {
            const average =
              productRatings.reduce((acc, curr) => acc + curr.rating, 0) /
              productRatings.length;
            setAverageRating(average);
          }
        }
      } catch (error) {
        console.error("Error in fetchProduct:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug, userIp, user]);

  useEffect(() => {
    const updateViewCount = async () => {
      if (!product || !userIp) return;

      const viewId = user
        ? `${product.id}_${user.uid}`
        : `${product.id}_${userIp}`;

      try {
        const viewsRef = doc(db, "product_views", viewId);
        const viewDoc = await getDoc(viewsRef);

        if (!viewDoc.exists()) {
          await setDoc(viewsRef, {
            productId: product.id,
            ip: userIp,
            timestamp: serverTimestamp(),
            userId: user?.uid || null,
          });
          console.log("View recorded successfully");
        }

        const viewsSnapshot = await getDocs(
          query(
            collection(db, "product_views"),
            where("productId", "==", product.id)
          )
        );
        setViewCount(viewsSnapshot.size);
        console.log("Total views:", viewsSnapshot.size);
      } catch (viewError) {
        console.error("Error handling view:", viewError);
      }
    };

    updateViewCount();
  }, [product, userIp, user]);

  const handleTypeChange = (type) => {
    if (!type) {
      setSelectedPrice(product.price);
    } else {
      const prices = product.prices?.[type] || null;
      setSelectedPrice(prices);
    }
  };

  const formatPrice = (price) => {
    return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
              <span>{ratings.length}</span>
              <span>Ulasan</span>
            </div>

            <div className="view-count">
              <span>{viewCount}</span>
              <span>View</span>
            </div>
          </div>

          <div className="stock">
            <label htmlFor="stock">Stock :</label>
            <span id="stock">{product.stock}</span>
          </div>

          {selectedPrice && (
            <div className="price">
              <label htmlFor="price">Price :</label>
              <span id="price">{formatPrice(selectedPrice)}</span>
            </div>
          )}

          {types.length > 0 && (
            <div className="types">
              <label>Select Type:</label>

              <div className="type-buttons">
                <button
                  onClick={() => handleTypeChange("")}
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
                    onClick={() => handleTypeChange(type)}
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

          <div className="component">
            <div className="box">
              <Timer />
              <span>Pengerjaan Tergantung Kerumitan</span>
            </div>

            <div className="box">
              <RefreshCcw />
              <span>Gratis Revisi Selama 3 Kali</span>
            </div>

            <div className="box">
              <Users />
              <span>Dikerjakan oleh Tim Ahli</span>
            </div>
          </div>
        </div>
      </div>

      <div className="description">
        <div
          className="product-content"
          dangerouslySetInnerHTML={{ __html: product.content }}
        />
      </div>

      <div className="ulasan">
        <h2>Ulasan</h2>
        <div className="ulasan-list">
          {ratings.map((rating, index) => (
            <div key={`rating-${index}`} className="ulasan-item">
              <span>{rating.rating}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
