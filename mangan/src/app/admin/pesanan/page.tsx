"use client";

import { useEffect, useState, useTransition } from "react";
import { getAllPemesanan, updatePemesananStatus } from "@/actions/pemesanan.action";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Eye, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import Link from "next/link";

// Types sesuai PDM
type Pemesanan = {
  id: string;
  noResi: string;
  tglPesan: Date;
  statusPesan: string;
  totalBayar: number;
  pelanggan: {
    namaPelanggan: string;
    email: string;
    telepon: string | null;
    alamat1: string | null;
  };
  jenisPembayaran: {
    id: string;
    metodePembayaran: string;
  };
  detailPemesanans: {
    id: string;
    subtotal: number;
    paket: {
      id: string;
      namaPaket: string;
      hargaPaket: number;
    };
  }[];
  pengiriman: {
    id: string;
    statusKirim: string;
    user: {
      name: string;
    } | null;
  } | null;
};

// Status sesuai PDM enum
const statusOptions = [
  { value: "MenungguKonfirmasi", label: "Menunggu Konfirmasi", color: "warning" as const },
  { value: "SedangDiproses", label: "Sedang Diproses", color: "info" as const },
  { value: "MenungguKurir", label: "Menunggu Kurir", color: "info" as const },
  { value: "Selesai", label: "Selesai", color: "success" as const },
  { value: "Dibatalkan", label: "Dibatalkan", color: "destructive" as const },
];

