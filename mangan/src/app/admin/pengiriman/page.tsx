"use client";

import { useEffect, useState, useTransition } from "react";
import { getAllPengiriman, updatePengiriman } from "@/actions/pengiriman.action";
import { getKurirUsers } from "@/actions/user.action";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Search, Truck, MapPin, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import Link from "next/link";

// Types sesuai PDM
type Pengiriman = {
  id: string;
  idPesan: string;
  idUser: string;
  tglKirim: Date | null;
  tglTiba: Date | null;
  statusKirim: string;
  buktiFoto: string | null;
  user: {
    name: string;
  } | null;
  pemesanan: {
    id: string;
    noResi: string;
    tglPesan: Date;
    statusPesan: string;
    totalBayar: number;
    pelanggan: {
      namaPelanggan: string;
      telepon: string | null;
      alamat1: string | null;
    };
  };
};

type Kurir = {
  id: string;
  name: string;
  email: string;
};

// Status sesuai PDM enum
const statusOptions = [
  { value: "SedangDikirim", label: "Sedang Dikirim", color: "info" as const },
  { value: "TibaDitujuan", label: "Tiba Ditujuan", color: "success" as const },
];

export default function AdminPengirimanPage() {
  const [pengiriman, setPengiriman] = useState<Pengiriman[]>([]);
  const [kurirList, setKurirList] = useState<Kurir[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  // Filters
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pengirimanResult, kurirResult] = await Promise.all([
        getAllPengiriman(),
        getKurirUsers(),
      ]);

      if (pengirimanResult.success && pengirimanResult.data) {
        setPengiriman(pengirimanResult.data as Pengiriman[]);
      }

      if (kurirResult.success && kurirResult.data) {
        setKurirList(kurirResult.data as Kurir[]);
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

  const handleUpdateStatus = async (id: string, status: string) => {
    startTransition(async () => {
      const updateData: { statusKirim: "SedangDikirim" | "TibaDitujuan"; tglTiba?: string } = {
        statusKirim: status as "SedangDikirim" | "TibaDitujuan",
      };

      // If marking as arrived, set tglTiba
      if (status === "TibaDitujuan") {
        updateData.tglTiba = new Date().toISOString();
      }

      const result = await updatePengiriman(id, updateData);

      if (result.success) {
        showToast("Status pengiriman diupdate", "success");
        fetchData();
      } else {
        showToast(result.error || "Gagal mengupdate status", "error");
      }
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = statusOptions.find((s) => s.value === status);
    return (
      <Badge variant={statusConfig?.color || "secondary"}>
        {statusConfig?.label || status}
      </Badge>
    );
  };

  // Filter pengiriman
  const filteredPengiriman = pengiriman.filter((p) => {
    const matchSearch =
      (p.pemesanan?.pelanggan?.namaPelanggan || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.pemesanan?.noResi || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus ? p.statusKirim === filterStatus : true;
    return matchSearch && matchStatus;
  });

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
          <Link href="/admin/pengiriman" className="px-4 py-2 bg-orange-100 text-orange-800 rounded-md font-medium text-sm">Pengiriman</Link>
          <Link href="/admin/pembayaran" className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md font-medium text-sm transition-colors">Pembayaran</Link>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900">Pengiriman</h2>
        <p className="text-sm text-gray-600">Kelola pengiriman pesanan</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        {statusOptions.map((status) => (
          <Card
            key={status.value}
            className={`cursor-pointer transition-all hover:shadow-md ${
              filterStatus === status.value ? "ring-2 ring-orange-500" : ""
            }`}
            onClick={() => setFilterStatus(filterStatus === status.value ? "" : status.value)}
          >
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">{status.label}</p>
              <p className="text-2xl font-bold">
                {pengiriman.filter((p) => p.statusKirim === status.value).length}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Cari nama pelanggan atau no resi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full sm:w-48"
        >
          <option value="">Semua Status</option>
          {statusOptions.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </Select>
      </div>

      {/* Pengiriman List */}
      <div className="space-y-4">
        {filteredPengiriman.map((p) => (
          <Card key={p.id}>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm text-gray-500">{p.pemesanan?.noResi || "-"}</span>
                    {getStatusBadge(p.statusKirim)}
                  </div>
                  <h3 className="mt-1 font-semibold">{p.pemesanan?.pelanggan?.namaPelanggan || "-"}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Phone className="h-3 w-3" />
                    {p.pemesanan?.pelanggan?.telepon || "-"}
                  </div>
                </div>

                <div className="flex-1">
                  <p className="text-sm text-gray-600">Alamat</p>
                  <div className="flex items-start gap-1">
                    <MapPin className="mt-0.5 h-3 w-3 flex-shrink-0 text-gray-400" />
                    <p className="text-sm">{p.pemesanan?.pelanggan?.alamat1 || "Belum diisi"}</p>
                  </div>
                </div>

                <div className="flex-1">
                  <p className="text-sm text-gray-600">Kurir</p>
                  <div className="flex items-center gap-1">
                    <Truck className="h-4 w-4 text-orange-500" />
                    <p className="font-medium">{p.user?.name || "Belum ditugaskan"}</p>
                  </div>
                  {p.tglKirim && (
                    <p className="text-xs text-gray-500">Berangkat: {formatDate(new Date(p.tglKirim))}</p>
                  )}
                  {p.tglTiba && (
                    <p className="text-xs text-green-600">Tiba: {formatDate(new Date(p.tglTiba))}</p>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-lg font-bold text-orange-600">
                    {formatCurrency(p.pemesanan?.totalBayar || 0)}
                  </p>
                </div>

                <div className="flex gap-2">
                  {p.statusKirim === "SedangDikirim" && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(p.id, "TibaDitujuan")}
                      isLoading={isPending}
                    >
                      Tandai Sampai
                    </Button>
                  )}
                  {p.statusKirim === "TibaDitujuan" && (
                    <Badge variant="success" className="px-3 py-1">
                      ✓ Selesai
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPengiriman.length === 0 && (
        <div className="mt-8 text-center">
          <p className="text-gray-500">Tidak ada pengiriman ditemukan</p>
        </div>
      )}
    </div>
  );
}
