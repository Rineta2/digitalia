import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/utils/firebase";

export const useFetchProducts = () => {
  const [products, setProducts] = useState([]);
  const [tags, setTags] = useState([]);
  const [filteredTags, setFilteredTags] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(db, process.env.NEXT_PUBLIC_API_PRODUCT)
        );
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

  return { products, tags, filteredTags };
};
