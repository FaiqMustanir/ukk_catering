"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { getAllPakets, deletePaket } from "@/actions/paket.action";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";
import { Plus, Edit, Trash2, Eye, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type Paket = {
  id: string;
  namaPaket: string;
  hargaPaket: number;
  deskripsi: string | null;
  foto1: string | null;
  foto2: string | null;
  foto3: string | null;
  jenis: string;
  kategori: string;
  createdAt: Date;
};

export default function AdminPaketPage() {
  const [pakets, setPakets] = useState<Paket[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; paket: Paket | null }>({
    open: false,
    paket: null,
  });
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  // Filters
  const [search, setSearch] = useState("");
  const [filterJenis, setFilterJenis] = useState("");
  const [filterKategori, setFilterKategori] = useState("");

  const fetchPakets = async () => {
    setLoading(true);
    try {
      const result = await getAllPakets({});
      if (result.success && result.data) {
        setPakets(result.data);
      }
    } catch (error) {
      console.error("Error fetching pakets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPakets();
  }, []);

  const handleDelete = async () => {
    if (!deleteModal.paket) return;

    startTransition(async () => {
      const result = await deletePaket(deleteModal.paket!.id);
      if (result.success) {
        showToast("Paket berhasil dihapus", "success");
        fetchPakets();
      } else {
        showToast(result.error || "Gagal menghapus paket", "error");
      }
      setDeleteModal({ open: false, paket: null });
    });
  };

  // Filter pakets
  const filteredPakets = pakets.filter((paket) => {
    const matchSearch = paket.namaPaket.toLowerCase().includes(search.toLowerCase());
    const matchJenis = filterJenis ? paket.jenis === filterJenis : true;
    const matchKategori = filterKategori ? paket.kategori === filterKategori : true;
    return matchSearch && matchJenis && matchKategori;
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paket Catering</h1>
          <p className="text-gray-600">Kelola menu catering Anda</p>
        </div>
        <Link href="/admin/paket/tambah">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Tambah Paket
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Cari paket..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={filterJenis}
          onChange={(e) => setFilterJenis(e.target.value)}
          className="w-full sm:w-48"
        >
          <option value="">Semua Jenis</option>
          <option value="Prasmanan">Prasmanan</option>
          <option value="Box">Box / Nasi Kotak</option>
        </Select>
        <Select
          value={filterKategori}
          onChange={(e) => setFilterKategori(e.target.value)}
          className="w-full sm:w-48"
        >
          <option value="">Semua Kategori</option>
          <option value="Pernikahan">Pernikahan</option>
          <option value="Selamatan">Selamatan</option>
          <option value="UlangTahun">Ulang Tahun</option>
          <option value="StudiTour">Studi Tour</option>
          <option value="Rapat">Rapat</option>
        </Select>
      </div>

      {/* Paket List */}
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredPakets.map((paket) => (
          <Card key={paket.id}>
            <CardContent className="p-0">
              <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-gray-200">
                {paket.foto1 ? (
                  <Image
                    src={paket.foto1}
                    alt={paket.namaPaket}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{paket.namaPaket}</h3>
                    <p className="text-lg font-bold text-orange-600">
                      {formatCurrency(paket.hargaPaket)}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  <Badge variant="outline">{(paket.jenis || "").replace("_", " ")}</Badge>
                  <Badge variant="outline">{paket.kategori}</Badge>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-gray-600">{paket.deskripsi}</p>

                <div className="mt-4 flex gap-2">
                  <Link href={`/menu/${paket.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="mr-1 h-4 w-4" /> Lihat
                    </Button>
                  </Link>
                  <Link href={`/admin/paket/${paket.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="mr-1 h-4 w-4" /> Edit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteModal({ open: true, paket })}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPakets.length === 0 && (
        <div className="mt-8 text-center">
          <p className="text-gray-500">Tidak ada paket ditemukan</p>
        </div>
      )}

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, paket: null })}
        title="Hapus Paket"
      >
        <p className="text-gray-600">
          Apakah Anda yakin ingin menghapus paket <strong>{deleteModal.paket?.namaPaket}</strong>?
          Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setDeleteModal({ open: false, paket: null })}
          >
            Batal
          </Button>
          <Button variant="destructive" onClick={handleDelete} isLoading={isPending}>
            Hapus
          </Button>
        </div>
      </Modal>
    </div>
  );
}
