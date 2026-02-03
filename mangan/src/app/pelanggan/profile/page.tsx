"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/ui/image-upload";
import { pelangganUpdateSchema, type PelangganUpdateInput } from "@/lib/validations";
import { getPelangganById, updatePelanggan } from "@/actions/auth.action";
import { User } from "lucide-react";

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [fotoBase64, setFotoBase64] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PelangganUpdateInput>({
    resolver: zodResolver(pelangganUpdateSchema),
  });

  useEffect(() => {
    if (session?.user?.id) {
      loadProfile();
    }
  }, [session]);

  const loadProfile = async () => {
    if (!session?.user?.id) return;
    
    const result = await getPelangganById(session.user.id);
    if (result.success && result.data) {
      setValue("namaPelanggan", result.data.namaPelanggan);
      setValue("email", result.data.email);
      setValue("telepon", result.data.telepon || "");
      setValue("tglLahir", result.data.tglLahir ? new Date(result.data.tglLahir).toISOString().split("T")[0] : "");
      setValue("alamat1", result.data.alamat1 || "");
      setValue("alamat2", result.data.alamat2 || "");
      setValue("alamat3", result.data.alamat3 || "");
      setValue("foto", result.data.foto || "");
      
      if (result.data.foto) setFotoBase64(result.data.foto);
    }
  };

  const onSubmit = async (data: PelangganUpdateInput) => {
    if (!session?.user?.id) return;
    
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const result = await updatePelanggan(
        session.user.id,
        data,
        fotoBase64 && fotoBase64.startsWith("data:image") ? fotoBase64 : undefined
      );

      if (result.success) {
        setMessage({ type: "success", text: "Profil berhasil diupdate!" });
        router.refresh();
      } else {
        setMessage({ type: "error", text: result.error || "Gagal update profil" });
      }
    } catch {
      setMessage({ type: "error", text: "Terjadi kesalahan" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Profil Saya</h1>
      <p className="text-gray-600">Kelola informasi profil Anda</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
        {message.text && (
          <div
            className={`mb-6 rounded-md p-4 ${
              message.type === "success" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Info */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informasi Dasar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="namaPelanggan" required>Nama Lengkap</Label>
                  <Input
                    id="namaPelanggan"
                    {...register("namaPelanggan")}
                    error={errors.namaPelanggan?.message}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" required>Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    error={errors.email?.message}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telepon">Telepon</Label>
                  <Input
                    id="telepon"
                    {...register("telepon")}
                    error={errors.telepon?.message}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tglLahir">Tanggal Lahir</Label>
                  <Input
                    id="tglLahir"
                    type="date"
                    {...register("tglLahir")}
                    error={errors.tglLahir?.message}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="alamat1">Alamat Utama</Label>
                <Input
                  id="alamat1"
                  {...register("alamat1")}
                  error={errors.alamat1?.message}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alamat2">Alamat Alternatif 1</Label>
                <Input
                  id="alamat2"
                  {...register("alamat2")}
                  error={errors.alamat2?.message}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alamat3">Alamat Alternatif 2</Label>
                <Input
                  id="alamat3"
                  {...register("alamat3")}
                  error={errors.alamat3?.message}
                />
              </div>
            </CardContent>
          </Card>

          {/* Photo & ID */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Foto Profil</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  value={fotoBase64}
                  onChange={setFotoBase64}
                  onRemove={() => setFotoBase64(null)}
                  placeholder="Upload foto profil"
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="submit" isLoading={isLoading}>
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </div>
  );
}
