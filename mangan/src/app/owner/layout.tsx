"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  Package,
  DollarSign,
  LogOut,
  Utensils,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const menuItems = [
  { name: "Dashboard", href: "/owner/dashboard", icon: LayoutDashboard },
  { name: "Laporan Penjualan", href: "/owner/penjualan", icon: TrendingUp },
];

export default function OwnerLayout({
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

    // Redirect if not logged in or not an owner
    if (!session || session.user.type !== "user" || session.user.role !== "owner") {
      router.push("/admin/login");
    }
  }, [session, status, router]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  // Show loading while checking session
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 flex h-16 items-center justify-between bg-gray-900 px-4 text-white lg:hidden">
        <Link href="/" className="flex items-center gap-2">
            <div className="bg-orange-600 p-1.5 rounded-lg">
                <Utensils className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold font-serif text-white">Mangan.</span>
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
            <div className="bg-orange-600 p-1.5 rounded-lg">
                <Utensils className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold font-serif text-white">Mangan.</span>
          </Link>
        </div>

        <div className="p-4">
          <div className="rounded-lg bg-gray-800 p-4">
            <p className="text-sm text-gray-400">Login sebagai</p>
            <p className="font-semibold">{session?.user?.name}</p>
            <p className="text-xs text-orange-400">Owner</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-4 overflow-y-auto pt-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-orange-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
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
