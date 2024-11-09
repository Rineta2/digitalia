import { useState, useEffect } from "react";
import { db } from "@/utils/firebase";
import { useAuth } from "@/utils/auth/context/AuthContext";
import { getProductRatings } from "@/components/hooks/admin/product/NewsProduct/utils/productServices";
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

export function useProduct(slug) {
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

          const productTypes = Object.keys(productData.prices || {});
          const enrichedProductData = {
            ...productData,
            types: productTypes,
          };

          setProduct(enrichedProductData);
          setSelectedPrice(productData.price);
          setTypes(productTypes);

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
    if (!type || type === "Default") {
      setSelectedPrice(product.price);
    } else {
      const prices = product.prices?.[type] || null;
      setSelectedPrice(prices);
    }
  };

  const formatPrice = (price) => {
    return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const getCurrentType = () => {
    if (!selectedPrice || selectedPrice === product?.price) {
      return "Default";
    }
    const currentType = types.find(
      (type) => product?.prices?.[type] === selectedPrice
    );
    return currentType || "Default";
  };

  const isTypeSelected = () => {
    if (!types.length) return true;
    if (selectedPrice !== product?.price) {
      return types.some((type) => product?.prices?.[type] === selectedPrice);
    }
    return false;
  };

  return {
    product,
    loading,
    selectedPrice,
    types,
    ratings,
    averageRating,
    viewCount,
    handleTypeChange,
    formatPrice,
    getCurrentType,
    isTypeSelected,
  };
}
