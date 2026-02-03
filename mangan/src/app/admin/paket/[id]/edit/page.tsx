"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { paketSchema, type PaketInput } from "@/lib/validations";
import { getPaketById, updatePaket } from "@/actions/paket.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/image-upload";
import { useToast } from "@/components/ui/toast";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// Options sesuai PDM
const jenisOptions = [
  { value: "Prasmanan", label: "Prasmanan" },
  { value: "Box", label: "Box" },
];

const kategoriOptions = [
  { value: "Pernikahan", label: "Pernikahan" },
  { value: "Selamatan", label: "Selamatan" },
  { value: "UlangTahun", label: "Ulang Tahun" },
  { value: "StudiTour", label: "Studi Tour" },
  { value: "Rapat", label: "Rapat" },
];

export default function EditPaketPage() {
  const router = useRouter();
  const params = useParams();
  const paketId = params.id as string;
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [foto1Base64, setFoto1Base64] = useState<string | null>(null);
  const [foto2Base64, setFoto2Base64] = useState<string | null>(null);
  const [foto3Base64, setFoto3Base64] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaketInput>({
    resolver: zodResolver(paketSchema),
  });

  useEffect(() => {
    const fetchPaket = async () => {
      const result = await getPaketById(paketId);
      if (result.success && result.data) {
        const paket = result.data;
        reset({
          namaPaket: paket.namaPaket,
          jenis: paket.jenis as PaketInput["jenis"],
          kategori: paket.kategori as PaketInput["kategori"],
          jumlahPax: paket.jumlahPax,
          hargaPaket: paket.hargaPaket,
          deskripsi: paket.deskripsi || undefined,
        });
        setFoto1Base64(paket.foto1 || null);
        setFoto2Base64(paket.foto2 || null);
        setFoto3Base64(paket.foto3 || null);
      } else {
        showToast("Paket tidak ditemukan", "error");
        router.push("/admin/paket");
      }
      setLoading(false);
    };

    fetchPaket();
  }, [paketId, reset, router, showToast]);

  const onSubmit = (data: PaketInput) => {
    startTransition(async () => {
      const result = await updatePaket(paketId, {
        ...data,
        foto1: foto1Base64 || undefined,
        foto2: foto2Base64 || undefined,
        foto3: foto3Base64 || undefined,
      });

      if (result.success) {
        showToast("Paket berhasil diupdate", "success");
        router.push("/admin/paket");
      } else {
        showToast(result.error || "Gagal mengupdate paket", "error");
      }
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
    <div>
      <div className="flex items-center gap-4">
        <Link href="/admin/paket">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Paket</h1>
          <p className="text-gray-600">Update informasi menu catering</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Paket</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="namaPaket">Nama Paket *</Label>
                  <Input
                    id="namaPaket"
                    {...register("namaPaket")}
                    error={errors.namaPaket?.message}
                    placeholder="Contoh: Paket Prasmanan Premium"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="hargaPaket">Harga Paket *</Label>
                    <Input
                      id="hargaPaket"
                      type="number"
                      {...register("hargaPaket", { valueAsNumber: true })}
                      error={errors.hargaPaket?.message}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="jumlahPax">Jumlah Pax *</Label>
                    <Input
                      id="jumlahPax"
                      type="number"
                      {...register("jumlahPax", { valueAsNumber: true })}
                      error={errors.jumlahPax?.message}
                      placeholder="10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="deskripsi">Deskripsi</Label>
                  <Textarea
                    id="deskripsi"
                    {...register("deskripsi")}
                    placeholder="Deskripsi lengkap paket catering..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Foto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <Label>Foto 1 (Utama)</Label>
                    <ImageUpload
                      value={foto1Base64}
                      onChange={setFoto1Base64}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Foto 2</Label>
                    <ImageUpload
                      value={foto2Base64}
                      onChange={setFoto2Base64}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Foto 3</Label>
                    <ImageUpload
                      value={foto3Base64}
                      onChange={setFoto3Base64}
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Kategori</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="jenis">Jenis Paket *</Label>
                  <Select
                    id="jenis"
                    {...register("jenis")}
                  >
                    <option value="">Pilih jenis</option>
                    {jenisOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                  {errors.jenis && (
                    <p className="mt-1 text-sm text-red-500">{errors.jenis.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="kategori">Kategori Acara *</Label>
                  <Select
                    id="kategori"
                    {...register("kategori")}
                  >
                    <option value="">Pilih kategori</option>
                    {kategoriOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                  {errors.kategori && (
                    <p className="mt-1 text-sm text-red-500">{errors.kategori.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Link href="/admin/paket" className="flex-1">
                <Button variant="outline" type="button" className="w-full">
                  Batal
                </Button>
              </Link>
              <Button type="submit" className="flex-1" isLoading={isPending}>
                Update
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
