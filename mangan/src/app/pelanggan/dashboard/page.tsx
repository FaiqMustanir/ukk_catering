import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Package, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { getPemesananByPelanggan } from "@/actions/pemesanan.action";
import { formatCurrency, getStatusLabel, getStatusBadgeColor } from "@/lib/utils";

export default async function PelangganDashboardPage() {
  const session = await auth();

  if (!session || session.user.type !== "pelanggan") {
    redirect("/login");
  }

  const { data: pesanans } = await getPemesananByPelanggan(session.user.id);

  const stats = {
    total: pesanans?.length || 0,
    menunggu: pesanans?.filter((p) => p.statusPesan === "MenungguKonfirmasi").length || 0,
    proses: pesanans?.filter((p) => p.statusPesan === "SedangDiproses" || p.statusPesan === "MenungguKurir").length || 0,
    selesai: pesanans?.filter((p) => p.pengiriman?.statusKirim === "TibaDitujuan").length || 0,
  };

  const recentOrders = pesanans?.slice(0, 5) || [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="text-gray-600">Selamat datang, {session.user.name}!</p>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full bg-blue-100 p-3">
              <ShoppingBag className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Pesanan</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full bg-yellow-100 p-3">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Menunggu</p>
              <p className="text-2xl font-bold">{stats.menunggu}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full bg-purple-100 p-3">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Diproses</p>
              <p className="text-2xl font-bold">{stats.proses}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Selesai</p>
              <p className="text-2xl font-bold">{stats.selesai}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">Aksi Cepat</h2>
        <div className="mt-4 flex flex-wrap gap-4">
          <Link href="/menu">
            <Button>Pesan Catering</Button>
          </Link>
          <Link href="/pelanggan/pesanan">
            <Button variant="outline">Lihat Pesanan</Button>
          </Link>
          <Link href="/pelanggan/profile">
            <Button variant="outline">Edit Profil</Button>
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Pesanan Terbaru</h2>
          <Link href="/pelanggan/pesanan">
            <Button variant="ghost" size="sm">
              Lihat Semua
            </Button>
          </Link>
        </div>

        <Card className="mt-4">
          {recentOrders.length > 0 ? (
            <div className="divide-y">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{order.noResi}</p>
                    <p className="text-sm text-gray-600">
                      {order.detailPemesanans.length} item • {formatCurrency(order.totalBayar)}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeColor(order.statusPesan)}`}>
                    {getStatusLabel(order.statusPesan)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <CardContent className="py-12 text-center">
              <ShoppingBag className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-4 text-gray-600">Belum ada pesanan</p>
              <Link href="/menu" className="mt-4 inline-block">
                <Button>Pesan Sekarang</Button>
              </Link>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