export default function AdminPesananPage() {
  const [pesanan, setPesanan] = useState<Pemesanan[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailModal, setDetailModal] = useState<{ open: boolean; pesanan: Pemesanan | null }>({
    open: false,
    pesanan: null,
  });
  const [statusModal, setStatusModal] = useState<{ open: boolean; pesanan: Pemesanan | null; newStatus: string }>({
    open: false,
    pesanan: null,
    newStatus: "",
  });
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  // Filters
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const fetchPesanan = async () => {
    setLoading(true);
    try {
      const result = await getAllPemesanan();
      if (result.success && result.data) {
        setPesanan(result.data as Pemesanan[]);
      }
    } catch (error) {
      console.error("Error fetching pesanan:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPesanan();
  }, []);

  const handleUpdateStatus = async () => {
    if (!statusModal.pesanan || !statusModal.newStatus) return;

    startTransition(async () => {
      const result = await updatePemesananStatus(
        statusModal.pesanan!.id,
        { statusPesan: statusModal.newStatus as "MenungguKonfirmasi" | "SedangDiproses" | "MenungguKurir" | "Selesai" | "Dibatalkan" }
      );
      if (result.success) {
        showToast("Status pesanan berhasil diupdate", "success");
        fetchPesanan();
      } else {
        showToast(result.error || "Gagal mengupdate status", "error");
      }
      setStatusModal({ open: false, pesanan: null, newStatus: "" });
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

  // Filter pesanan
  const filteredPesanan = pesanan.filter((p) => {
    const matchSearch =
      (p.pelanggan?.namaPelanggan || "").toLowerCase().includes(search.toLowerCase()) ||
      p.noResi.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus ? p.statusPesan === filterStatus : true;
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
          <Link href="/admin/pesanan" className="px-4 py-2 bg-orange-100 text-orange-800 rounded-md font-medium text-sm">Pesanan</Link>
          <Link href="/admin/pengiriman" className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md font-medium text-sm transition-colors">Pengiriman</Link>
          <Link href="/admin/pembayaran" className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md font-medium text-sm transition-colors">Pembayaran</Link>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900">Daftar Pesanan</h2>
        <p className="text-sm text-gray-600">Kelola semua pesanan masuk</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
                {pesanan.filter((p) => p.statusPesan === status.value).length}
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

      {/* Pesanan List */}
      <div className="space-y-4">
        {filteredPesanan.map((p) => (
          <Card key={p.id}>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm text-gray-500">{p.noResi}</span>
                    {getStatusBadge(p.statusPesan)}
                  </div>
                  <h3 className="mt-1 font-semibold">{p.pelanggan?.namaPelanggan || "-"}</h3>
                  <p className="text-sm text-gray-600">{p.pelanggan?.telepon || "-"}</p>
                </div>

                <div className="flex-1">
                  <p className="text-sm text-gray-600">Tanggal Pesan</p>
                  <p className="font-medium">{formatDate(new Date(p.tglPesan))}</p>
                  <p className="text-sm text-gray-500">Metode: {p.jenisPembayaran?.metodePembayaran || "-"}</p>
                </div>

                <div className="flex-1">
                  <p className="text-sm text-gray-600">Items ({p.detailPemesanans?.length || 0})</p>
                  <div className="space-y-1">
                    {(p.detailPemesanans || []).slice(0, 2).map((detail) => (
                      <p key={detail.id} className="text-sm">
                        {detail.paket?.namaPaket || "-"}
                      </p>
                    ))}
                    {(p.detailPemesanans?.length || 0) > 2 && (
                      <p className="text-xs text-gray-500">
                        +{p.detailPemesanans.length - 2} item lainnya
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-lg font-bold text-orange-600">
                    {formatCurrency(p.totalBayar)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDetailModal({ open: true, pesanan: p })}
                  >
                    <Eye className="mr-1 h-4 w-4" /> Detail
                  </Button>
                  <Select
                    value={p.statusPesan}
                    onChange={(e) => {
                      setStatusModal({
                        open: true,
                        pesanan: p,
                        newStatus: e.target.value,
                      });
                    }}
                    className="w-40"
                  >
                    {statusOptions.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPesanan.length === 0 && (
        <div className="mt-8 text-center">
          <p className="text-gray-500">Tidak ada pesanan ditemukan</p>
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={detailModal.open}
        onClose={() => setDetailModal({ open: false, pesanan: null })}
        title="Detail Pesanan"
      >
        {detailModal.pesanan && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm text-gray-500">
                {detailModal.pesanan.noResi}
              </span>
              {getStatusBadge(detailModal.pesanan.statusPesan)}
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="font-semibold">Pelanggan</h4>
              <p>{detailModal.pesanan.pelanggan?.namaPelanggan || "-"}</p>
              <p className="text-sm text-gray-600">{detailModal.pesanan.pelanggan?.telepon || "-"}</p>
              <p className="text-sm text-gray-600">{detailModal.pesanan.pelanggan?.email || "-"}</p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="font-semibold">Alamat Pengiriman</h4>
              <p className="text-sm">{detailModal.pesanan.pelanggan?.alamat1 || "Belum diisi"}</p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="font-semibold">Metode Pembayaran</h4>
              <p className="text-sm">{detailModal.pesanan.jenisPembayaran?.metodePembayaran || "-"}</p>
            </div>

            <div>
              <h4 className="mb-2 font-semibold">Items</h4>
              <div className="space-y-2">
                {(detailModal.pesanan.detailPemesanans || []).map((detail) => (
                  <div key={detail.id} className="flex justify-between text-sm">
                    <span>{detail.paket?.namaPaket || "-"}</span>
                    <span>{formatCurrency(detail.subtotal)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 border-t pt-2">
                <div className="flex justify-between font-bold">
                  <span>Total Bayar</span>
                  <span className="text-orange-600">
                    {formatCurrency(detailModal.pesanan.totalBayar)}
                  </span>
                </div>
              </div>
            </div>

            {detailModal.pesanan.pengiriman && (
              <div className="rounded-lg bg-blue-50 p-4">
                <h4 className="font-semibold">Pengiriman</h4>
                <p className="text-sm">
                  <strong>Status:</strong> {detailModal.pesanan.pengiriman.statusKirim === "SedangDikirim" ? "Sedang Dikirim" : "Tiba Ditujuan"}
                </p>
                {detailModal.pesanan.pengiriman.user && (
                  <p className="text-sm">
                    <strong>Kurir:</strong> {detailModal.pesanan.pengiriman.user.name}
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setDetailModal({ open: false, pesanan: null })}
              >
                Tutup
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Status Update Confirmation Modal */}
      <Modal
        isOpen={statusModal.open}
        onClose={() => setStatusModal({ open: false, pesanan: null, newStatus: "" })}
        title="Konfirmasi Update Status"
      >
        <p className="text-gray-600">
          Apakah Anda yakin ingin mengubah status pesanan menjadi{" "}
          <strong>
            {statusOptions.find((s) => s.value === statusModal.newStatus)?.label}
          </strong>
          ?
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setStatusModal({ open: false, pesanan: null, newStatus: "" })}
          >
            Batal
          </Button>
          <Button onClick={handleUpdateStatus} isLoading={isPending}>
            Konfirmasi
          </Button>
        </div>
      </Modal>
    </div>
  );
}
