import { useState, useEffect } from "react";
import { useAuth } from "@/utils/auth/context/AuthContext";
import { db } from "@/utils/firebase";
import toast from "react-hot-toast";
import {
  collection,
  addDoc,
  writeBatch,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";

export function usePayment(product, selectedPrice) {
  const [showCheckout, setShowCheckout] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { user } = useAuth();

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please login to add items to cart");
      setShowLoginPopup(true);
      return;
    }

    if (user.isAdmin) {
      toast.error("Admin cannot add items to cart");
      return;
    }

    if (!product || isAddingToCart) return;

    const currentType = product.types?.find(
      (type) => product.prices?.[type] === selectedPrice
    );

    if (product.types?.length > 0 && !currentType) {
      toast.error("Please select a type before adding to cart");
      return;
    }

    if (!product.stock || product.stock <= 0) {
      toast.error("Product is out of stock!");
      return;
    }

    try {
      setIsAddingToCart(true);

      const cartCollection = collection(db, "carts");
      const cartQuery = query(
        cartCollection,
        where("userId", "==", user.uid),
        where("productId", "==", product.id),
        where("type", "==", currentType || "default")
      );

      const cartSnapshot = await getDocs(cartQuery);

      if (!cartSnapshot.empty) {
        toast.success("Product already in cart!");
        return;
      }

      await addDoc(cartCollection, {
        userId: user.uid,
        productId: product.id,
        productTitle: product.title,
        productImage: product.additionalImageUrls?.[0] || "",
        price: selectedPrice,
        type: currentType || "default",
        quantity: 1,
        stock: product.stock,
        createdAt: serverTimestamp(),
      });

      toast.success("Product added to cart successfully!");
    } catch (error) {
      toast.error("Failed to add product to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    if (!user) {
      toast.error("Please login to purchase");
      setShowLoginPopup(true);
      return;
    }

    if (!product.stock || product.stock <= 0) {
      toast.error("Product is out of stock!");
      return;
    }

    setShowCheckout(true);
  };

  const handlePayment = async (checkoutDetails) => {
    try {
      const orderId = `ORDER-${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}`;

      const response = await fetch(
        `${window.location.origin}/api/create-transactions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId,
            amount: selectedPrice,
            productName: product.title,
            firstName: checkoutDetails.firstName,
            lastName: checkoutDetails.lastName,
            email: user.email,
            phoneNumber: checkoutDetails.phoneNumber,
            selectedType: checkoutDetails.selectedType,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const transactionRef = await addDoc(collection(db, "transactions"), {
        orderId,
        userId: user.uid,
        productId: product.id,
        productName: product.title,
        productType: checkoutDetails.selectedType || "Default",
        amount: selectedPrice,
        customerDetails: {
          firstName: checkoutDetails.firstName,
          lastName: checkoutDetails.lastName,
          email: user.email,
          phoneNumber: checkoutDetails.phoneNumber,
        },
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        paymentToken: data.token,
        product: {
          id: product.id,
          title: product.title,
          price: selectedPrice,
          type: checkoutDetails.selectedType || "Default",
          imageUrl: product.additionalImageUrls?.[0] || null,
        },
      });

      window.snap.pay(
        data.token,
        {
          onSuccess: async (result) => {
            try {
              const productRef = doc(db, "products", product.id);
              const productDoc = await getDoc(productRef);

              if (!productDoc.exists()) {
                throw new Error("Product not found!");
              }

              const currentStock = productDoc.data().stock;
              if (currentStock <= 0) {
                throw new Error("Product is out of stock!");
              }

              const newStock = currentStock - 1;
              const batch = writeBatch(db);

              batch.update(productRef, { stock: newStock });
              batch.update(doc(db, "transactions", transactionRef.id), {
                status: "success",
                paymentDetails: result,
                updatedAt: serverTimestamp(),
              });

              await batch.commit();
              toast.success("Payment successful!");
              setShowCheckout(false);
            } catch (error) {
              console.error("Error updating stock:", error);
              toast.error("Error updating stock: " + error.message);
            }
          },
          onPending: async (result) => {
            await updateDoc(doc(db, "transactions", transactionRef.id), {
              status: "pending",
              paymentDetails: result,
              updatedAt: serverTimestamp(),
            });
            toast.info("Waiting for payment");
          },
          onError: async (result) => {
            await updateDoc(doc(db, "transactions", transactionRef.id), {
              status: "failed",
              paymentDetails: result,
              updatedAt: serverTimestamp(),
            });
            toast.error("Payment failed");
          },
          onClose: () => {
            toast.info("You closed the payment window");
          },
        },
        {
          skipOrderSummary: true,
          showOrderId: false,
          autoCloseDelay: 0,
          skipCustomerDetails: true,
        }
      );
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Error processing payment: " + error.message);
    }
  };

  useEffect(() => {
    const midtransScriptUrl = "https://app.sandbox.midtrans.com/snap/snap.js";
    const myMidtransClientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;

    let scriptTag = document.createElement("script");
    scriptTag.src = midtransScriptUrl;
    scriptTag.setAttribute("data-client-key", myMidtransClientKey);

    document.body.appendChild(scriptTag);

    return () => {
      document.body.removeChild(scriptTag);
    };
  }, []);

  return {
    showCheckout,
    showLoginPopup,
    activeTab,
    isAddingToCart,
    handleAddToCart,
    handleBuyNow,
    handlePayment,
    handleLoginClose: () => setShowLoginPopup(false),
    handleTabChange: (tab) => setActiveTab(tab),
    setShowCheckout,
  };
}
