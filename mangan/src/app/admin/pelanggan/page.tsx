"use client";

import { useEffect, useState } from "react";
import { getAllPelanggan } from "@/actions/user.action";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Search, User, Mail, Phone, MapPin, Calendar, CreditCard, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import Image from "next/image";

type Pelanggan = {
  id: string;
  namaPelanggan: string;
  email: string;
  telepon: string | null;
  tglLahir: Date | null;
  alamat1: string | null;
  alamat2: string | null;
  alamat3: string | null;
  kartuId: string | null;
  foto: string | null;
  createdAt: Date;
};

export default function AdminPelangganPage() {
  const [pelanggan, setPelanggan] = useState<Pelanggan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [detailModal, setDetailModal] = useState<{ open: boolean; data: Pelanggan | null }>({
    open: false,
    data: null,
  });
  const [ktpModal, setKtpModal] = useState<{ open: boolean; imageUrl: string }>({
    open: false,
    imageUrl: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getAllPelanggan();
      if (result.success && result.data) {
        setPelanggan(result.data as Pelanggan[]);
      }
    } catch (error) {
      console.error("Error fetching pelanggan:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredPelanggan = pelanggan.filter(
    (p) =>
      p.namaPelanggan.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      (p.telepon || "").includes(search)
  );

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
        <h1 className="text-2xl font-bold text-gray-900">Data Pelanggan</h1>
        <p className="text-sm text-gray-600 mt-1">Kelola data customer yang terdaftar</p>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-1">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Total Pelanggan</p>
            <p className="text-2xl font-bold">{pelanggan.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mt-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Cari nama, email, atau no hp..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Pelanggan List */}
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredPelanggan.map((p) => (
          <Card key={p.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
                  <div className="flex h-full w-full items-center justify-center">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{p.namaPelanggan}</h3>
                  </div>

                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      {p.email}
                    </div>
                    {p.telepon && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      {p.telepon}
                    </div>
                    )}
                    {p.alamat1 && (
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                        <span className="line-clamp-2">{p.alamat1}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(new Date(p.createdAt))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setDetailModal({ open: true, data: p })}
                    >
                      <Eye className="mr-2 h-4 w-4" /> Lihat Detail
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPelanggan.length === 0 && (
        <div className="mt-8 text-center">
          <p className="text-gray-500">Tidak ada pelanggan ditemukan</p>
        </div>
      )}

      {/* Detail Pelanggan Modal */}
      <Modal
        isOpen={detailModal.open}
        onClose={() => setDetailModal({ open: false, data: null })}
        title="Detail Pelanggan"
        className="max-w-xl"
      >
        {detailModal.data && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 border-b pb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                <User className="h-8 w-8 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{detailModal.data.namaPelanggan}</h3>
                <p className="text-sm text-gray-500">Bergabung sejak {formatDate(new Date(detailModal.data.createdAt))}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Email</p>
                <div className="flex items-center gap-2 font-medium">
                  <Mail className="h-4 w-4 text-gray-400" />
                  {detailModal.data.email}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Telepon</p>
                <div className="flex items-center gap-2 font-medium">
                  <Phone className="h-4 w-4 text-gray-400" />
                  {detailModal.data.telepon || "-"}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Tanggal Lahir</p>
                <div className="flex items-center gap-2 font-medium">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  {detailModal.data.tglLahir ? formatDate(new Date(detailModal.data.tglLahir)) : "-"}
                </div>
              </div>
            </div>

            <div className="space-y-3 border-t pt-4">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Alamat Tersimpan
              </h4>
              <div className="space-y-2 text-sm">
                <div className="rounded-lg bg-gray-50 p-3">
                  <span className="font-medium text-gray-700 block mb-1">Alamat Utama</span>
                  {detailModal.data.alamat1 || <span className="text-gray-400 italic">Belum diisi</span>}
                </div>
                {detailModal.data.alamat2 && (
                  <div className="rounded-lg bg-gray-50 p-3">
                    <span className="font-medium text-gray-700 block mb-1">Alamat 2</span>
                    {detailModal.data.alamat2}
                  </div>
                )}
                {detailModal.data.alamat3 && (
                  <div className="rounded-lg bg-gray-50 p-3">
                    <span className="font-medium text-gray-700 block mb-1">Alamat 3</span>
                    {detailModal.data.alamat3}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                <CreditCard className="h-4 w-4" /> Dokumen
              </h4>
              {detailModal.data.kartuId ? (
                <Button
                  variant="outline"
                  onClick={() => setKtpModal({ open: true, imageUrl: detailModal.data!.kartuId! })}
                  className="w-full"
                >
                  <Eye className="mr-2 h-4 w-4" /> Lihat Foto KTP
                </Button>
              ) : (
                <p className="text-sm text-gray-500 italic">Foto KTP belum diupload</p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => setDetailModal({ open: false, data: null })}>
                Tutup
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* KTP Modal */}
      <Modal
        isOpen={ktpModal.open}
        onClose={() => setKtpModal({ open: false, imageUrl: "" })}
        title="Foto KTP Pelanggan"
      >
        <div className="flex justify-center">
          {ktpModal.imageUrl && (
            <Image
              src={ktpModal.imageUrl}
              alt="KTP Pelanggan"
              width={500}
              height={300}
              className="max-h-[70vh] w-auto rounded-lg object-contain"
            />
          )}
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={() => setKtpModal({ open: false, imageUrl: "" })}>
            Tutup
          </Button>
        </div>
      </Modal>
    </div>
  );
}
