"use client";
import React, { useState, useEffect } from "react";

import { auth, db } from "@/utils/firebase";

import {
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";

import { doc, getDoc } from "firebase/firestore";

import "@/components/styling/Header.scss";

import { toast } from "react-hot-toast";

export default function Login({ onClose }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [isLoading, setIsLoading] = useState(false);

  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const [resetEmail, setResetEmail] = useState("");

  const [resetMessage, setResetMessage] = useState("");

  // Load saved credentials if available
  useEffect(() => {
    const savedEmail = localStorage.getItem("savedEmail");
    const savedPassword = localStorage.getItem("savedPassword");
    if (savedEmail && savedPassword) {
      setFormData({
        email: savedEmail,
        password: savedPassword,
        rememberMe: true,
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (formData.rememberMe) {
        localStorage.setItem("savedEmail", formData.email);
        localStorage.setItem("savedPassword", formData.password);
        await setPersistence(auth, browserLocalPersistence);
      } else {
        localStorage.removeItem("savedEmail");
        localStorage.removeItem("savedPassword");
        await setPersistence(auth, browserSessionPersistence);
      }

      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      if (!userCredential.user.emailVerified) {
        await sendEmailVerification(userCredential.user);
        setError(
          "Silakan verifikasi email Anda terlebih dahulu. Email verifikasi baru telah dikirim."
        );
        await signOut(auth);
        return;
      }

      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));

      if (!userDoc.exists()) {
        setError("Akun tidak ditemukan");
        await signOut(auth);
        return;
      }

      const userData = userDoc.data();
      const welcomeMessage =
        userData.role === "admin"
          ? `Selamat Datang Kembali, Admin ${userData.firstName}!`
          : `Selamat Datang Kembali, ${userData.firstName}!`;

      toast.success(welcomeMessage, {
        duration: 3000,
        position: "top-center",
      });

      onClose();
    } catch (error) {
      switch (error.code) {
        case "auth/user-not-found":
          toast.error("Email tidak terdaftar");
          break;
        case "auth/wrong-password":
          toast.error("Password salah");
          break;
        case "auth/invalid-email":
          toast.error("Format email tidak valid");
          break;
        case "auth/too-many-requests":
          toast.error("Terlalu banyak percobaan login. Silakan coba lagi nanti");
          break;
        default:
          toast.error("Gagal login. Silakan coba lagi");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetMessage("");

    if (!validateEmail(resetEmail)) {
      toast.error("Silahkan masukkan email yang valid");
      return;
    }

    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage(
        "Email reset password telah dikirim. Silakan periksa inbox Anda."
      );
      setResetEmail("");
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        toast.error("Email tidak terdaftar");
      } else {
        toast.error("Terjadi kesalahan. Silakan coba lagi nanti.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="login">
        <h2 className="title">Reset Password</h2>
        {resetMessage && (
          <p
            style={{
              fontSize: "1.2rem",
              color: "#008000",
              fontWeight: "bold",
              textAlign: "center",
            }}>
            {resetMessage}
          </p>
        )}
        <form onSubmit={handleForgotPassword}>
          <div className="box">
            <label htmlFor="resetEmail">Email</label>

            <input
              type="email"
              id="resetEmail"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Loading..." : "Kirim Reset Link"}
          </button>

          <button
            type="button"
            onClick={() => {
              setShowForgotPassword(false);
              setResetMessage("");
            }}
            style={{ marginTop: "1rem" }}>
            Kembali ke Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="login">
      <h2 className="title">Silahkan Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="box">
          <label htmlFor="email">Email</label>

          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        <div className="box">
          <label htmlFor="password">Password</label>

          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        <div className="remember-forgot">
          <div className="remember">
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              disabled={isLoading}
            />
            <label htmlFor="rememberMe">Ingat Saya</label>
          </div>

          <div className="forgot">
            <div type="button" onClick={() => setShowForgotPassword(true)}>
              Lupa Password?
            </div>
          </div>
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Loading..." : "Login"}
        </button>
      </form>
    </div>
  );
}
