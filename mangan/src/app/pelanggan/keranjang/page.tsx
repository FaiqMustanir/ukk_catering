"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ShoppingCart, Trash2, ChefHat, Minus, Plus, Copy, Check } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { createPemesanan } from "@/actions/pemesanan.action";
import { getPelangganById } from "@/actions/auth.action";

// Static payment methods with details
const PAYMENT_METHODS = [
  {
    id: "bank_bca",
    category: "Transfer Bank",
    name: "Bank BCA",
    accountNumber: "1234567890",
    accountName: "PT Mangan Catering Indonesia",
  },
  {
    id: "bank_mandiri",
    category: "Transfer Bank",
    name: "Bank Mandiri",
    accountNumber: "0987654321",
    accountName: "PT Mangan Catering Indonesia",
  },
  {
    id: "bank_bni",
    category: "Transfer Bank",
    name: "Bank BNI",
    accountNumber: "1122334455",
    accountName: "PT Mangan Catering Indonesia",
  },
  {
    id: "ewallet_gopay",
    category: "E-Wallet",
    name: "GoPay",
    accountNumber: "081234567890",
    accountName: "Mangan Catering",
  },
  {
    id: "ewallet_ovo",
    category: "E-Wallet",
    name: "OVO",
    accountNumber: "081234567890",
    accountName: "Mangan Catering",
  },
  {
    id: "ewallet_dana",
    category: "E-Wallet",
    name: "DANA",
    accountNumber: "081234567890",
    accountName: "Mangan Catering",
  },
  {
    id: "cod",
    category: "COD",
    name: "Bayar di Tempat (COD)",
    accountNumber: "-",
    accountName: "Bayar tunai saat barang diterima",
  },
];

interface CartItem {
  id: string;
  namaPaket: string;
  hargaPaket: number;
  jumlahPax: number;
  foto1?: string;
  quantity: number;
}

export default function KeranjangPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedPayment, setSelectedPayment] = useState("");
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const [pelangganAlamat, setPelangganAlamat] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const selectedPaymentDetails = PAYMENT_METHODS.find(p => p.id === selectedPayment);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(id);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem("mangan_cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    // Load pelanggan alamat
    if (session?.user?.id) {
      loadPelangganAlamat();
    }
  }, [session]);

  const loadPelangganAlamat = async () => {
    if (!session?.user?.id) return;
    const result = await getPelangganById(session.user.id);
    if (result.success && result.data) {
      setPelangganAlamat(result.data.alamat1 || "");
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) => {
      const updated = prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      });
      localStorage.setItem("mangan_cart", JSON.stringify(updated));
      return updated;
    });
  };

  const removeItem = (id: string) => {
    setCart((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      localStorage.setItem("mangan_cart", JSON.stringify(updated));
      return updated;
    });
  };

  const total = cart.reduce((sum, item) => sum + item.hargaPaket * item.quantity, 0);

  const handleCheckout = async () => {
    if (!session?.user?.id) {
      router.push("/login");
      return;
    }

    if (!selectedPayment) {
      setMessage({ type: "error", text: "Pilih metode pembayaran" });
      return;
    }

    if (!pelangganAlamat.trim()) {
      setMessage({ type: "error", text: "Alamat belum diisi. Silakan lengkapi profil Anda terlebih dahulu." });
      return;
    }

    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const items = cart.flatMap((item) =>
        Array(item.quantity).fill({
          idPaket: item.id,
          subtotal: item.hargaPaket,
        })
      );

      // Use the static payment method name
      const paymentMethodName = selectedPaymentDetails 
        ? `${selectedPaymentDetails.category} - ${selectedPaymentDetails.name}`
        : selectedPayment;

      const result = await createPemesanan(session.user.id, {
        metodePembayaran: paymentMethodName,
        items,
      });

      if (result.success) {
        // Clear cart
        localStorage.removeItem("mangan_cart");
        setCart([]);
        
        setMessage({ 
          type: "success", 
          text: `Pesanan berhasil dibuat! No. Resi: ${result.noResi}` 
        });

        setTimeout(() => {
          router.push("/pelanggan/pesanan");
        }, 2000);
      } else {
        setMessage({ type: "error", text: result.error || "Gagal membuat pesanan" });
      }
    } catch {
      setMessage({ type: "error", text: "Terjadi kesalahan" });
    } finally {
      setIsLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Keranjang</h1>
        <p className="text-gray-600">Item yang akan Anda pesan</p>

        <Card className="mt-6">
          <CardContent className="py-12 text-center">
            <ShoppingCart className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4 text-gray-600">Keranjang kosong</p>
            <Link href="/menu" className="mt-4 inline-block">
              <Button>Lihat Menu</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Keranjang</h1>
      <p className="text-gray-600">Review dan checkout pesanan Anda</p>

      {message.text && (
        <div
          className={`mt-4 rounded-md p-4 ${
            message.type === "success" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex gap-4 p-4">
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-orange-100">
                  {item.foto1 ? (
                    <Image
                      src={item.foto1}
                      alt={item.namaPaket}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ChefHat className="h-8 w-8 text-orange-300" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold">{item.namaPaket}</h3>
                  <p className="text-sm text-gray-600">{item.jumlahPax} pax</p>
                  <p className="mt-1 font-medium text-orange-600">
                    {formatCurrency(item.hargaPaket)}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="rounded-full border p-1 hover:bg-gray-100"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="rounded-full border p-1 hover:bg-gray-100"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="font-bold">
                    {formatCurrency(item.hargaPaket * item.quantity)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Checkout */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Pesanan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatCurrency(total)}</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-orange-600">{formatCurrency(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alamat Pengiriman</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">
                {pelangganAlamat || "Alamat belum diisi. Silakan lengkapi di halaman Profil."}
              </p>
              {!pelangganAlamat && (
                <Link href="/pelanggan/profile" className="text-sm text-orange-600 hover:underline mt-2 inline-block">
                  Lengkapi Profil
                </Link>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Metode Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={selectedPayment}
                onChange={(e) => setSelectedPayment(e.target.value)}
                options={PAYMENT_METHODS.map((m) => ({
                  value: m.id,
                  label: `${m.category} - ${m.name}`,
                }))}
                placeholder="Pilih metode pembayaran"
              />

              {/* Payment Details */}
              {selectedPaymentDetails && selectedPaymentDetails.category !== "COD" && (
                <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                  <p className="text-sm font-medium text-orange-800 mb-2">
                    Detail Pembayaran:
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">{selectedPaymentDetails.category === "Transfer Bank" ? "Bank" : "Platform"}:</span>
                      <span className="font-medium">{selectedPaymentDetails.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">{selectedPaymentDetails.category === "Transfer Bank" ? "No. Rekening" : "No. HP"}:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium">{selectedPaymentDetails.accountNumber}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(selectedPaymentDetails.accountNumber, selectedPaymentDetails.id)}
                          className="text-orange-600 hover:text-orange-700"
                        >
                          {copiedAccount === selectedPaymentDetails.id ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Atas Nama:</span>
                      <span className="font-medium">{selectedPaymentDetails.accountName}</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedPaymentDetails && selectedPaymentDetails.category === "COD" && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <p className="text-sm text-blue-800">
                    💵 Pembayaran dilakukan secara tunai saat pesanan diterima.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Button 
            className="w-full" 
            onClick={handleCheckout}
            isLoading={isLoading}
            disabled={!selectedPayment || !pelangganAlamat.trim()}
          >
            Checkout
          </Button>
        </div>
      </div>
    </div>
  );
}
