"use client";

import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import Image from "next/image";
import Link from "next/link";

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

export default function NewsPruduct() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [tags, setTags] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productsData);
        setTags([
          ...new Set(productsData.flatMap((product) => product.tags || [])),
        ]);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedCategory !== "Website") setSelectedTag("");
  }, [selectedCategory]);

  const categories = [...new Set(products.map((product) => product.category))];

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
          {products
            .filter(
              (product) =>
                (!selectedCategory || product.category === selectedCategory) &&
                (!selectedTag || product.tags.includes(selectedTag))
            )
            .map((product) => (
              <div key={product.id} className="box">
                <div className="img">
                  <Image
                    width={500}
                    height={500}
                    quality={100}
                    src={product.imageUrl || "/placeholder-image.jpg"}
                    alt={product.title}
                  />

                  <div className="price">
                    <h1>Rp. {product.price}</h1>
                  </div>
                </div>
                <h2>{product.title}</h2>
                <p>
                  {product.createdAt
                    ? formatTimeAgo(new Date(product.createdAt.toDate()))
                    : "Tanggal tidak tersedia"}
                </p>

                <Link href={`/pages/products/${product.tags}`}>
                  Lihat Detail
                </Link>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
