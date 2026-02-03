import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChefHat, Shield, Truck, ImageIcon, Users, Phone, Mail, MapPin } from "lucide-react";
import { getAllPakets } from "@/actions/paket.action";
import { formatCurrency, getKategoriLabel } from "@/lib/utils";

export default async function HomePage() {
  const { data: pakets } = await getAllPakets();
  const featuredPakets = pakets?.slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800 font-sans">
      <Navbar />

      {/* Simplified Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-stone-900 font-serif leading-tight">
              Sajian Istimewa untuk <br />
              <span className="text-stone-600 italic">Momen Berharga</span>
            </h1>
            <p className="text-lg text-stone-600 max-w-lg leading-relaxed">
              Mangan Catering menghadirkan cita rasa autentik dengan sentuhan elegan untuk pernikahan, jamuan, dan perayaan spesial Anda.
            </p>
            <div className="flex gap-4 pt-2">
              <Link href="/menu">
                <Button size="lg" className="bg-stone-800 hover:bg-stone-700 text-stone-50 rounded-full px-8">
                  Lihat Menu
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" size="lg" className="border-stone-300 text-stone-700 hover:bg-stone-100 rounded-full px-8">
                  Daftar
                </Button>
              </Link>
            </div>
            {/* Simple Stats Inline */}
             <div className="flex gap-8 pt-8 border-t border-stone-200 mt-8">
                <div>
                  <p className="font-bold text-2xl text-stone-800">10+</p>
                  <p className="text-xs text-stone-500 uppercase tracking-wide">Tahun</p>
                </div>
                <div>
                  <p className="font-bold text-2xl text-stone-800">5k+</p>
                  <p className="text-xs text-stone-500 uppercase tracking-wide">Acara</p>
                </div>
                <div>
                  <p className="font-bold text-2xl text-stone-800">4.9</p>
                  <p className="text-xs text-stone-500 uppercase tracking-wide">Rating</p>
                </div>
              </div>
          </div>

          {/* Placeholder Image Area */}
          <div className="relative aspect-[4/3] bg-stone-200 rounded-2xl border-2 border-dashed border-stone-300 flex flex-col items-center justify-center text-stone-500">
             <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
             <p className="font-medium">Area Gambar Hero (Kosong)</p>
             <p className="text-sm opacity-70">Silakan isi dengan foto banner utama</p>
          </div>
        </div>
      </section>

      {/* Features - Clean Grid */}
      <section className="py-20 bg-white" id="about">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-serif text-stone-900">Kenapa Memilih Kami?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
             {/* Feature 1 */}
             <div className="p-6 rounded-xl bg-[#FDFBF7] border border-stone-100 text-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-stone-700">
                   <ChefHat className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">Chef Profesional</h3>
                <p className="text-stone-600 text-sm leading-relaxed">Tim kuliner berpengalaman menciptakan rasa terbaik.</p>
             </div>
             {/* Feature 2 */}
             <div className="p-6 rounded-xl bg-[#FDFBF7] border border-stone-100 text-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-stone-700">
                   <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">Bahan Premium</h3>
                <p className="text-stone-600 text-sm leading-relaxed">Hanya menggunakan bahan segar dan berkualitas tinggi.</p>
             </div>
             {/* Feature 3 */}
             <div className="p-6 rounded-xl bg-[#FDFBF7] border border-stone-100 text-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-stone-700">
                   <Truck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">Tepat Waktu</h3>
                <p className="text-stone-600 text-sm leading-relaxed">Pengiriman dan pelayanan yang disiplin dan rapi.</p>
             </div>
          </div>
        </div>
      </section>

      {/* Menu Preview - Clean Cards */}
      <section className="py-20 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
             <h2 className="text-3xl font-bold font-serif text-stone-900">Menu Andalan</h2>
             <Link href="/menu" className="text-sm font-medium text-stone-600 hover:text-stone-900 flex items-center gap-1">
               Lihat Semua <ChevronRight className="w-4 h-4" />
             </Link>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredPakets.map((paket) => (
              <Link href={`/menu/${paket.id}`} key={paket.id} className="group">
                <Card className="border-none shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="aspect-[16/10] relative bg-stone-200 overflow-hidden rounded-t-xl">
                      {paket.foto1 ? (
                         <Image src={paket.foto1} alt={paket.namaPaket} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                         <div className="w-full h-full flex items-center justify-center text-stone-400">
                           <ImageIcon className="w-10 h-10" />
                         </div>
                      )}
                  </div>
                  <CardContent className="p-5">
                     <div className="flex justify-between items-start mb-2">
                        <div>
                           <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{getKategoriLabel(paket.kategori)}</p>
                           <h3 className="text-lg font-bold text-stone-900 group-hover:text-stone-700 transition-colors">{paket.namaPaket}</h3>
                        </div>
                        <span className="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded-md">{paket.jenis}</span>
                     </div>
                     <div className="flex items-center gap-4 text-sm text-stone-600 mt-4">
                        <span className="font-semibold text-stone-900">{formatCurrency(paket.hargaPaket)}</span>
                        <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {paket.jumlahPax} pax</span>
                     </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
             {featuredPakets.length === 0 && (
                <div className="col-span-full text-center py-10 text-stone-500">
                   Belum ada paket menu tersedia.
                </div>
             )}
          </div>
        </div>
      </section>

      {/* Contact Simple */}
      <section className="py-20 bg-stone-900 text-stone-50" id="contact">
         <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-serif mb-8 text-[#F3E5AB]">Hubungi Kami</h2>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
               <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-[#3D3A36] rounded-full flex items-center justify-center mb-4 text-[#F3E5AB]">
                     <Phone className="w-6 h-6" />
                  </div>
                  <p className="font-semibold">Telepon</p>
                  <p className="text-stone-400 text-sm mt-1">0812-3456-7890</p>
               </div>
               <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-[#3D3A36] rounded-full flex items-center justify-center mb-4 text-[#F3E5AB]">
                     <Mail className="w-6 h-6" />
                  </div>
                  <p className="font-semibold">Email</p>
                  <p className="text-stone-400 text-sm mt-1">info@mangan.com</p>
               </div>
               <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-[#3D3A36] rounded-full flex items-center justify-center mb-4 text-[#F3E5AB]">
                     <MapPin className="w-6 h-6" />
                  </div>
                  <p className="font-semibold">Lokasi</p>
                  <p className="text-stone-400 text-sm mt-1">Jakarta Selatan</p>
               </div>
            </div>

            <Link href="/register">
               <Button size="lg" className="bg-[#F3E5AB] text-stone-900 hover:bg-[#E6D69B] border-none font-semibold px-8 rounded-full">
                  Pesan Sekarang
               </Button>
            </Link>
         </div>
      </section>
      
      <Footer />
    </div>
  );
}
