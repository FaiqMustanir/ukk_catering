"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  User,
  ShoppingCart,
  LogOut,
  Utensils,
  Menu,
  X,
  Home,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const menuItems = [
  { name: "Dashboard", href: "/pelanggan/dashboard", icon: LayoutDashboard },
  { name: "Pesanan Saya", href: "/pelanggan/pesanan", icon: ShoppingBag },
  { name: "Keranjang", href: "/pelanggan/keranjang", icon: ShoppingCart },
  { name: "Profil", href: "/pelanggan/profile", icon: User },
];

export default function PelangganLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 flex h-16 items-center justify-between bg-white px-4 shadow-sm lg:hidden">
        <Link href="/" className="flex items-center gap-2">
            <div className="bg-orange-600 p-1.5 rounded-lg">
                <Utensils className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold font-serif text-stone-800">Mangan.</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-md p-2 hover:bg-gray-100"
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
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-orange-600 p-1.5 rounded-lg">
                <Utensils className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold font-serif text-stone-800">Mangan.</span>
          </Link>
        </div>

        <div className="p-4">
          <div className="rounded-lg bg-orange-50 p-4">
            <p className="text-sm text-gray-600">Selamat datang,</p>
            <p className="font-semibold text-gray-900">{session?.user?.name || "Pelanggan"}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-4">
          <Link
            href="/"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 mb-2"
          >
            <Home className="h-5 w-5" />
            Kembali ke Beranda
          </Link>
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-orange-100 text-orange-700"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t p-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-red-600 hover:bg-red-50 hover:text-red-700"
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
