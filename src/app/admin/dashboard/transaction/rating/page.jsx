"use client";
import React, { useEffect, useState } from "react";

import { db } from "@/utils/firebase";

import {
  collection,
  query,
  getDocs,
  orderBy,
  deleteDoc,
  doc,
  getDoc,
  where,
} from "firebase/firestore";

import toast from "react-hot-toast";

export default function Rating() {
  const [ratings, setRatings] = useState([]);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const ratingsSnapshot = await getDocs(
          query(
            collection(db, process.env.NEXT_PUBLIC_API_RATING),
            orderBy("createdAt", "desc")
          )
        );

        const ratingsWithProducts = await Promise.all(
          ratingsSnapshot.docs.map(async (doc) => {
            const data = doc.data();
            const productDoc = await getDocs(
              query(
                collection(db, process.env.NEXT_PUBLIC_API_PRODUCT),
                where("__name__", "==", data.productId)
              )
            );

            return {
              id: doc.id,
              ...data,
              productTitle: productDoc.empty
                ? "Product not found"
                : productDoc.docs[0].data().title,
            };
          })
        );

        setRatings(ratingsWithProducts);
      } catch (error) {
        toast.error("Failed to fetch ratings");
      }
    };

    fetchRatings();
  }, []);

  const handleDeleteRating = async (id) => {
    if (!window.confirm("Are you sure you want to delete this rating?")) return;

    try {
      await deleteDoc(doc(db, "ratings", id));
      setRatings(ratings.filter((rating) => rating.id !== id));
      toast.success("Rating deleted successfully");
    } catch (error) {
      toast.error("Failed to delete rating");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Ratings</h1>

      <div className="grid gap-4">
        {ratings.map((rating) => (
          <div key={rating.id} className="border p-4 rounded">
            <div className="flex justify-between items-start">
              <div>
                <p>Nama Produk: {rating.productTitle}</p>
                <p>Rating: {"⭐".repeat(rating.rating)}</p>
                <p>Review: {rating.review}</p>
                <p className="text-sm text-gray-500">
                  By: {rating.userInfo?.firstName} {rating.userInfo?.lastName}{" "}
                  on {rating.createdAt?.toDate().toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleDeleteRating(rating.id)}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
