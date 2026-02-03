import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDashboardStats, getPesananMenungguKurir } from "@/actions/dashboard.action";
import { Package, ShoppingBag, Clock, Truck, Plus, LayoutList, Users, UserCheck, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session || session.user.type !== "user") {
    redirect("/admin/login");
  }

  const [statsResult, pesananKurirResult] = await Promise.all([
    getDashboardStats(),
    getPesananMenungguKurir(),
  ]);

  const stats = statsResult.data;
  const pesananMenungguKurir = pesananKurirResult?.data || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-stone-900">Dashboard Admin</h1>
          <p className="text-stone-500 mt-1">Kelola paket menu dan assign kurir pengiriman.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/paket/create">
            <Button className="bg-stone-800 hover:bg-stone-700 text-stone-50 gap-2">
              <Plus className="h-4 w-4" /> Tambah Paket
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-stone-200 shadow-sm bg-white">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full bg-blue-50 p-4 text-blue-600">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500">Total Paket Menu</p>
              <p className="text-2xl font-bold text-stone-900">{stats?.totalPaket || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-stone-200 shadow-sm bg-white">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full bg-yellow-50 p-4 text-yellow-600">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500">Menunggu Konfirmasi</p>
              <p className="text-2xl font-bold text-stone-900">{stats?.pesananMenunggu || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-stone-200 shadow-sm bg-white">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full bg-orange-50 p-4 text-orange-600">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500">Perlu Assign Kurir</p>
              <p className="text-2xl font-bold text-stone-900">{pesananMenungguKurir.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-stone-200 shadow-sm bg-white">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full bg-green-50 p-4 text-green-600">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500">Total Pesanan</p>
              <p className="text-2xl font-bold text-stone-900">{stats?.totalPesanan || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Pesanan Butuh Assign Kurir */}
        <Card className="border-stone-200 shadow-sm border-l-4 border-l-orange-400">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-serif text-stone-800 flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-orange-500" /> Assign Kurir
            </CardTitle>
            <Link href="/admin/pesanan">
              <Button variant="ghost" size="sm" className="text-stone-500 gap-1">
                Lihat Semua <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {pesananMenungguKurir.length === 0 ? (
              <div className="text-center py-8 text-stone-400">
                <Truck className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Semua pesanan sudah di-assign kurir.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pesananMenungguKurir.slice(0, 4).map((pesanan) => (
                  <div key={pesanan.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg border border-stone-100">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-stone-400">#{pesanan.id}</span>
                        <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">Butuh Kurir</Badge>
                      </div>
                      <p className="font-medium text-stone-800 mt-1">{pesanan.pelanggan}</p>
                      <p className="text-xs text-stone-500 truncate max-w-[200px]">{pesanan.alamat}</p>
                    </div>
                    <Link href={`/admin/pesanan/${pesanan.id}/assign`}>
                      <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                        Assign
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Management Shortcuts */}
        <Card className="border-stone-200 shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif text-stone-800">Manajemen</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Link href="/admin/paket" className="flex items-center justify-between p-4 rounded-lg border border-stone-100 bg-stone-50 hover:bg-stone-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-md shadow-sm text-stone-700"><LayoutList className="h-5 w-5" /></div>
                <div>
                  <p className="font-semibold text-stone-900">Daftar Paket Menu</p>
                  <p className="text-xs text-stone-500">Tambah, edit, hapus paket catering</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-stone-400" />
            </Link>
            <Link href="/admin/pesanan" className="flex items-center justify-between p-4 rounded-lg border border-stone-100 bg-stone-50 hover:bg-stone-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-md shadow-sm text-stone-700"><ShoppingBag className="h-5 w-5" /></div>
                <div>
                  <p className="font-semibold text-stone-900">Kelola Pesanan</p>
                  <p className="text-xs text-stone-500">Konfirmasi & assign kurir</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-stone-400" />
            </Link>
            <Link href="/admin/user" className="flex items-center justify-between p-4 rounded-lg border border-stone-100 bg-stone-50 hover:bg-stone-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-md shadow-sm text-stone-700"><Users className="h-5 w-5" /></div>
                <div>
                  <p className="font-semibold text-stone-900">Kelola User</p>
                  <p className="text-xs text-stone-500">Admin, Owner, Kurir</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-stone-400" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
