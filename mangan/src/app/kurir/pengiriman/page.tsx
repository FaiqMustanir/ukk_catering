"use client";

import { useEffect, useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { getPengirimanByKurir, updatePengiriman } from "@/actions/pengiriman.action";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { ImageUpload } from "@/components/ui/image-upload";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { formatDate, formatCurrency } from "@/lib/utils";
import {
  Search,
  MapPin,
  Phone,
  User,
  Calendar,
  Navigation,
  CheckCircle,
  Truck,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

// Type sesuai PDM
type Pengiriman = {
  id: string;
  idPesan: string;
  idUser: string;
  tglKirim: Date | null;
  tglTiba: Date | null;
  statusKirim: string;
  buktiFoto: string | null;
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

// Status sesuai PDM enum
const statusOptions = [
  { value: "SedangDikirim", label: "Sedang Dikirim", color: "info" as const },
  { value: "TibaDitujuan", label: "Tiba Ditujuan", color: "success" as const },
];

export default function KurirPengirimanPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [pengiriman, setPengiriman] = useState<Pengiriman[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState(searchParams.get("status") || "");

  const [updateModal, setUpdateModal] = useState<{
    open: boolean;
    pengiriman: Pengiriman | null;
    newStatus: string;
    buktiFoto: string | null;
  }>({
    open: false,
    pengiriman: null,
    newStatus: "",
    buktiFoto: null,
  });

  const fetchData = async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      const result = await getPengirimanByKurir(session.user.id);
      if (result.success && result.data) {
        setPengiriman(result.data as Pengiriman[]);
      }
    } catch (error) {
      console.error("Error fetching pengiriman:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [session?.user?.id]);

  const openUpdateModal = (p: Pengiriman, status: string) => {
    setUpdateModal({
      open: true,
      pengiriman: p,
      newStatus: status,
      buktiFoto: p.buktiFoto,
    });
  };

  const handleUpdate = async () => {
    if (!updateModal.pengiriman) return;

    startTransition(async () => {
      const updateData: {
        statusKirim: "SedangDikirim" | "TibaDitujuan";
        tglTiba?: string;
        buktiFoto?: string;
      } = {
        statusKirim: updateModal.newStatus as "SedangDikirim" | "TibaDitujuan",
      };

      if (updateModal.newStatus === "TibaDitujuan") {
        updateData.tglTiba = new Date().toISOString();
        if (updateModal.buktiFoto) {
          updateData.buktiFoto = updateModal.buktiFoto;
        }
      }

      const result = await updatePengiriman(updateModal.pengiriman!.id, updateData);

      if (result.success) {
        showToast("Status pengiriman berhasil diupdate", "success");
        fetchData();
      } else {
        showToast(result.error || "Gagal mengupdate status", "error");
      }
      setUpdateModal({
        open: false,
        pengiriman: null,
        newStatus: "",
        buktiFoto: null,
      });
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

  const filteredPengiriman = pengiriman.filter((p) => {
    const matchSearch =
      (p.pemesanan?.pelanggan?.namaPelanggan || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.pemesanan?.pelanggan?.alamat1 || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.pemesanan?.noResi || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus ? p.statusKirim === filterStatus : true;
    return matchSearch && matchStatus;
  });

  // Sort: active first (SedangDikirim), then by date
  const sortedPengiriman = [...filteredPengiriman].sort((a, b) => {
    const aActive = a.statusKirim === "SedangDikirim";
    const bActive = b.statusKirim === "SedangDikirim";

    if (aActive && !bActive) return -1;
    if (!aActive && bActive) return 1;

    return (
      new Date(a.pemesanan?.tglPesan || 0).getTime() -
      new Date(b.pemesanan?.tglPesan || 0).getTime()
    );
  });

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Daftar Pengiriman</h1>
        <p className="text-gray-600">Kelola tugas pengiriman Anda</p>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
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
      <div className="mt-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Cari nama, alamat, atau no resi..."
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
      <div className="mt-6 space-y-4">
        {sortedPengiriman.map((p) => (
          <Card
            key={p.id}
            className={
              p.statusKirim === "SedangDikirim" ? "border-l-4 border-l-orange-500" : ""
            }
          >
            <CardContent className="p-4">
              <div className="flex flex-col gap-4">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-gray-500">
                      {p.pemesanan?.noResi || "-"}
                    </span>
                    {getStatusBadge(p.statusKirim)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    {p.pemesanan?.tglPesan ? formatDate(new Date(p.pemesanan.tglPesan)) : "-"}
                  </div>
                </div>

                {/* Customer Info */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-semibold">{p.pemesanan?.pelanggan?.namaPelanggan || "-"}</span>
                    </div>
                    {p.pemesanan?.pelanggan?.telepon && (
                      <a
                        href={`tel:${p.pemesanan.pelanggan.telepon}`}
                        className="mt-1 flex items-center gap-2 text-sm text-blue-600 hover:underline"
                      >
                        <Phone className="h-4 w-4" />
                        {p.pemesanan.pelanggan.telepon}
                      </a>
                    )}
                  </div>

                  <div>
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                      <p className="text-sm">{p.pemesanan?.pelanggan?.alamat1 || "Alamat belum diisi"}</p>
                    </div>
                    {p.pemesanan?.pelanggan?.alamat1 && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          p.pemesanan.pelanggan.alamat1
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                      >
                        <Navigation className="h-3 w-3" />
                        Buka di Google Maps
                      </a>
                    )}
                  </div>
                </div>

                {/* Total */}
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-sm text-gray-600">Total Bayar:</p>
                  <p className="text-lg font-bold text-orange-600">
                    {formatCurrency(p.pemesanan?.totalBayar || 0)}
                  </p>
                </div>

                {/* Timestamps */}
                {p.tglKirim && (
                  <div className="text-sm text-gray-600">
                    <Truck className="mr-1 inline h-4 w-4" />
                    Dikirim: {formatDate(new Date(p.tglKirim))}
                  </div>
                )}
                {p.tglTiba && (
                  <div className="text-sm text-green-600">
                    <CheckCircle className="mr-1 inline h-4 w-4" />
                    Tiba: {formatDate(new Date(p.tglTiba))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  {p.statusKirim === "SedangDikirim" && (
                    <Button
                      size="sm"
                      onClick={() => openUpdateModal(p, "TibaDitujuan")}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="mr-1 h-4 w-4" />
                      Tandai Sampai
                    </Button>
                  )}

                  {p.statusKirim === "TibaDitujuan" && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      Pengiriman selesai
                    </div>
                  )}
                </div>

                {/* Bukti Foto */}
                {p.buktiFoto && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-500">Bukti Pengiriman:</p>
                    <img
                      src={p.buktiFoto}
                      alt="Bukti Pengiriman"
                      className="mt-1 h-32 rounded-lg object-cover"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sortedPengiriman.length === 0 && (
        <div className="mt-8 text-center">
          <p className="text-gray-500">Tidak ada pengiriman ditemukan</p>
        </div>
      )}

      {/* Update Modal */}
      <Modal
        isOpen={updateModal.open}
        onClose={() =>
          setUpdateModal({
            open: false,
            pengiriman: null,
            newStatus: "",
            buktiFoto: null,
          })
        }
        title={`Update Status: ${
          statusOptions.find((s) => s.value === updateModal.newStatus)?.label || ""
        }`}
      >
        <div className="space-y-4">
          {updateModal.newStatus === "TibaDitujuan" && (
            <div>
              <Label>Bukti Pengiriman</Label>
              <p className="mb-2 text-sm text-gray-500">
                Upload foto bukti pengiriman (opsional)
              </p>
              <ImageUpload
                value={updateModal.buktiFoto}
                onChange={(value) =>
                  setUpdateModal({ ...updateModal, buktiFoto: value })
                }
              />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() =>
                setUpdateModal({
                  open: false,
                  pengiriman: null,
                  newStatus: "",
                  buktiFoto: null,
                })
              }
            >
              Batal
            </Button>
            <Button onClick={handleUpdate} isLoading={isPending}>
              Konfirmasi
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
