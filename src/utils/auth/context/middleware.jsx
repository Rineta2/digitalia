import { NextResponse } from "next/server";
import { notFound } from "next/navigation";

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get("authToken");
  const userRole = request.cookies.get("userRole");

  if (!authToken || !userRole) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    if (pathname.startsWith("/admin")) {
      if (userRole !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    if (pathname.startsWith("/users")) {
      if (userRole === "admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
    }

    const pageExists = await checkPageExists(pathname);
    if (!pageExists) {
      return notFound();
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error.message);
    return notFound();
  }
}

async function checkPageExists(pathname) {
  const invalidPaths = ["/admin/non-existent-page"];
  return !invalidPaths.includes(pathname);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
