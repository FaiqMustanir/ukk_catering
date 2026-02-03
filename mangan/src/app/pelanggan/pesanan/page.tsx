import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Eye, Truck } from "lucide-react";
import { getPemesananByPelanggan } from "@/actions/pemesanan.action";
import { formatCurrency, formatDateTime, getStatusLabel, getStatusBadgeColor } from "@/lib/utils";

export default async function PesananPage() {
  const session = await auth();

  if (!session || session.user.type !== "pelanggan") {
    redirect("/login");
  }

  const { data: pesanans } = await getPemesananByPelanggan(session.user.id);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Pesanan Saya</h1>
      <p className="text-gray-600">Riwayat dan status pesanan Anda</p>

      <div className="mt-6 space-y-4">
        {pesanans && pesanans.length > 0 ? (
          pesanans.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{order.noResi}</h3>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeColor(order.statusPesan)}`}>
                        {getStatusLabel(order.statusPesan)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {formatDateTime(order.tglPesan)}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-orange-600">
                    {formatCurrency(order.totalBayar)}
                  </p>
                </div>

                <div className="mt-4 border-t pt-4">
                  <p className="text-sm text-gray-600">Item Pesanan:</p>
                  <div className="mt-2 space-y-2">
                    {order.detailPemesanans.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.paket.namaPaket}</span>
                        <span className="text-gray-600">{formatCurrency(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {order.pengiriman && (
                  <div className="mt-4 border-t pt-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Truck className="h-4 w-4 text-gray-500" />
                      <span>
                        Kurir: {order.pengiriman.user?.name} - 
                        <Badge variant={order.pengiriman.statusKirim === "TibaDitujuan" ? "success" : "info"} className="ml-2">
                          {getStatusLabel(order.pengiriman.statusKirim)}
                        </Badge>
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <Link href={`/pelanggan/pesanan/${order.id}`}>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Eye className="h-4 w-4" />
                      Detail
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingBag className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-4 text-gray-600">Belum ada pesanan</p>
              <Link href="/menu" className="mt-4 inline-block">
                <Button>Pesan Sekarang</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
