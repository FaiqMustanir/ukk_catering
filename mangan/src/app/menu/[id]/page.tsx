import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChefHat, Clock, Users, ArrowLeft, ShoppingCart } from "lucide-react";
import { getPaketById } from "@/actions/paket.action";
import { formatCurrency, getKategoriLabel } from "@/lib/utils";

interface PaketDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PaketDetailPage({ params }: PaketDetailPageProps) {
  const { id } = await params;
  const { data: paket, success } = await getPaketById(id);

  if (!success || !paket) {
    notFound();
  }

  const images = [paket.foto1, paket.foto2, paket.foto3].filter(Boolean);

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-20 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="py-4">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Menu
            </Link>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Images */}
            <div className="space-y-4">
              <div className="relative aspect-video overflow-hidden rounded-xl bg-orange-100">
                {images[0] ? (
                  <Image
                    src={images[0]}
                    alt={paket.namaPaket}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ChefHat className="h-24 w-24 text-orange-300" />
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="grid grid-cols-3 gap-4">
                  {images.slice(1).map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-video overflow-hidden rounded-lg bg-orange-100"
                    >
                      <Image
                        src={img!}
                        alt={`${paket.namaPaket} ${idx + 2}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="info">{paket.jenis}</Badge>
                <Badge>{getKategoriLabel(paket.kategori)}</Badge>
              </div>

              <h1 className="mt-4 text-3xl font-bold text-gray-900">{paket.namaPaket}</h1>

              <p className="mt-4 text-4xl font-bold text-orange-600">
                {formatCurrency(paket.hargaPaket)}
              </p>

              <div className="mt-6 flex items-center gap-6 text-gray-600">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>{paket.jumlahPax} pax</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>Pemesanan H-3</span>
                </div>
              </div>

              {paket.deskripsi && (
                <div className="mt-6">
                  <h2 className="font-semibold text-gray-900">Deskripsi</h2>
                  <p className="mt-2 whitespace-pre-line text-gray-600">{paket.deskripsi}</p>
                </div>
              )}

              <Card className="mt-8">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900">Pesan Sekarang</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Login atau daftar untuk memesan paket catering ini
                  </p>
                  <div className="mt-4 flex gap-4">
                    <Link href="/login" className="flex-1">
                      <Button className="w-full gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        Pesan
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
