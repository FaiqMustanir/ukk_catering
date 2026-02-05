"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/ui/image-upload";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { pelangganRegisterSchema, type PelangganRegisterInput } from "@/lib/validations";
import { registerPelanggan } from "@/actions/auth.action";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PelangganRegisterInput>({
    resolver: zodResolver(pelangganRegisterSchema),
  });

  const onSubmit = async (data: PelangganRegisterInput) => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Data already contains base64 strings for images from setValue
      const result = await registerPelanggan(data);

      if (result.success) {
        setSuccess("Registrasi berhasil! Silakan login.");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(result.error || "Terjadi kesalahan saat registrasi");
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#FDFBF7] p-4 text-stone-800">
      {/* Back to Home Button */}
      <Link 
        href="/" 
        className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Beranda
      </Link>

      <Card className="w-full max-w-md border-stone-200 shadow-sm bg-white">
        <CardHeader className="text-center space-y-2">
          <Link href="/" className="mx-auto flex items-center justify-center gap-2">
            <div className="bg-orange-600 p-2 rounded-lg">
                <Utensils className="h-6 w-6 text-white" />
            </div>
            <span className="text-3xl font-bold font-serif text-stone-900">Mangan.</span>
          </Link>
          <CardTitle className="text-xl font-serif text-stone-800">Buat Akun Baru</CardTitle>
          <CardDescription className="text-stone-500">
            Daftar untuk mulai memesan sajian istimewa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-100">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-md bg-green-50 p-3 text-sm text-green-600 border border-green-100">
                {success}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="namaPelanggan" required className="text-stone-700">
                Nama Lengkap
              </Label>
              <Input
                id="namaPelanggan"
                placeholder="Nama Anda"
                {...register("namaPelanggan")}
                error={errors.namaPelanggan?.message}
                className="border-stone-200 focus:border-stone-400 focus:ring-stone-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" required className="text-stone-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                {...register("email")}
                error={errors.email?.message}
                className="border-stone-200 focus:border-stone-400 focus:ring-stone-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="noTelepon" required className="text-stone-700">
                Nomor Telepon
              </Label>
              <Input
                id="noTelepon"
                type="tel"
                placeholder="081234567890"
                {...register("noTelepon")}
                error={errors.noTelepon?.message}
                className="border-stone-200 focus:border-stone-400 focus:ring-stone-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tglLahir" required className="text-stone-700">
                Tanggal Lahir
              </Label>
              <Input
                id="tglLahir"
                type="date"
                {...register("tglLahir")}
                error={errors.tglLahir?.message}
                className="border-stone-200 focus:border-stone-400 focus:ring-stone-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kartuId" required className="text-stone-700">
                Foto KTP (Wajib)
              </Label>
              <ImageUpload
                value={watch("kartuId")}
                onChange={(base64) => setValue("kartuId", base64 || "", { shouldValidate: true })}
                className="w-full"
                placeholder="Upload Foto KTP"
              />
              {errors.kartuId && <p className="text-xs text-red-500">{errors.kartuId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="foto" className="text-stone-700">
                Foto Profil (Opsional)
              </Label>
              <ImageUpload
                value={watch("foto")}
                onChange={(base64) => setValue("foto", base64 || "")}
                className="w-full"
                placeholder="Upload Foto Profil"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="alamat1" required className="text-stone-700">
                Alamat Utama
              </Label>
              <Input
                id="alamat1"
                placeholder="Alamat lengkap pengiriman"
                {...register("alamat1")}
                error={errors.alamat1?.message}
                className="border-stone-200 focus:border-stone-400 focus:ring-stone-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="alamat2" className="text-stone-700">
                Alamat 2 (Opsional)
              </Label>
              <Input
                id="alamat2"
                placeholder="Alamat tambahan (cth: Kantor, Rumah Orang Tua)"
                {...register("alamat2")}
                error={errors.alamat2?.message}
                className="border-stone-200 focus:border-stone-400 focus:ring-stone-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="alamat3" className="text-stone-700">
                Alamat 3 (Opsional)
              </Label>
              <Input
                id="alamat3"
                placeholder="Alamat tambahan lainnya"
                {...register("alamat3")}
                error={errors.alamat3?.message}
                className="border-stone-200 focus:border-stone-400 focus:ring-stone-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" required className="text-stone-700">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                error={errors.password?.message}
                className="border-stone-200 focus:border-stone-400 focus:ring-stone-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" required className="text-stone-700">
                Konfirmasi Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...register("confirmPassword")}
                error={errors.confirmPassword?.message}
                className="border-stone-200 focus:border-stone-400 focus:ring-stone-400"
              />
            </div>

            <Button type="submit" className="w-full bg-stone-800 hover:bg-stone-700 text-stone-50 mt-2" isLoading={isLoading}>
              Daftar Sekarang
            </Button>

            <div className="text-center text-sm text-stone-500 mt-6">
              Sudah punya akun?{" "}
              <Link href="/login" className="font-semibold text-stone-800 hover:underline">
                Masuk disini
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
