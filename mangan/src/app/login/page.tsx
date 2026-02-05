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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { pelangganLoginSchema, type PelangganLoginInput } from "@/lib/validations";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PelangganLoginInput>({
    resolver: zodResolver(pelangganLoginSchema),
  });

  const onSubmit = async (data: PelangganLoginInput) => {
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("pelanggan-login", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email atau password salah");
      } else {
        router.push("/pelanggan/dashboard");
        router.refresh();
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
          <CardTitle className="text-xl font-serif text-stone-800">Masuk ke Akun Anda</CardTitle>
          <CardDescription className="text-stone-500">
            Selamat datang kembali, silakan masuk untuk melanjutkan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-100">
                {error}
              </div>
            )}

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

            <Button type="submit" className="w-full bg-stone-800 hover:bg-stone-700 text-stone-50" isLoading={isLoading}>
              Masuk
            </Button>

            <div className="text-center text-sm text-stone-500 mt-6 space-y-2">
              <p>
                Belum punya akun?{" "}
                <Link href="/register" className="font-semibold text-stone-800 hover:underline">
                  Daftar sekarang
                </Link>
              </p>
              <div className="pt-4 mt-4 border-t border-stone-100">
                <Link href="/admin/login" className="block w-full">
                   <Button variant="outline" className="w-full border-stone-300 text-stone-600 hover:bg-stone-50 hover:text-stone-900" type="button">
                     Masuk sebagai Staff/Admin
                   </Button>
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
