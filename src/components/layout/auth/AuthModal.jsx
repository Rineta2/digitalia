import React from "react";

import Login from "@/components/layout/auth/Login";

import Register from "@/components/layout/auth/Register";

import { useAuth } from "@/utils/auth/context/AuthContext";

import "@/components/styling/Header.scss";

export default function AuthModal({ isOpen, onClose, activeTab, onTabChange }) {
  const { user } = useAuth();

  React.useEffect(() => {
    if (user) {
      onClose();
    }
  }, [user, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal__content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>

        <div className="form-header">
          <button
            className={`toggle-btn ${activeTab === "login" ? "active" : ""}`}
            onClick={() => onTabChange("login")}>
            Login
          </button>

          <button
            className={`toggle-btn ${activeTab === "register" ? "active" : ""}`}
            onClick={() => onTabChange("register")}>
            Register
          </button>
        </div>

        {activeTab === "login" ? (
          <Login onClose={onClose} />
        ) : (
          <Register onClose={onClose} onTabChange={onTabChange} />
        )}
      </div>
    </div>
  );
}
