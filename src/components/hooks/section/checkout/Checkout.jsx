import { useState, useEffect } from "react";
import { useAuth } from "@/utils/auth/context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/utils/firebase";
import toast from "react-hot-toast";

export default function Checkout({
  product,
  selectedPrice,
  onPayment,
  onCancel,
  selectedType,
}) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user) return;
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserDetails(userDoc.data());
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();
  }, [user]);

  const formatPrice = (price) => {
    return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const getFullName = () => {
    if (!userDetails) return "";
    return `${userDetails.firstName || ""} ${
      userDetails.lastName || ""
    }`.trim();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onPayment({
        firstName: userDetails?.firstName,
        lastName: userDetails?.lastName,
        phoneNumber: userDetails?.phoneNumber,
        selectedType: selectedType,
      });
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>

      <div className="order-summary">
        <h3>Order Summary</h3>
        <div className="product-details">
          <img
            src={product.additionalImageUrls?.[0]}
            alt={product.title}
            className="product-image"
          />
          <div className="product-info">
            <h4>{product.title}</h4>
            <p className="price">Rp {formatPrice(selectedPrice)}</p>
            <div className="form-group">
              <input type="text" value={selectedType || "Default"} disabled />
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="checkout-form">
        <div className="form-group">
          <label>Name</label>
          <input type="text" value={getFullName()} disabled />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input type="email" value={user?.email || ""} disabled />
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <input type="tel" value={userDetails?.phoneNumber || ""} disabled />
        </div>

        <div className="total-section">
          <div className="total-row grand-total">
            <span>Total:</span>
            <span>Rp {formatPrice(selectedPrice)}</span>
          </div>
        </div>

        <div className="button-group">
          <button type="button" onClick={onCancel} className="cancel-button">
            Cancel
          </button>
          <button type="submit" className="pay-button" disabled={loading}>
            {loading ? "Processing..." : `Pay Rp ${formatPrice(selectedPrice)}`}
          </button>
        </div>
      </form>

      <style jsx>{`
        .checkout-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .order-summary {
          margin-bottom: 30px;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
        }

        .product-details {
          display: flex;
          gap: 20px;
          margin-top: 15px;
        }

        .product-image {
          width: 100px;
          height: 100px;
          object-fit: cover;
          border-radius: 4px;
        }

        .checkout-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-weight: 500;
        }

        .form-group input {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: #f3f4f6;
        }

        .total-section {
          margin-top: 20px;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background-color: #f9fafb;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
        }

        .grand-total {
          font-weight: bold;
          font-size: 1.2em;
          color: #1f2937;
        }

        .button-group {
          display: flex;
          gap: 15px;
          margin-top: 20px;
        }

        button {
          padding: 12px 24px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        }

        .cancel-button {
          background-color: #f3f4f6;
          color: #374151;
        }

        .pay-button {
          background-color: #4f46e5;
          color: white;
          flex: 1;
        }

        button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
