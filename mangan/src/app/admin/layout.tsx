"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  CreditCard,
  Truck,
  LogOut,
  ChefHat,
  Menu,
  X,
  User,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    // Allow access to login page
    if (pathname === "/admin/login") return;

    // Redirect if not logged in or not a staff member
    if (!session || session.user.type !== "user") {
      router.push("/admin/login");
      return;
    }

    // Role-based redirection
    if (session.user.role === "owner" && !pathname.startsWith("/owner")) {
      router.push("/owner/dashboard");
    } else if (session.user.role === "kurir" && !pathname.startsWith("/kurir")) {
      router.push("/kurir/dashboard");
    }
  }, [session, status, pathname, router]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  // Don't render layout for login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Show loading while checking session
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-600 border-t-transparent" />
      </div>
    );
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: "Administrator",
      owner: "Owner",
      kurir: "Kurir",
    };
    return labels[role] || role;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 flex h-16 items-center justify-between bg-gray-900 px-4 text-white lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <ChefHat className="h-6 w-6 text-orange-500" />
          <span className="font-bold">Mangan Admin</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-md p-2 hover:bg-gray-800"
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-gray-900 text-white transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-gray-800 px-6">
          <Link href="/" className="flex items-center gap-2">
            <ChefHat className="h-8 w-8 text-orange-500" />
            <span className="text-xl font-bold">Mangan</span>
          </Link>
        </div>

        <div className="p-4">
          <div className="rounded-lg bg-gray-800 p-4">
            <p className="text-sm text-gray-400">Login sebagai</p>
            <p className="font-semibold">{session?.user?.name}</p>
            <p className="text-xs text-orange-400">{getRoleLabel(session?.user?.role || "")}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-4 overflow-y-auto pt-4">
          <NavItem href="/admin/dashboard" icon={LayoutDashboard} pathname={pathname}>
            Dashboard
          </NavItem>
          <NavItem href="/admin/paket" icon={Package} pathname={pathname}>
            Menu & Paket
          </NavItem>
          <NavItem 
            href="/admin/pesanan" 
            icon={ShoppingBag} 
            pathname={pathname}
            activeMatch={(p: string) => p.includes("/admin/pengiriman") || p.includes("/admin/pembayaran")}
          >
            Transaksi
          </NavItem>
          <NavItem 
            href="/admin/pelanggan" 
            icon={Users} 
            pathname={pathname}
          >
            Data Pelanggan
          </NavItem>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-800 p-4 bg-gray-900">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-gray-300 hover:bg-gray-800 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-64">
        <div className="min-h-screen p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

function NavItem({ href, icon: Icon, children, pathname, activeMatch }: any) {
  const isActive = pathname === href || pathname.startsWith(href + "/") || (activeMatch && activeMatch(pathname));
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
        isActive
          ? "bg-orange-600 text-white"
          : "text-gray-300 hover:bg-gray-800 hover:text-white"
      )}
    >
      <Icon className="h-5 w-5" />
      {children}
    </Link>
  );
}
