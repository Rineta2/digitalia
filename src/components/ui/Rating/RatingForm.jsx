import { useState, Fragment } from "react";

import { addProductRating } from "@/components/hooks/admin/product/NewsProduct/utils/productServices";

import { useAuth } from "@/utils/auth/context/AuthContext";

import { toast } from "react-toastify";

import Login from "@/components/ui/layout/auth/Login";

export default function RatingForm({ productId, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Silakan login terlebih dahulu");
      setShowLogin(true);
      return;
    }

    if (rating === 0) {
      toast.warning("Silakan pilih rating terlebih dahulu");
      return;
    }

    try {
      setLoading(true);
      await addProductRating(productId, user.uid, rating, review);
      toast.success("Rating berhasil ditambahkan");
      setRating(0);
      setReview("");
      if (onSuccess) {
        await onSuccess();
      }
    } catch (error) {
      console.error("Detail error:", error);
      if (error.message === "Anda sudah memberikan rating untuk produk ini") {
        toast.info("Anda sudah memberikan rating untuk produk ini sebelumnya");
      } else {
        toast.error("Gagal menambahkan rating. Silakan coba lagi");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fragment>
      <form onSubmit={handleSubmit} className="rating-form">
        <div className="stars">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className={`star ${rating >= value ? "active" : ""}`}
            >
              ★
            </button>
          ))}
        </div>

        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Tulis review Anda..."
          className="review-input"
          required
        />

        <button
          type="submit"
          disabled={loading || rating === 0}
          className="submit-button"
        >
          {loading ? "Mengirim..." : "Kirim Rating"}
        </button>
      </form>

      {showLogin && (
        <div className="modal">
          <Login onClose={() => setShowLogin(false)} />
        </div>
      )}
    </Fragment>
  );
}
