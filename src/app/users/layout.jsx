"use client";
import { useAuth } from "@/utils/auth/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function UserLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="user-layout">
      <main>{children}</main>
    </div>
  );
}
