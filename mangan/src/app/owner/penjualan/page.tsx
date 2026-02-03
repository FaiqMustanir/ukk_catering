"use client";

import { useEffect, useState } from "react";
import { getAllPemesanan } from "@/actions/pemesanan.action";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Search, TrendingUp, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type Pemesanan = {
  id: string;
  tanggalPesan: Date;
  tanggalAcara: Date;
  totalHarga: number;
  status: string;
  pelanggan: {
    nama: string;
  };
  detailPemesanan: {
    id: string;
    jumlah: number;
    paket: {
      namaPaket: string;
    };
  }[];
};

const statusOptions = [
  { value: "menunggu", label: "Menunggu", color: "warning" as const },
  { value: "diproses", label: "Diproses", color: "info" as const },
  { value: "siap", label: "Siap Kirim", color: "info" as const },
  { value: "dikirim", label: "Dikirim", color: "info" as const },
  { value: "selesai", label: "Selesai", color: "success" as const },
  { value: "dibatalkan", label: "Dibatalkan", color: "destructive" as const },
];

export default function OwnerPenjualanPage() {
  const [pesanan, setPesanan] = useState<Pemesanan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterBulan, setFilterBulan] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await getAllPemesanan();
        if (result.success && result.data) {
          setPesanan(result.data as Pemesanan[]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig = statusOptions.find((s) => s.value === status);
    return (
      <Badge variant={statusConfig?.color || "secondary"}>
        {statusConfig?.label || status}
      </Badge>
    );
  };

  // Generate month options
  const monthOptions = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthOptions.push({
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: date.toLocaleDateString("id-ID", { month: "long", year: "numeric" }),
    });
  }

  // Filter pesanan
  const filteredPesanan = pesanan.filter((p) => {
    const matchSearch = p.pelanggan.nama.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus ? p.status === filterStatus : true;

    let matchBulan = true;
    if (filterBulan) {
      const pesanDate = new Date(p.tanggalPesan);
      const pesanMonth = `${pesanDate.getFullYear()}-${String(pesanDate.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      matchBulan = pesanMonth === filterBulan;
    }

    return matchSearch && matchStatus && matchBulan;
  });

  // Calculate totals
  const totalPendapatan = filteredPesanan
    .filter((p) => p.status === "selesai")
    .reduce((sum, p) => sum + p.totalHarga, 0);
  const totalPesanan = filteredPesanan.length;
  const pesananSelesai = filteredPesanan.filter((p) => p.status === "selesai").length;

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <TrendingUp className="h-6 w-6 text-indigo-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan Penjualan</h1>
          <p className="text-gray-600">Lihat riwayat penjualan</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Total Pesanan</p>
            <p className="text-2xl font-bold">{totalPesanan}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Pesanan Selesai</p>
            <p className="text-2xl font-bold text-green-600">{pesananSelesai}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Total Pendapatan</p>
            <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalPendapatan)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Cari nama pelanggan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full sm:w-40"
        >
          <option value="">Semua Status</option>
          {statusOptions.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </Select>
        <Select
          value={filterBulan}
          onChange={(e) => setFilterBulan(e.target.value)}
          className="w-full sm:w-48"
        >
          <option value="">Semua Bulan</option>
          {monthOptions.map((month) => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </Select>
      </div>

      {/* Table */}
      <Card className="mt-6">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Tanggal
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Pelanggan
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Items</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredPesanan.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm text-gray-500">
                      #{p.id.slice(-8)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {formatDate(new Date(p.tanggalPesan))}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{p.pelanggan.nama}</td>
                    <td className="px-4 py-3 text-sm">
                      {p.detailPemesanan.map((d) => `${d.paket.namaPaket} x${d.jumlah}`).join(", ")}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(p.status)}</td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatCurrency(p.totalHarga)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {filteredPesanan.length === 0 && (
        <div className="mt-8 text-center">
          <p className="text-gray-500">Tidak ada data penjualan</p>
        </div>
      )}
    </div>
  );
}
