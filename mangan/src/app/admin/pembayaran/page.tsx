"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getAllJenisPembayaran,
  createJenisPembayaran,
  updateJenisPembayaran,
  deleteJenisPembayaran,
  createDetailJenisPembayaran,
  updateDetailJenisPembayaran,
  deleteDetailJenisPembayaran,
} from "@/actions/pembayaran.action";
import { jenisPembayaranSchema, type JenisPembayaranInput } from "@/lib/validations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { Plus, Edit, Trash2, CreditCard, Building } from "lucide-react";
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
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  // Modals
  const [jenisModal, setJenisModal] = useState<{
    open: boolean;
    mode: "create" | "edit";
    data: JenisPembayaran | null;
  }>({ open: false, mode: "create", data: null });

  const [detailModal, setDetailModal] = useState<{
    open: boolean;
    mode: "create" | "edit";
    jenisId: string;
    data: DetailJenisPembayaran | null;
  }>({ open: false, mode: "create", jenisId: "", data: null });

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    type: "jenis" | "detail";
    id: string;
    name: string;
  }>({ open: false, type: "jenis", id: "", name: "" });

  // Logo preview
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);

  const {
    register: registerJenis,
    handleSubmit: handleSubmitJenis,
    reset: resetJenis,
    formState: { errors: errorsJenis },
  } = useForm<JenisPembayaranInput>({
    resolver: zodResolver(jenisPembayaranSchema),
  });

  const {
    register: registerDetail,
    handleSubmit: handleSubmitDetail,
    reset: resetDetail,
    formState: { errors: errorsDetail },
  } = useForm<{
    noRek: string;
    tempatBayar: string;
  }>();

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

  // Open modal for creating/editing jenis pembayaran
  const openJenisModal = (mode: "create" | "edit", data?: JenisPembayaran) => {
    if (mode === "edit" && data) {
      resetJenis({
        metodePembayaran: data.metodePembayaran,
      });
      setJenisModal({ open: true, mode: "edit", data });
    } else {
      resetJenis({});
      setJenisModal({ open: true, mode: "create", data: null });
    }
  };

  // Open modal for creating/editing detail
  const openDetailModal = (
    mode: "create" | "edit",
    jenisId: string,
    data?: DetailJenisPembayaran
  ) => {
    if (mode === "edit" && data) {
      resetDetail({
        noRek: data.noRek || "",
        tempatBayar: data.tempatBayar || "",
      });
      setLogoPreview(data.logo || null);
      setDetailModal({ open: true, mode: "edit", jenisId, data });
    } else {
      resetDetail({});
      setLogoPreview(null);
      setLogoBase64(null);
      setDetailModal({ open: true, mode: "create", jenisId, data: null });
    }
  };

  // Handle logo file change
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setLogoPreview(base64);
        setLogoBase64(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit jenis pembayaran
  const onSubmitJenis = (data: JenisPembayaranInput) => {
    startTransition(async () => {
      let result;
      if (jenisModal.mode === "create") {
        result = await createJenisPembayaran(data);
      } else {
        result = await updateJenisPembayaran(jenisModal.data!.id, data);
      }

      if (result.success) {
        showToast(
          `Jenis pembayaran berhasil ${jenisModal.mode === "create" ? "ditambahkan" : "diupdate"}`,
          "success"
        );
        fetchData();
        setJenisModal({ open: false, mode: "create", data: null });
      } else {
        showToast(result.error || "Terjadi kesalahan", "error");
      }
    });
  };

  // Submit detail pembayaran
  const onSubmitDetail = (data: {
    noRek: string;
    tempatBayar: string;
  }) => {
    startTransition(async () => {
      let result;
      if (detailModal.mode === "create") {
        result = await createDetailJenisPembayaran({
          idJenisPembayaran: detailModal.jenisId,
          noRek: data.noRek,
          tempatBayar: data.tempatBayar,
          logo: undefined,
        }, logoBase64 || undefined);
      } else {
        result = await updateDetailJenisPembayaran(
          detailModal.data!.id,
          {
            noRek: data.noRek,
            tempatBayar: data.tempatBayar,
          },
          logoBase64 || undefined
        );
      }

      if (result.success) {
        showToast(
          `Detail pembayaran berhasil ${detailModal.mode === "create" ? "ditambahkan" : "diupdate"}`,
          "success"
        );
        fetchData();
        setDetailModal({ open: false, mode: "create", jenisId: "", data: null });
        setLogoPreview(null);
        setLogoBase64(null);
      } else {
        showToast(result.error || "Terjadi kesalahan", "error");
      }
    });
  };

  // Handle delete
  const handleDelete = async () => {
    startTransition(async () => {
      let result;
      if (deleteModal.type === "jenis") {
        result = await deleteJenisPembayaran(deleteModal.id);
      } else {
        result = await deleteDetailJenisPembayaran(deleteModal.id);
      }

      if (result.success) {
        showToast("Berhasil dihapus", "success");
        fetchData();
      } else {
        showToast(result.error || "Gagal menghapus", "error");
      }
      setDeleteModal({ open: false, type: "jenis", id: "", name: "" });
    });
  };

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
          <p className="text-sm text-gray-600">Kelola jenis dan detail pembayaran</p>
        </div>
        <Button onClick={() => openJenisModal("create")}>
          <Plus className="mr-2 h-4 w-4" /> Tambah Jenis Pembayaran
        </Button>
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
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openJenisModal("edit", jenis)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setDeleteModal({
                      open: true,
                      type: "jenis",
                      id: jenis.id,
                      name: jenis.metodePembayaran,
                    })
                  }
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {jenis.detailJenisPembayarans.map((detail) => (
                  <div
                    key={detail.id}
                    className="flex items-center justify-between rounded-lg bg-gray-50 p-4"
                  >
                    <div className="flex items-center gap-3">
                      {detail.logo ? (
                        <Image
                          src={detail.logo}
                          alt={detail.tempatBayar || "Logo"}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded object-contain"
                        />
                      ) : (
                        <Building className="h-8 w-8 text-gray-400" />
                      )}
                      <div>
                        <p className="font-medium">{detail.tempatBayar || "-"}</p>
                        <p className="text-sm text-gray-600">
                          No. Rek: {detail.noRek || "-"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDetailModal("edit", jenis.id, detail)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setDeleteModal({
                            open: true,
                            type: "detail",
                            id: detail.id,
                            name: detail.tempatBayar || "Detail",
                          })
                        }
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDetailModal("create", jenis.id)}
                  className="mt-2"
                >
                  <Plus className="mr-2 h-4 w-4" /> Tambah Detail
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {jenisPembayaran.length === 0 && (
        <div className="mt-8 text-center">
          <p className="text-gray-500">Belum ada jenis pembayaran</p>
        </div>
      )}

      {/* Jenis Pembayaran Modal */}
      <Modal
        isOpen={jenisModal.open}
        onClose={() => setJenisModal({ open: false, mode: "create", data: null })}
        title={`${jenisModal.mode === "create" ? "Tambah" : "Edit"} Jenis Pembayaran`}
      >
        <form onSubmit={handleSubmitJenis(onSubmitJenis)} className="space-y-4">
          <div>
            <Label htmlFor="metodePembayaran">Metode Pembayaran *</Label>
            <Input
              id="metodePembayaran"
              {...registerJenis("metodePembayaran")}
              error={errorsJenis.metodePembayaran?.message}
              placeholder="Contoh: Transfer Bank, E-Wallet, COD"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setJenisModal({ open: false, mode: "create", data: null })}
            >
              Batal
            </Button>
            <Button type="submit" isLoading={isPending}>
              Simpan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Detail Pembayaran Modal */}
      <Modal
        isOpen={detailModal.open}
        onClose={() => {
          setDetailModal({ open: false, mode: "create", jenisId: "", data: null });
          setLogoPreview(null);
          setLogoBase64(null);
        }}
        title={`${detailModal.mode === "create" ? "Tambah" : "Edit"} Detail Pembayaran`}
      >
        <form onSubmit={handleSubmitDetail(onSubmitDetail)} className="space-y-4">
          <div>
            <Label htmlFor="tempatBayar">Tempat Bayar *</Label>
            <Input
              id="tempatBayar"
              {...registerDetail("tempatBayar", { required: "Tempat bayar harus diisi" })}
              error={errorsDetail.tempatBayar?.message}
              placeholder="Contoh: BCA, Mandiri, OVO, GoPay"
            />
          </div>

          <div>
            <Label htmlFor="noRek">Nomor Rekening</Label>
            <Input
              id="noRek"
              {...registerDetail("noRek")}
              error={errorsDetail.noRek?.message}
              placeholder="1234567890"
            />
          </div>

          <div>
            <Label htmlFor="logo">Logo</Label>
            <Input
              id="logo"
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="cursor-pointer"
            />
            {logoPreview && (
              <div className="mt-2">
                <Image
                  src={logoPreview}
                  alt="Preview"
                  width={100}
                  height={100}
                  className="h-20 w-20 rounded object-contain"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDetailModal({ open: false, mode: "create", jenisId: "", data: null });
                setLogoPreview(null);
                setLogoBase64(null);
              }}
            >
              Batal
            </Button>
            <Button type="submit" isLoading={isPending}>
              Simpan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, type: "jenis", id: "", name: "" })}
        title="Konfirmasi Hapus"
      >
        <p className="text-gray-600">
          Apakah Anda yakin ingin menghapus <strong>{deleteModal.name}</strong>?
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() =>
              setDeleteModal({ open: false, type: "jenis", id: "", name: "" })
            }
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
