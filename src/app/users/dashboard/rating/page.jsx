"use client";
import React, { useEffect, useState } from "react";
import { db } from "@/utils/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import toast from "react-hot-toast";

export default function RatingPage() {
  const [ratings, setRatings] = useState([]);
  const [products, setProducts] = useState({});
  const auth = getAuth();
  const [editingId, setEditingId] = useState(null);
  const [editedReview, setEditedReview] = useState("");
  const [editedRating, setEditedRating] = useState("");

  useEffect(() => {
    const fetchRatings = async () => {
      const user = auth.currentUser;
      if (user?.email) {
        const userQuery = query(
          collection(db, process.env.NEXT_PUBLIC_API_USER),
          where("email", "==", user.email)
        );

        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          const userId = userSnapshot.docs[0].id;

          const ratingsQuery = query(
            collection(db, process.env.NEXT_PUBLIC_API_RATING),
            where("userId", "==", userId)
          );

          const ratingsSnapshot = await getDocs(ratingsQuery);
          const ratingsData = [];
          ratingsSnapshot.forEach((doc) => {
            ratingsData.push({ id: doc.id, ...doc.data() });
          });

          const productIds = [
            ...new Set(ratingsData.map((rating) => rating.productId)),
          ];

          const productsData = {};

          for (const productId of productIds) {
            const productDoc = await getDocs(
              query(
                collection(db, process.env.NEXT_PUBLIC_API_PRODUCT),
                where("__name__", "==", productId)
              )
            );

            if (!productDoc.empty) {
              productsData[productId] = productDoc.docs[0].data().title;
            } else {
              toast.error(`Product not found: ${productId}`);
            }
          }

          setProducts(productsData);
          setRatings(ratingsData);
        }
      }
    };

    fetchRatings();
  }, [auth.currentUser]);

  const handleDelete = async (ratingId) => {
    if (window.confirm("Are you sure you want to delete this rating?")) {
      try {
        await deleteDoc(doc(db, process.env.NEXT_PUBLIC_API_RATING, ratingId));
        const updatedRatings = ratings.filter(
          (rating) => rating.id !== ratingId
        );
        setRatings(updatedRatings);
        const remainingProductIds = [
          ...new Set(updatedRatings.map((rating) => rating.productId)),
        ];
        const updatedProducts = {};
        for (const id of remainingProductIds) {
          if (products[id]) {
            updatedProducts[id] = products[id];
          }
        }
        setProducts(updatedProducts);
        toast.success("Rating deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete rating. Please try again.");
      }
    }
  };

  const handleEdit = (rating) => {
    setEditingId(rating.id);
    setEditedReview(rating.review);
    setEditedRating(rating.rating);
  };

  const handleSave = async (ratingId) => {
    try {
      if (!editedReview.trim() || !editedRating) {
        toast.error("Please fill in both review and rating");
        return;
      }

      await updateDoc(doc(db, process.env.NEXT_PUBLIC_API_RATING, ratingId), {
        review: editedReview,
        rating: Number(editedRating),
        updatedAt: new Date().toISOString(),
      });

      setRatings(
        ratings.map((rating) =>
          rating.id === ratingId
            ? { ...rating, review: editedReview, rating: editedRating }
            : rating
        )
      );

      setEditingId(null);
      setEditedReview("");
      setEditedRating("");

      toast.success("Rating updated successfully!");
    } catch (error) {
      toast.error("Failed to update rating. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditedReview("");
    setEditedRating("");
  };

  return (
    <section>
      <h1>My Ratings</h1>
      {ratings.map((rating) => (
        <div key={rating.id}>
          <p>Rating: {"⭐".repeat(rating.rating)}</p>
          <p>Review: {rating.review}</p>
          <p>Product: {products[rating.productId] || "Loading..."}</p>
          <button onClick={() => handleEdit(rating)}>Edit</button>
          <button onClick={() => handleDelete(rating.id)}>Delete</button>
          {editingId === rating.id && (
            <div className="edit-form">
              <textarea
                value={editedReview}
                onChange={(e) => setEditedReview(e.target.value)}
                placeholder="Enter your review"
                rows="3"
                style={{ width: "100%", marginBottom: "10px" }}
              />
              <div style={{ marginBottom: "10px" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => setEditedRating(star)}
                    style={{ cursor: "pointer", fontSize: "24px" }}
                  >
                    {star <= editedRating ? "⭐" : "☆"}
                  </span>
                ))}
              </div>
              <button onClick={() => handleSave(rating.id)}>Save</button>
              <button onClick={handleCancelEdit}>Cancel</button>
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
