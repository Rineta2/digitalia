"use client";
import { useState, useEffect } from "react";

import { useAuth } from "@/utils/auth/context/AuthContext";

import dynamic from "next/dynamic";

import {
  fetchProducts,
  fetchCategories,
} from "@/components/hooks/admin/product/NewsProduct/utils/productServices";

const ProductTable = dynamic(
  () => import("@/components/hooks/admin/product/NewsProduct/ProductTable"),
  { ssr: false }
);

const ProductToolbar = dynamic(
  () => import("@/components/hooks/admin/product/NewsProduct/ProductToolbar"),
  { ssr: false }
);

const ProductHeader = dynamic(
  () => import("@/components/hooks/admin/product/NewsProduct/ProductHeader"),
  { ssr: false }
);

const Pagination = dynamic(
  () => import("@/components/hooks/admin/product/NewsProduct/Pagination"),
  { ssr: false }
);

import "@/components/styling/Admin.scss";

export default function NewsProduct() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user]);

  const loadInitialData = async () => {
    try {
      const productsData = await fetchProducts(user);
      const categoriesData = await fetchCategories();
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error loading initial data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please login to access this page</div>;

  const filteredProducts = products.filter(
    (product) =>
      (product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedCategory === "" || product.category === selectedCategory)
  );

  const paginatedProducts = {
    currentProducts: filteredProducts.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    ),
    totalPages: Math.ceil(filteredProducts.length / itemsPerPage),
  };

  return (
    <section className="product">
      <div className="product__container container">
        <ProductHeader />

        <ProductToolbar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
        />

        <ProductTable
          products={paginatedProducts.currentProducts}
          onProductsChange={loadInitialData}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={paginatedProducts.totalPages}
          onPageChange={(selected) => setCurrentPage(selected + 1)}
        />

        {filteredProducts.length === 0 && !loading && (
          <div>No products found. Create your first product!</div>
        )}
      </div>
    </section>
  );
}
