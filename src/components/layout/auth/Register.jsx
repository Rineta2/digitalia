import React, { useState } from "react";

import { auth, db } from "@/utils/firebase";

import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";

import { doc, setDoc } from "firebase/firestore";

import { parsePhoneNumber, isValidPhoneNumber } from "libphonenumber-js";

import "react-phone-number-input/style.css";

import PhoneInput from "react-phone-number-input";

import "@/components/styling/Header.scss";

import toast from 'react-hot-toast';

export default function Register({ onTabChange }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!firstName || !lastName || !email || !phoneNumber || !password || !confirmPassword) {
      toast.error("Semua bidang harus diisi");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Password dan konfirmasi password tidak cocok");
      setLoading(false);
      return;
    }

    if (!isValidPhoneNumber(phoneNumber)) {
      toast.error("Nomor telepon tidak valid");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await sendEmailVerification(userCredential.user);

      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: userCredential.user.email,
        firstName,
        lastName,
        phoneNumber: parsePhoneNumber(phoneNumber).formatInternational(),
        role: "user",
        emailVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        uid: userCredential.user.uid,
      });

      toast.success("Silakan cek email Anda untuk verifikasi akun");
      onTabChange("login");
    } catch (error) {
      toast.error(
        error.code === "auth/email-already-in-use"
          ? "Email sudah terdaftar"
          : "Silakan coba lagi nanti"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register">
      <h2 className="title">Daftar Akun Baru</h2>

      <form onSubmit={handleSubmit}>
        {error && (
          <div role="alert" style={{ color: "#ff0000", fontWeight: "bold" }}>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="form__box">
          <div className="box">
            <label htmlFor="first-name">Nama Depan</label>
            <input
              minLength={2}
              id="first-name"
              name="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          <div className="box">
            <label htmlFor="last-name">Nama Belakang</label>

            <input
              id="last-name"
              name="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>

        <div className="single__box">
          <label htmlFor="email-address">Email address</label>
          <input
            type="email"
            id="email-address"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="single__box">
          <label htmlFor="phone-number">Nomor Telepon</label>

          <PhoneInput
            international
            defaultCountry="ID"
            value={phoneNumber}
            onChange={setPhoneNumber}
          />
        </div>

        <div className="single__box">
          <label htmlFor="password">Password</label>
          <input
            minLength={6}
            type="password"
            id="password"
            name="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="single__box">
          <label htmlFor="confirm-password">Confirm Password</label>
          <input
            type="password"
            id="confirm-password"
            name="confirm-password"
            autoComplete="new-password"
            value={confirmPassword}
            pattern={password}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <div>
          <button type="submit" disabled={loading}>
            {loading ? "Mendaftar..." : "Daftar"}
          </button>
        </div>
      </form>
    </div>
  );
}
