"use client";

import { useEffect, useState } from "react";
import {
  getAllJenisPembayaran,
} from "@/actions/pembayaran.action";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Types sesuai PDM
type JenisPembayaran = {
  id: string;
  metodePembayaran: string;
  detailJenisPembayarans: DetailJenisPembayaran[];
};

type DetailJenisPembayaran = {
  id: string;
  idJenisPembayaran: string;
  noRek: string | null;
  tempatBayar: string | null;
  logo: string | null;
};

export default function AdminPembayaranPage() {
  const [jenisPembayaran, setJenisPembayaran] = useState<JenisPembayaran[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getAllJenisPembayaran();
      if (result.success && result.data) {
        setJenisPembayaran(result.data as JenisPembayaran[]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Transaksi</h1>
        <div className="flex space-x-1 mt-4">
          <Link href="/admin/pesanan" className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md font-medium text-sm transition-colors">Pesanan</Link>
          <Link href="/admin/pengiriman" className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md font-medium text-sm transition-colors">Pengiriman</Link>
          <Link href="/admin/pembayaran" className="px-4 py-2 bg-orange-100 text-orange-800 rounded-md font-medium text-sm">Pembayaran</Link>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Metode Pembayaran</h2>
          <p className="text-sm text-gray-600">Daftar metode pembayaran yang tersedia</p>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {jenisPembayaran.map((jenis) => (
          <Card key={jenis.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="h-6 w-6 text-orange-600" />
                <div>
                  <CardTitle>{jenis.metodePembayaran}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {jenis.detailJenisPembayarans.length > 0 ? (
                <div className="space-y-4">
                  {jenis.detailJenisPembayarans.map((detail) => (
                    <div
                      key={detail.id}
                      className="flex items-center justify-between rounded-lg border bg-gray-50 p-4"
                    >
                      <div className="flex items-center gap-4">
                        {detail.logo ? (
                          <div className="relative h-10 w-16 overflow-hidden rounded bg-white">
                             <Image
                              src={detail.logo}
                              alt={detail.tempatBayar || "Logo Bank"}
                              fill
                              className="object-contain p-1"
                            />
                          </div>
                        ) : (
                          <div className="flex h-10 w-16 items-center justify-center rounded bg-gray-200">
                            <CreditCard className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">
                            {detail.tempatBayar}
                          </p>
                          <p className="text-sm text-gray-600">
                            No. Rek: {detail.noRek || "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-gray-500 py-4">
                  Belum ada detail pembayaran
                </p>
              )}
            </CardContent>
          </Card>
        ))}

        {jenisPembayaran.length === 0 && (
          <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed border-gray-200">
            <p className="text-gray-500">Tidak ada metode pembayaran</p>
          </div>
        )}
      </div>
    </div>
  );
}
