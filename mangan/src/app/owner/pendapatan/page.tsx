import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPendapatanBulanan, getDashboardStats } from "@/actions/dashboard.action";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, TrendingUp, TrendingDown, Calendar } from "lucide-react";

export default async function OwnerPendapatanPage() {
  const session = await auth();

  if (!session || session.user.type !== "user" || session.user.role !== "owner") {
    redirect("/admin/login");
  }

  const [pendapatanResult, statsResult] = await Promise.all([
    getPendapatanBulanan(),
    getDashboardStats(),
  ]);

  const pendapatanBulanan = pendapatanResult.data || [];
  const stats = statsResult.data;

  // Calculate totals and averages
  const totalPendapatan = pendapatanBulanan.reduce((sum, p) => sum + p.pendapatan, 0);
  const avgPendapatan =
    pendapatanBulanan.length > 0 ? totalPendapatan / pendapatanBulanan.length : 0;

  // Find best and worst month
  const sortedByPendapatan = [...pendapatanBulanan].sort(
    (a, b) => b.pendapatan - a.pendapatan
  );
  const bestMonth = sortedByPendapatan[0];
  const worstMonth = sortedByPendapatan[sortedByPendapatan.length - 1];

  // Calculate growth trends
  const getGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        <DollarSign className="h-6 w-6 text-green-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan Pendapatan</h1>
          <p className="text-gray-600">Analisis pendapatan bulanan</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Total Pendapatan</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(stats?.totalPendapatan || 0)}
            </p>
            <p className="mt-1 text-xs text-gray-500">Dari pesanan selesai</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Rata-rata/Bulan</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(avgPendapatan)}</p>
            <p className="mt-1 text-xs text-gray-500">{pendapatanBulanan.length} bulan data</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Bulan Terbaik</p>
            <p className="text-lg font-bold">{bestMonth?.bulan || "-"}</p>
            <p className="text-sm text-yellow-600">
              {bestMonth ? formatCurrency(bestMonth.pendapatan) : "-"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Rata-rata/Pesanan</p>
            <p className="text-2xl font-bold text-orange-600">
              {formatCurrency(
                (stats?.totalPesanan || 0) > 0
                  ? (stats?.totalPendapatan || 0) / (stats?.totalPesanan || 1)
                  : 0
              )}
            </p>
            <p className="mt-1 text-xs text-gray-500">{stats?.totalPesanan || 0} pesanan</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Chart */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Pendapatan per Bulan ({new Date().getFullYear()})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendapatanBulanan.length > 0 ? (
            <div className="space-y-4">
              {pendapatanBulanan.map((item, index) => {
                const maxPendapatan = Math.max(...pendapatanBulanan.map((p) => p.pendapatan));
                const percentage =
                  maxPendapatan > 0 ? (item.pendapatan / maxPendapatan) * 100 : 0;
                const previousPendapatan = pendapatanBulanan[index + 1]?.pendapatan || 0;
                const growth = getGrowth(item.pendapatan, previousPendapatan);

                return (
                  <div key={item.bulan} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-20 text-sm font-medium">{item.bulan}</span>
                        {index < pendapatanBulanan.length - 1 && (
                          <div
                            className={`flex items-center gap-1 text-xs ${
                              growth >= 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {growth >= 0 ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            {growth >= 0 ? "+" : ""}
                            {growth.toFixed(1)}%
                          </div>
                        )}
                      </div>
                      <span className="font-bold">{formatCurrency(item.pendapatan)}</span>
                    </div>
                    <div className="h-4 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full transition-all ${
                          index === 0
                            ? "bg-gradient-to-r from-green-400 to-green-600"
                            : "bg-gradient-to-r from-blue-300 to-blue-500"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500">Belum ada data pendapatan</p>
          )}
        </CardContent>
      </Card>

      {/* Comparison */}
      {pendapatanBulanan.length >= 2 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-100 p-3">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-green-700">Pendapatan Bulan Ini</p>
                  <p className="text-2xl font-bold text-green-800">
                    {formatCurrency(pendapatanBulanan[0]?.pendapatan || 0)}
                  </p>
                  <p className="text-sm text-green-600">{pendapatanBulanan[0]?.bulan}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-100 p-3">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-blue-700">Pendapatan Bulan Lalu</p>
                  <p className="text-2xl font-bold text-blue-800">
                    {formatCurrency(pendapatanBulanan[1]?.pendapatan || 0)}
                  </p>
                  <p className="text-sm text-blue-600">{pendapatanBulanan[1]?.bulan}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Insights */}
      <Card className="mt-6 border-indigo-200 bg-indigo-50">
        <CardContent className="p-6">
          <h3 className="font-semibold text-indigo-900">Insight</h3>
          <ul className="mt-3 space-y-2 text-sm text-indigo-800">
            {pendapatanBulanan.length > 0 && (
              <>
                <li>
                  • Bulan dengan pendapatan tertinggi adalah <strong>{bestMonth?.bulan}</strong>{" "}
                  dengan total {formatCurrency(bestMonth?.pendapatan || 0)}
                </li>
                {pendapatanBulanan.length >= 2 && (
                  <li>
                    • Dibandingkan bulan lalu,{" "}
                    {getGrowth(
                      pendapatanBulanan[0]?.pendapatan || 0,
                      pendapatanBulanan[1]?.pendapatan || 0
                    ) >= 0 ? (
                      <span className="text-green-700">
                        pendapatan naik{" "}
                        {getGrowth(
                          pendapatanBulanan[0]?.pendapatan || 0,
                          pendapatanBulanan[1]?.pendapatan || 0
                        ).toFixed(1)}
                        %
                      </span>
                    ) : (
                      <span className="text-red-700">
                        pendapatan turun{" "}
                        {Math.abs(
                          getGrowth(
                            pendapatanBulanan[0]?.pendapatan || 0,
                            pendapatanBulanan[1]?.pendapatan || 0
                          )
                        ).toFixed(1)}
                        %
                      </span>
                    )}
                  </li>
                )}
                <li>
                  • Rata-rata pendapatan per pesanan adalah{" "}
                  {formatCurrency(
                    (stats?.totalPesanan || 0) > 0
                      ? (stats?.totalPendapatan || 0) / (stats?.totalPesanan || 1)
                      : 0
                  )}
                </li>
              </>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
