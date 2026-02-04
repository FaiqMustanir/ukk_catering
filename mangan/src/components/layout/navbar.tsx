"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, ShoppingCart, User, ChevronDown } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  const navigation = [
    { name: "Beranda", href: "/" },
    { name: "Menu", href: "/menu" },
    { name: "Tentang Kami", href: "/#about" },
    { name: "Kontak", href: "/#contact" },
  ];

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-[#EAE5DF] bg-[#FDFBF7]/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold font-serif text-stone-800 tracking-tight">Mangan.</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-10">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-stone-600 transition-colors hover:text-stone-900"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex md:items-center md:gap-4">
            {session ? (
              <>
                {session.user.type === "pelanggan" && (
                  <Link href="/pelanggan/keranjang">
                    <Button variant="ghost" size="icon" className="text-stone-600 hover:text-stone-900 hover:bg-stone-100">
                      <ShoppingCart className="h-5 w-5" />
                    </Button>
                  </Link>
                )}
                <div className="relative group">
                  <Button variant="ghost" className="gap-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100">
                    {session.user.image ? (
                      <div className="relative h-7 w-7 rounded-full overflow-hidden border border-stone-200">
                        <Image src={session.user.image} alt="Profile" fill className="object-cover" />
                      </div>
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                    <span className="text-sm">{session.user.name?.split(" ")[0]}</span>
                    <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
                  </Button>
                  
                  {/* Dropdown Menu with Invisible Bridge */}
                  <div className="absolute right-0 top-full pt-2 hidden group-hover:block w-56">
                    <div className="rounded-xl bg-white py-2 shadow-lg border border-stone-100">
                        <div className="px-4 py-3 border-b border-stone-100">
                        <p className="text-sm font-medium text-stone-900">{session.user.name}</p>
                        <p className="text-xs text-stone-500 capitalize">{session.user.role}</p>
                        </div>
                        {session.user.type === "pelanggan" && (
                        <>
                            <Link
                            href="/pelanggan/dashboard"
                            className="block px-4 py-2 text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                            >
                            Dashboard
                            </Link>
                            <Link
                            href="/pelanggan/pesanan"
                            className="block px-4 py-2 text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                            >
                            Pesanan Saya
                            </Link>
                            <Link
                            href="/pelanggan/profile"
                            className="block px-4 py-2 text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                            >
                            Profil
                            </Link>
                        </>
                        )}
                        {session.user.type === "user" && (
                        <Link
                            href={`/${session.user.role}/dashboard`}
                            className="block px-4 py-2 text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                        >
                            Dashboard
                        </Link>
                        )}
                        <div className="border-t border-stone-100 mt-1 pt-1">
                        <button
                            onClick={handleLogout}
                            className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                            Keluar
                        </button>
                        </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login">
                  <Button variant="ghost" className="text-stone-600 hover:text-stone-900 hover:bg-stone-100">Masuk</Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-stone-800 hover:bg-stone-700 text-stone-50">Daftar</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-stone-600 hover:text-stone-900"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-stone-100 bg-white">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block rounded-md px-3 py-2 text-base font-medium text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {session ? (
              <>
                 <div className="mt-4 border-t border-stone-100 pt-4 px-3">
                    <p className="text-sm font-medium text-stone-900 mb-2">{session.user.name}</p>
                    {session.user.type === "pelanggan" && (
                        <>
                             <Link
                                href="/pelanggan/dashboard"
                                className="block rounded-md px-3 py-2 text-base font-medium text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                                onClick={() => setIsOpen(false)}
                                >
                                Dashboard
                                </Link>
                                <Link
                                href="/pelanggan/pesanan"
                                className="block rounded-md px-3 py-2 text-base font-medium text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                                onClick={() => setIsOpen(false)}
                                >
                                Pesanan Saya
                                </Link>
                        </>
                    )}
                     <button
                        onClick={async () => {
                            await handleLogout();
                            setIsOpen(false);
                        }}
                        className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50"
                        >
                        Keluar
                    </button>
                 </div>
              </>
            ) : (
              <div className="mt-4 flex flex-col gap-2 border-t border-stone-100 pt-4">
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-stone-600">Masuk</Button>
                </Link>
                <Link href="/register" onClick={() => setIsOpen(false)}>
                  <Button className="w-full justify-start bg-stone-800 text-stone-50">Daftar</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
