"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { paketSchema, type PaketInput } from "@/lib/validations";
import { createPaket } from "@/actions/paket.action";
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

export default function TambahPaketPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();
  // Using 3 separate states for images to match PDM (max 3)
  const [foto1Base64, setFoto1Base64] = useState<string | null>(null);
  const [foto2Base64, setFoto2Base64] = useState<string | null>(null);
  const [foto3Base64, setFoto3Base64] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PaketInput>({
    resolver: zodResolver(paketSchema),
    defaultValues: {
      jumlahPax: 0,
      hargaPaket: 0,
    },
  });

  const onSubmit = (data: PaketInput) => {
    startTransition(async () => {
      // Pass base64 strings as separate arguments to the action
      const result = await createPaket(
        data,
        foto1Base64 || undefined,
        foto2Base64 || undefined,
        foto3Base64 || undefined
      );

      if (result.success) {
        showToast("Paket berhasil ditambahkan", "success");
        router.push("/admin/paket");
      } else {
        showToast(result.error || "Gagal menambahkan paket", "error");
      }
    });
  };

  return (
    <div>
      <div className="flex items-center gap-4">
        <Link href="/admin/paket">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tambah Paket</h1>
          <p className="text-gray-600">Tambahkan menu catering baru</p>
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
                  <Label htmlFor="deskripsi">Deskripsi *</Label>
                  <Textarea
                    id="deskripsi"
                    {...register("deskripsi")}
                    error={errors.deskripsi?.message}
                    placeholder="Deskripsi lengkap paket catering..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Foto Menu (Max 3)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <Label className="mb-2 block text-xs">Foto 1 (Utama)</Label>
                    <ImageUpload
                      value={foto1Base64}
                      onChange={setFoto1Base64}
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block text-xs">Foto 2</Label>
                    <ImageUpload
                      value={foto2Base64}
                      onChange={setFoto2Base64}
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block text-xs">Foto 3</Label>
                    <ImageUpload
                      value={foto3Base64}
                      onChange={setFoto3Base64}
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
                    error={errors.jenis?.message}
                    options={[
                      { value: "Prasmanan", label: "Prasmanan" },
                      { value: "Box", label: "Box / Nasi Kotak" },
                    ]}
                    placeholder="Pilih jenis"
                  />
                </div>

                <div>
                  <Label htmlFor="kategori">Kategori Acara *</Label>
                  <Select
                    id="kategori"
                    {...register("kategori")}
                    error={errors.kategori?.message}
                    options={[
                      { value: "Pernikahan", label: "Pernikahan (Wedding)" },
                      { value: "Selamatan", label: "Selamatan" },
                      { value: "UlangTahun", label: "Ulang Tahun" },
                      { value: "StudiTour", label: "Studi Tour" },
                      { value: "Rapat", label: "Rapat / Corporate" },
                    ]}
                    placeholder="Pilih kategori"
                  />
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
                Simpan
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
