"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Check } from "lucide-react";
import { useState } from "react";

interface AddToCartButtonProps {
  paket: {
    id: string;
    namaPaket: string;
    hargaPaket: number;
    jumlahPax: number;
    foto1?: string | null;
  };
}

export function AddToCartButton({ paket }: AddToCartButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    if (!session) {
      router.push("/login");
      return;
    }

    // Get existing cart from localStorage
    const existingCart = localStorage.getItem("mangan_cart");
    const cart = existingCart ? JSON.parse(existingCart) : [];

    // Check if item already exists
    const existingIndex = cart.findIndex((item: { id: string }) => item.id === paket.id);

    if (existingIndex >= 0) {
      // Increase quantity
      cart[existingIndex].quantity += 1;
    } else {
      // Add new item
      cart.push({
        id: paket.id,
        namaPaket: paket.namaPaket,
        hargaPaket: paket.hargaPaket,
        jumlahPax: paket.jumlahPax,
        foto1: paket.foto1 || null,
        quantity: 1,
      });
    }

    // Save to localStorage
    localStorage.setItem("mangan_cart", JSON.stringify(cart));

    // Show feedback
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!session) {
      router.push("/login");
      return;
    }

    // Add to cart first
    handleAddToCart();
    
    // Then go to cart
    router.push("/pelanggan/keranjang");
  };

  return (
    <div className="flex gap-4">
      <Button
        variant="outline"
        className="flex-1 gap-2"
        onClick={handleAddToCart}
        disabled={added}
      >
        {added ? (
          <>
            <Check className="h-4 w-4" />
            Ditambahkan!
          </>
        ) : (
          <>
            <ShoppingCart className="h-4 w-4" />
            Tambah Keranjang
          </>
        )}
      </Button>
      <Button className="flex-1" onClick={handleBuyNow}>
        Pesan Sekarang
      </Button>
    </div>
  );
}
