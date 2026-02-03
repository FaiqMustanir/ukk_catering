import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPaketTerlaris } from "@/actions/dashboard.action";
import { formatCurrency } from "@/lib/utils";
import { Award, Package, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function OwnerPaketTerlarisPage() {
  const session = await auth();

  if (!session || session.user.type !== "user" || session.user.role !== "owner") {
    redirect("/admin/login");
  }

  const terlarisResult = await getPaketTerlaris();
  const paketTerlaris = terlarisResult.data || [];

  // Calculate total sold
  const totalTerjual = paketTerlaris.reduce((sum, p) => sum + p.jumlahTerjual, 0);

  return (
    <div>
      <div className="flex items-center gap-2">
        <Award className="h-6 w-6 text-orange-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paket Terlaris</h1>
          <p className="text-gray-600">Menu catering yang paling diminati</p>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Total Paket</p>
            <p className="text-2xl font-bold">{paketTerlaris.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Total Terjual</p>
            <p className="text-2xl font-bold text-orange-600">{totalTerjual}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Paket Teratas</p>
            <p className="text-lg font-bold text-green-600">
              {paketTerlaris[0]?.namaPaket || "-"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top 3 Highlight */}
      {paketTerlaris.length >= 3 && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold">Top 3 Paket Terlaris</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {paketTerlaris.slice(0, 3).map((paket, index) => (
              <Card
                key={paket.id}
                className={`relative overflow-hidden ${
                  index === 0
                    ? "border-yellow-300 bg-yellow-50"
                    : index === 1
                    ? "border-gray-300 bg-gray-50"
                    : "border-orange-200 bg-orange-50"
                }`}
              >
                <div
                  className={`absolute right-0 top-0 px-3 py-1 text-xs font-bold text-white ${
                    index === 0
                      ? "bg-yellow-500"
                      : index === 1
                      ? "bg-gray-500"
                      : "bg-orange-500"
                  }`}
                >
                  #{index + 1}
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl ${
                        index === 0
                          ? "bg-yellow-200"
                          : index === 1
                          ? "bg-gray-200"
                          : "bg-orange-200"
                      }`}
                    >
                      {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                    </div>
                    <div>
                      <h3 className="font-bold">{paket.namaPaket}</h3>
                      <p className="text-sm text-gray-600">{formatCurrency(paket.hargaPaket)}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-gray-600">Terjual</span>
                    <span className="text-2xl font-bold">{paket.jumlahTerjual}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="outline">{paket.jenis}</Badge>
                    <Badge variant="outline">{paket.kategori}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Full List */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Semua Paket
          </CardTitle>
        </CardHeader>
        <CardContent>
          {paketTerlaris.length > 0 ? (
            <div className="space-y-4">
              {paketTerlaris.map((paket, index) => {
                const maxTerjual = paketTerlaris[0]?.jumlahTerjual || 1;
                const percentage = (paket.jumlahTerjual / maxTerjual) * 100;

                return (
                  <div key={paket.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                            index < 3
                              ? "bg-orange-100 text-orange-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium">{paket.namaPaket}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{formatCurrency(paket.hargaPaket)}</span>
                            <span>•</span>
                            <span>{paket.jenis}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-orange-600">{paket.jumlahTerjual}</p>
                        <p className="text-xs text-gray-500">terjual</p>
                      </div>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-600"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500">Belum ada data penjualan</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
