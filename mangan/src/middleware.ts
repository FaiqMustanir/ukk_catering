import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userType = req.auth?.user?.type;
  const userRole = req.auth?.user?.role;

  // Define protected routes
  const pelangganRoutes = nextUrl.pathname.startsWith("/pelanggan");
  const adminRoutes = nextUrl.pathname.startsWith("/admin") && !nextUrl.pathname.startsWith("/admin/login");
  const kurirRoutes = nextUrl.pathname.startsWith("/kurir");
  const ownerRoutes = nextUrl.pathname.startsWith("/owner");

  // Redirect authenticated users away from login pages
  if (isLoggedIn) {
    if (nextUrl.pathname === "/login" || nextUrl.pathname === "/register") {
      if (userType === "pelanggan") {
        return NextResponse.redirect(new URL("/pelanggan/dashboard", nextUrl));
      }
    }
    if (nextUrl.pathname === "/admin/login") {
      if (userType === "user") {
        if (userRole === "kurir") {
          return NextResponse.redirect(new URL("/kurir/dashboard", nextUrl));
        } else if (userRole === "owner") {
          return NextResponse.redirect(new URL("/owner/dashboard", nextUrl));
        } else {
          return NextResponse.redirect(new URL("/admin/dashboard", nextUrl));
        }
      }
    }
  }

  // Protect pelanggan routes
  if (pelangganRoutes) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    if (userType !== "pelanggan") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  // Protect admin routes
  if (adminRoutes) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/admin/login", nextUrl));
    }
    if (userType !== "user") {
      return NextResponse.redirect(new URL("/admin/login", nextUrl));
    }
    
    // Redirect wrong roles to their specific dashboards
    if (userRole === "owner") {
      return NextResponse.redirect(new URL("/owner/dashboard", nextUrl));
    }
    if (userRole === "kurir") {
      return NextResponse.redirect(new URL("/kurir/dashboard", nextUrl));
    }
  }

  // Protect kurir routes
  if (kurirRoutes) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/admin/login", nextUrl));
    }
    if (userType !== "user" || userRole !== "kurir") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  // Protect owner routes
  if (ownerRoutes) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/admin/login", nextUrl));
    }
    if (userType !== "user" || userRole !== "owner") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Match all routes except static files and API routes
    "/((?!api|_next/static|_next/image|favicon.ico|images).*)",
  ],
};
