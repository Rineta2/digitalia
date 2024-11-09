"use client";
import React, { useEffect, useState } from "react";

import { db } from "@/utils/firebase";

import { collection, getDocs, query, orderBy } from "firebase/firestore";

import "@/components/styling/Admin.scss";

export default function Transaksi() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const q = query(
          collection(db, "transactions"),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const transactionData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTransactions(transactionData);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setError("Gagal mengambil data transaksi");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <section className="transaction">
      <div className="transaction__container container">
        <h1 className="transaction-title">Transaksi</h1>

        <div className="transaction-grid">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="transaction-card">
              <div className="transaction-card__header">
                <div className="order-id">Order ID: {transaction.orderId}</div>
                <span
                  className={`status-badge ${transaction.status.toLowerCase()}`}
                >
                  {transaction.status}
                </span>
              </div>

              <div className="transaction-card__content">
                <div className="product-section">
                  <div className="image-container">
                    <img
                      src={transaction.product?.imageUrl}
                      alt={transaction.productName}
                      className="product-image"
                    />
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{transaction.productName}</h3>
                    <p className="product-type">{transaction.productType}</p>
                    <p className="amount">{formatRupiah(transaction.amount)}</p>
                  </div>
                </div>

                <div className="customer-section">
                  <h4>Customer Info</h4>
                  <p className="customer-name">
                    {transaction.customerDetails?.firstName}{" "}
                    {transaction.customerDetails?.lastName}
                  </p>
                  <p className="customer-email">
                    {transaction.customerDetails?.email}
                  </p>
                </div>

                <div className="payment-section">
                  <h4>Payment Details</h4>
                  <p className="payment-type">
                    {transaction.paymentDetails?.payment_type?.replace(
                      /_/g,
                      " "
                    )}
                  </p>
                  {transaction.paymentDetails?.va_numbers?.[0]?.va_number && (
                    <p className="va-number">
                      VA: {transaction.paymentDetails.va_numbers[0].va_number}
                    </p>
                  )}
                </div>

                <div className="date-section">
                  {transaction.createdAt?.toDate().toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
