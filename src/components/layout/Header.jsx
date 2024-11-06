"use client";

import React, { useState, useEffect } from "react";

import Link from "next/link";

import { navLink, profile } from "@/components/data/Header";

import { LogOut, LogIn, ShoppingCart, User } from "lucide-react";

import Image from "next/image";

import "@/components/styling/Header.scss";

import { useAuth } from "@/utils/auth/context/AuthContext";

import AuthModal from "@/components/layout/auth/AuthModal";

import Cookies from 'js-cookie';

export default function Header() {
  const { user, login, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [fixed, setFixed] = useState(false);

  useEffect(() => {
    const authToken = Cookies.get('authToken');
    if (authToken && !user) {
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setFixed(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={fixed ? "fixed" : ""}>
      <nav
        className="nav container"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
        {profile.map((item) => {
          return (
            <Link key={item.id} href={item.path} className="nav__logo">
              <Image
                src={item.img}
                quality={100}
                height={100}
                width={100}
                alt={item.name}
              />
            </Link>
          );
        })}

        <ul
          className="nav__list"
          style={{ display: "flex", alignItems: "center", gap: "5rem" }}>
          {navLink.map((item) => {
            return (
              <li key={item.id} className="nav__item">
                <Link href={item.path} className="nav__link">
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>

        <div
          className="nav__actions"
          style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          <div className="cart">
            <ShoppingCart size={24} />
          </div>

          {user ? (
            <div className="profile-container" style={{ position: "relative" }}>
              <div
                className="profile-trigger"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  cursor: "pointer",
                }}>
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt="Profile"
                    width={32}
                    height={32}
                    className="profile-image"
                    style={{ borderRadius: "50%" }}
                  />
                ) : (
                  <User size={24} />
                )}
              </div>

              {showProfileMenu && (
                <div
                  className="profile-menu"
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    backgroundColor: "white",
                    padding: "1rem",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                    borderRadius: "8px",
                    marginTop: "0.5rem",
                    minWidth: "200px",
                    zIndex: 100,
                  }}>
                  <div
                    className="profile-info"
                    style={{
                      borderBottom: "1px solid #eee",
                      paddingBottom: "0.5rem",
                      marginBottom: "0.5rem",
                    }}>
                    <p style={{ fontWeight: "bold" }}>
                      {user.displayName || user.email}
                    </p>
                  </div>

                  <Link
                    href={user.isAdmin ? "/admin/dashboard" : "/users/dashboard"}
                    style={{
                      display: "block",
                      padding: "0.5rem",
                      color: "#333",
                      textDecoration: "none",
                      borderRadius: "4px",
                      marginBottom: "0.5rem",
                      transition: "background-color 0.2s",
                    }}
                    className="dashboard-link"
                    onClick={() => setShowProfileMenu(false)}>
                    Dashboard
                  </Link>

                  <button
                    onClick={handleLogout}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.5rem",
                      cursor: "pointer",
                      border: "none",
                      backgroundColor: "transparent",
                      width: "100%",
                      textAlign: "left",
                    }}>
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div
              className="login"
              onClick={() => setIsModalOpen(true)}
              style={{ cursor: "pointer" }}>
              <LogIn size={24} />
            </div>
          )}
        </div>
      </nav>
      <AuthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </header>
  );
}
