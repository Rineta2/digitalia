"use client";
import React, { Fragment } from "react";

import { Roboto } from "next/font/google";

import { usePathname } from "next/navigation";

import { Toaster } from "react-hot-toast";

import "@/components/styling/globals.scss";

import Header from "@/components/ui/layout/Header";

import { AuthContextProvider } from "@/utils/auth/context/AuthContext";

import { minimatch } from "minimatch";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  display: "swap",
});

const adminPattern = "/admin/dashboard/**";

export default function RootLayout({ children }) {
  const pathname = usePathname();

  const isAdminPath =
    minimatch(pathname, adminPattern, { matchBase: true }) ||
    pathname === "/admin/dashboard";

  return (
    <html lang="en">
      <body className={roboto.className}>
        <Fragment>
          <AuthContextProvider>
            {!isAdminPath && <Header />}
            {children}
            <Toaster />
          </AuthContextProvider>
        </Fragment>
      </body>
    </html>
  );
}
