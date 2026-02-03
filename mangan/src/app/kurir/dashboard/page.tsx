import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPengirimanKurir, getKurirStats } from "@/actions/dashboard.action";
import { Truck, MapPin, CheckSquare, Clock, Phone, Navigation, PackageCheck } from "lucide-react";
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
            <div className="divide-y divide-stone-100">
              {pengiriman.map((item) => (
                <div key={item.id} className="p-4 hover:bg-stone-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-2">
                      <Badge 
                        variant={item.status === "SedangDikirim" ? "default" : "secondary"} 
                        className={item.status === "SedangDikirim" ? "bg-blue-600 hover:bg-blue-700" : "bg-stone-200 text-stone-700"}
                      >
                        {item.status === "SedangDikirim" ? "Sedang Diantar" : item.status}
                      </Badge>
                      <span className="text-xs font-mono text-stone-400 flex items-center">#{item.idPesan}</span>
                    </div>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-stone-400">
                      <Navigation className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <h4 className="font-bold text-stone-900">{item.pelanggan}</h4>
                  <div className="flex items-start gap-2 mt-1 text-sm text-stone-600">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-stone-400" />
                    <p>{item.alamat}</p>
                  </div>
                  
                  <div className="flex gap-3 mt-4">
                    <a href={`tel:${item.telepon}`} className="flex-1">
                      <Button size="sm" variant="outline" className="w-full border-stone-300 text-stone-700">
                        <Phone className="h-3 w-3 mr-2" /> {item.telepon}
                      </Button>
                    </a>
                    <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                      <CheckSquare className="h-3 w-3 mr-2" /> Selesai
                    </Button>
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
