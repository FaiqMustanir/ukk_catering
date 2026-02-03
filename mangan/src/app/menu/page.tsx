import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChefHat, Filter, Users, ImageIcon } from "lucide-react";
import { getAllPakets } from "@/actions/paket.action";
import { formatCurrency, getKategoriLabel } from "@/lib/utils";

interface MenuPageProps {
  searchParams: Promise<{
    jenis?: string;
    kategori?: string;
    search?: string;
  }>;
}

export default async function MenuPage({ searchParams }: MenuPageProps) {
  const params = await searchParams;
  const { data: pakets } = await getAllPakets({
    jenis: params.jenis,
    kategori: params.kategori,
    search: params.search,
  });

  const jenisOptions = [
    { value: "", label: "Semua Jenis" },
    { value: "Prasmanan", label: "Prasmanan" },
    { value: "Box", label: "Box" },
  ];

  const kategoriOptions = [
    { value: "", label: "Semua Kategori" },
    { value: "Pernikahan", label: "Pernikahan" },
    { value: "Selamatan", label: "Selamatan" },
    { value: "UlangTahun", label: "Ulang Tahun" },
    { value: "StudiTour", label: "Studi Tour" },
    { value: "Rapat", label: "Rapat" },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-stone-800">
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold font-serif text-stone-900">Menu Catering</h1>
          <p className="mt-4 text-stone-600 text-lg max-w-2xl mx-auto">
            Jelajahi pilihan paket sajian istimewa kami yang diracik khusus untuk menyempurnakan setiap momen acara Anda.
          </p>
      </section>

      {/* Filters */}
      <section className="border-y border-stone-200 bg-[#FAF7F2] py-4 sticky top-16 z-10 backdrop-blur-md bg-[#FAF7F2]/90 supports-[backdrop-filter]:bg-[#FAF7F2]/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
            <div className="flex items-center gap-2 text-stone-600">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium uppercase tracking-wide">Filter Menu</span>
            </div>

            <form className="flex flex-wrap gap-4 items-center justify-center sm:justify-end">
              <select
                name="jenis"
                defaultValue={params.jenis || ""}
                className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-400 cursor-pointer hover:border-stone-300 transition-colors"
              >
                {jenisOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <select
                name="kategori"
                defaultValue={params.kategori || ""}
                 className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-400 cursor-pointer hover:border-stone-300 transition-colors"
              >
                {kategoriOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <Button type="submit" size="sm" className="rounded-full bg-stone-800 hover:bg-stone-700 text-stone-50 px-6">
                Terapkan
              </Button>

              {(params.jenis || params.kategori || params.search) && (
                <Link href="/menu">
                  <Button type="button" variant="ghost" size="sm" className="text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-full">
                    Reset
                  </Button>
                </Link>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Menu Grid */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {pakets && pakets.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {pakets.map((paket) => (
                <div key={paket.id} className="group flex flex-col items-center">
                    <Link href={`/menu/${paket.id}`} className="w-full h-full">
                        <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl border-none shadow-sm bg-white h-full flex flex-col">
                        <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                            {paket.foto1 ? (
                            <Image
                                src={paket.foto1}
                                alt={paket.namaPaket}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            ) : (
                            <div className="flex h-full items-center justify-center text-stone-300">
                                <ImageIcon className="h-12 w-12" />
                            </div>
                            )}
                            <div className="absolute top-3 left-3">
                                <span className="rounded-md bg-white/90 backdrop-blur px-3 py-1 text-xs font-semibold text-stone-800 tracking-wide border border-stone-100/50 shadow-sm">
                                {paket.jenis}
                                </span>
                            </div>
                        </div>
                        <CardContent className="p-6 flex-1 flex flex-col">
                            <div className="mb-4">
                                <p className="text-xs font-medium text-[#C8B6A6] uppercase tracking-wider mb-1">{getKategoriLabel(paket.kategori)}</p>
                                <h3 className="font-bold text-lg text-stone-900 font-serif leading-tight group-hover:text-[#9A8B7A] transition-colors">{paket.namaPaket}</h3>
                            </div>
                            
                            <div className="mt-auto pt-4 border-t border-stone-100">
                                <div className="flex items-end justify-between">
                                    <p className="text-lg font-bold text-stone-800">
                                        {formatCurrency(paket.hargaPaket)}
                                    </p>
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-stone-500 bg-stone-50 px-2 py-1 rounded">
                                        <Users className="h-3.5 w-3.5" />
                                        <span>{paket.jumlahPax} pax</span>
                                    </div>
                                </div>
                                <Button className="w-full mt-4 bg-[#EAE5DF] text-stone-800 hover:bg-[#D6CECF] border-none font-medium h-9 text-sm shadow-none">
                                    Detail Menu
                                </Button>
                            </div>
                        </CardContent>
                        </Card>
                    </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-32 text-center rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50/50">
              <ChefHat className="mx-auto h-16 w-16 text-stone-300" />
              <h3 className="mt-6 text-xl font-serif font-medium text-stone-900">Menu Belum Tersedia</h3>
              <p className="mt-2 text-stone-500">
                Silakan coba atur ulang filter pencarian Anda.
              </p>
              <Link href="/menu" className="mt-8 inline-block">
                <Button variant="outline" className="border-stone-300 text-stone-600 hover:bg-stone-100">Reset Filter</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
