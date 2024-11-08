"use client";
import { useAuth } from "@/utils/auth/context/AuthContext";

import { useRouter } from "next/navigation";

import { Fragment, useEffect } from "react";

import Navbar from "@/components/ui/layout/admin/Navbar";

import Header from "@/components/ui/layout/admin/Header";

import "@/components/styling/Admin.scss";

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || !user.isAdmin) {
    return null;
  }

  return (
    <Fragment>
      <div className="admin">
        <div className="sidebar">
          <Header />
          <Navbar />
        </div>

        <div className="aside">{children}</div>
      </div>
    </Fragment>
  );
}
