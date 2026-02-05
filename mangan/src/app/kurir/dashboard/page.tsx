import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPengirimanKurir, getKurirStats } from "@/actions/dashboard.action";
import { Truck, MapPin, CheckSquare, Clock, Phone, PackageCheck, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function KurirDashboardPage() {
  const session = await auth();

  if (!session || session.user.type !== "user") {
    redirect("/admin/login");
  }

  const userId = session.user.id;
  
  const [statsResult, pengirimanResult] = await Promise.all([
    getKurirStats(userId),
    getPengirimanKurir(userId),
  ]);

  const stats = statsResult.data;
  const pengiriman = pengirimanResult?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-stone-900">Halo, {session.user.name || "Kurir"}</h1>
          <p className="text-stone-500">Daftar pengiriman yang ditugaskan kepada Anda.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm font-medium text-stone-600">Status: Online</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card className="bg-stone-800 text-stone-50 border-none shadow-md">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Truck className="h-6 w-6 mb-2 opacity-80" />
            <span className="text-2xl font-bold">{stats?.totalTugas || 0}</span>
            <span className="text-xs text-stone-300">Total Tugas</span>
          </CardContent>
        </Card>
        <Card className="bg-white border-stone-200 shadow-sm">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Clock className="h-6 w-6 mb-2 text-blue-600" />
            <span className="text-2xl font-bold text-stone-900">{stats?.sedangDikirim || 0}</span>
            <span className="text-xs text-stone-500">Dalam Perjalanan</span>
          </CardContent>
        </Card>
        <Card className="bg-white border-stone-200 shadow-sm">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <CheckSquare className="h-6 w-6 mb-2 text-green-600" />
            <span className="text-2xl font-bold text-stone-900">{stats?.selesai || 0}</span>
            <span className="text-xs text-stone-500">Selesai</span>
          </CardContent>
        </Card>
      </div>

      {/* Active Deliveries */}
      <Card className="border-stone-200 shadow-sm">
        <CardHeader>
          <CardTitle className="font-serif text-stone-800 text-lg flex items-center gap-2">
            <PackageCheck className="h-5 w-5" /> Pengiriman Aktif
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {pengiriman.length === 0 ? (
            <div className="p-8 text-center text-stone-400">
              <Truck className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>Tidak ada pengiriman aktif saat ini.</p>
              <p className="text-xs mt-1">Tunggu admin untuk assign pengiriman baru.</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100 p-4 space-y-4">
              {pengiriman.map((item) => (
                <div key={item.id} className="bg-white border text-stone-700 border-stone-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  {/* Header: Resi & Status */}
                  <div className="flex justify-between items-start mb-4 pb-3 border-b border-stone-100">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">Nomor Resi</span>
                      <p className="font-mono font-bold text-lg text-stone-800">#{item.idPesan}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider block mb-1">Status Pengiriman</span>
                      <Badge 
                        variant={item.status === "SedangDikirim" ? "default" : "secondary"} 
                        className={item.status === "SedangDikirim" ? "bg-blue-600 hover:bg-blue-700" : "bg-stone-200 text-stone-700"}
                      >
                        {item.status === "SedangDikirim" ? "Sedang Diantar" : item.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Customer Details */}
                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-stone-500 tracking-wider mb-1">
                        <User className="h-3 w-3" /> Penerima
                      </span>
                      <p className="font-semibold text-base text-stone-900">{item.pelanggan}</p>
                      <a href={`tel:${item.telepon}`} className="text-sm text-stone-600 flex items-center gap-1 mt-1 hover:text-blue-600">
                        <Phone className="h-3 w-3" /> {item.telepon}
                      </a>
                    </div>
                    
                    <div className="bg-stone-50 p-3 rounded-md">
                      <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-stone-500 tracking-wider mb-1">
                        <MapPin className="h-3 w-3" /> Alamat Tujuan
                      </span>
                      <p className="text-sm text-stone-800 leading-snug">{item.alamat}</p>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <Link href="/kurir/pengiriman" className="flex-1">
                       <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                         <PackageCheck className="h-4 w-4 mr-2" /> Kelola & Selesaikan
                       </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
