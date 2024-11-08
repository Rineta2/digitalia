"use client";

import React, { useState, useEffect } from "react";

import Link from "next/link";

import { navLink, profile } from "@/components/ui/data/Header";

import {
  LogOut,
  LogIn,
  ShoppingCart,
  User,
  LayoutDashboard,
} from "lucide-react";

import Image from "next/image";

import "@/components/styling/Header.scss";

import { useAuth } from "@/utils/auth/context/AuthContext";

import AuthModal from "@/components/ui/layout/auth/AuthModal";

import Cookies from "js-cookie";

export default function Header() {
  const { user, login, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [fixed, setFixed] = useState(false);

  useEffect(() => {
    const authToken = Cookies.get("authToken");
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
        }}
      >
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
          style={{ display: "flex", alignItems: "center", gap: "5rem" }}
        >
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
          style={{ display: "flex", gap: "2rem", alignItems: "center" }}
        >
          <div className="cart">
            <ShoppingCart size={28} />
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
                }}
              >
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt="Profile"
                    width={500}
                    height={500}
                    className="profile-image"
                  />
                ) : (
                  <User size={24} />
                )}
              </div>

              {showProfileMenu && (
                <div className="profile-menu">
                  <div
                    className="profile-info"
                    style={{
                      borderBottom: "1px solid #eee",
                      paddingBottom: "0.5rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <h1>{user.displayName || user.email}</h1>
                  </div>

                  <Link
                    href={
                      user.isAdmin ? "/admin/dashboard" : "/users/dashboard"
                    }
                    className="dashboard-link"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <LayoutDashboard size={24} /> Dashboard
                  </Link>

                  <button onClick={handleLogout}>
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
              style={{ cursor: "pointer" }}
            >
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
