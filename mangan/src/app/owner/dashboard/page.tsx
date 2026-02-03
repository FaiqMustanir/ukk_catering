import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDashboardStats, getPaketTerlaris, getPendapatanBulanan } from "@/actions/dashboard.action";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, DollarSign, Users, ShoppingBag, BarChart3, Download, Calendar, Package } from "lucide-react";

export default async function OwnerDashboardPage() {
  const session = await auth();

  if (!session || session.user.type !== "user") {
    redirect("/admin/login");
  }

  const [statsResult, terlarisResult, pendapatanResult] = await Promise.all([
    getDashboardStats(),
    getPaketTerlaris(),
    getPendapatanBulanan(),
  ]);

  const stats = statsResult.data;
  const paketTerlaris = terlarisResult.data || [];
  const pendapatanBulanan = pendapatanResult.data || [];

  // Hitung total pendapatan tahun ini
  const totalPendapatanTahun = pendapatanBulanan.reduce((acc, curr) => acc + curr.pendapatan, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-stone-900">Dashboard Owner</h1>
          <p className="text-stone-500 mt-1">Monitoring performa bisnis dan laporan.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-stone-200 text-stone-700 hover:bg-stone-50 gap-2">
            <Calendar className="h-4 w-4" /> Tahun {new Date().getFullYear()}
          </Button>
          <Button className="bg-stone-800 hover:bg-stone-700 text-stone-50 gap-2">
            <Download className="h-4 w-4" /> Unduh Laporan
          </Button>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-stone-200 shadow-md bg-stone-900 text-stone-50 sm:col-span-2 lg:col-span-1">
          <CardContent className="flex flex-col justify-between p-6 h-full">
            <div>
              <p className="text-sm font-medium text-stone-300">Total Pendapatan</p>
              <h3 className="text-2xl font-bold mt-2">{formatCurrency(stats?.totalPendapatan || 0)}</h3>
            </div>
            <div className="flex items-center gap-2 mt-4 text-green-400 text-sm">
              <TrendingUp className="h-4 w-4" />
              <span>Dari pesanan selesai</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-stone-200 shadow-sm bg-white">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full bg-blue-50 p-4 text-blue-600">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500">Total Pesanan</p>
              <p className="text-2xl font-bold text-stone-900">{stats?.totalPesanan || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-stone-200 shadow-sm bg-white">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full bg-emerald-50 p-4 text-emerald-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500">Total Pelanggan</p>
              <p className="text-2xl font-bold text-stone-900">{stats?.totalPelanggan || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-stone-200 shadow-sm bg-white">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full bg-purple-50 p-4 text-purple-600">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500">Total Paket Menu</p>
              <p className="text-2xl font-bold text-stone-900">{stats?.totalPaket || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Pendapatan Bulanan Chart */}
        <Card className="lg:col-span-2 border-stone-200 shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif text-stone-800 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" /> Pendapatan Bulanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendapatanBulanan.slice(0, 6).map((item, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-stone-700 w-20">{item.bulan}</span>
                    <span className="text-stone-500">{formatCurrency(item.pendapatan)}</span>
                  </div>
                  <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-stone-600 rounded-full transition-all" 
                      style={{ width: `${totalPendapatanTahun > 0 ? Math.max((item.pendapatan / (Math.max(...pendapatanBulanan.map(p => p.pendapatan)) || 1)) * 100, 2) : 0}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              {pendapatanBulanan.every(p => p.pendapatan === 0) && (
                <p className="text-sm text-stone-400 text-center py-4">Belum ada data pendapatan.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Selling Menus */}
        <Card className="border-stone-200 shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif text-stone-800 text-lg">Menu Terlaris</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paketTerlaris.length === 0 ? (
                <p className="text-sm text-stone-500 text-center py-4">Belum ada data penjualan.</p>
              ) : (
                paketTerlaris.map((item, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-stone-100 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-xs font-bold text-stone-600">
                        #{i + 1}
                      </div>
                      <div>
                        <p className="font-medium text-stone-900 text-sm">{item.namaPaket}</p>
                        <p className="text-xs text-stone-500">{item.jumlahTerjual} terjual</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      <Card className="border-stone-200 shadow-sm">
        <CardHeader>
          <CardTitle className="font-serif text-stone-800">Ringkasan Status Pesanan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-700">{stats?.pesananMenunggu || 0}</p>
              <p className="text-xs text-yellow-600 mt-1">Menunggu Konfirmasi</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-700">{stats?.pesananProses || 0}</p>
              <p className="text-xs text-blue-600 mt-1">Sedang Diproses</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-700">{stats?.pesananSelesai || 0}</p>
              <p className="text-xs text-green-600 mt-1">Selesai</p>
            </div>
            <div className="text-center p-4 bg-stone-100 rounded-lg">
              <p className="text-2xl font-bold text-stone-700">{stats?.totalPesanan || 0}</p>
              <p className="text-xs text-stone-600 mt-1">Total Semua</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
