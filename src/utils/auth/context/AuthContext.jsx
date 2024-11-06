"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/utils/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Cookies from 'js-cookie';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (user.emailVerified) {
          const userDoc = await getDoc(doc(db, "users", user.uid));

          if (userDoc.exists()) {
            const userData = userDoc.data();
            const role = userData.role;

            setUser({
              ...user,
              isAdmin: role === "admin",
              role: role,
            });

            localStorage.setItem('userRole', role);

            const welcomeMessage = role === "admin"
              ? `Selamat Datang Kembali, Admin ${userData.firstName}!`
              : `Selamat Datang Kembali, ${userData.firstName}!`;

            toast.success(welcomeMessage, {
              duration: 3000,
              position: "top-center",
            });
          }
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
      if (user) {
        Cookies.set('authToken', user.accessToken, { expires: 7, secure: true, sameSite: 'Strict' });
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      toast.error("Login failed. Please check your credentials.");
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      Cookies.remove('authToken');
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export default AuthContextProvider;
