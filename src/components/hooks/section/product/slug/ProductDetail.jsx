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
        const productsCollection = collection(db, "products");
        const productQuery = query(
          productsCollection,
          where("slug", "==", slug)
        );
        const querySnapshot = await getDocs(productQuery);

        if (!querySnapshot.empty) {
          const productDoc = querySnapshot.docs[0];
          const productData = {
            id: productDoc.id,
            ...productDoc.data(),
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
  }, [slug, userIp]);

  useEffect(() => {
    const updateViewCount = async () => {
      if (!product || !userIp) return;

      const viewId = user
        ? `${product.id}_${user.uid}`
        : `${product.id}_${userIp}`;

      try {
        const viewsCollection = collection(db, "product_views");
        const viewDocRef = doc(db, "product_views", viewId);
        const viewDocSnap = await getDoc(viewDocRef);

        if (!viewDocSnap.exists()) {
          await setDoc(viewDocRef, {
            productId: product.id,
            ip: userIp,
            timestamp: serverTimestamp(),
            userId: user?.uid || null,
          });
        }

        const viewsQuery = query(
          viewsCollection,
          where("productId", "==", product.id)
        );
        const viewsSnapshot = await getDocs(viewsQuery);
        setViewCount(viewsSnapshot.size);
      } catch (error) {
        console.error("Error handling view:", error);
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

  const handleRatingSuccess = async () => {
    if (product) {
      const productRatings = await getProductRatings(product.id);
      setRatings(productRatings);
      if (productRatings.length > 0) {
        const average =
          productRatings.reduce((acc, curr) => acc + curr.rating, 0) /
          productRatings.length;
        setAverageRating(average);
      }
    }
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
              <div className="user-info">
                <div className="user-profile">
                  <img
                    src={rating.userInfo?.photoURL || "/default-avatar.png"}
                    alt={`${rating.userInfo?.firstName || "User"}'s profile`}
                    className="profile-image"
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
                {rating.createdAt instanceof Date
                  ? rating.createdAt.toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Tanggal tidak tersedia"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
