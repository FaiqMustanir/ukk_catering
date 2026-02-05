import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, Truck, MapPin, CreditCard, Calendar, Receipt } from "lucide-react";
import { getPemesananById } from "@/actions/pemesanan.action";
import { formatCurrency, formatDateTime, getStatusLabel, getStatusBadgeColor } from "@/lib/utils";
import { UploadBuktiTransfer } from "@/components/pelanggan/upload-bukti-transfer";
import { ViewBuktiKirim } from "@/components/pelanggan/view-bukti-kirim";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PesananDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  if (!session || session.user.type !== "pelanggan") {
    redirect("/login");
  }

  const { success, data: pesanan } = await getPemesananById(id);

  if (!success || !pesanan) {
    notFound();
  }

  // Verify this order belongs to the current user
  if (pesanan.idPelanggan !== session.user.id) {
    redirect("/pelanggan/pesanan");
  }

  return (
    <div>
      <Link href="/pelanggan/pesanan" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Pesanan
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Detail Pesanan</h1>
          <p className="text-gray-600">No. Resi: {pesanan.noResi}</p>
        </div>
        <span className={`rounded-full px-4 py-2 text-sm font-medium ${getStatusBadgeColor(pesanan.statusPesan)}`}>
          {getStatusLabel(pesanan.statusPesan)}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Item Pesanan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {pesanan.detailPemesanans.map((item) => (
                  <div key={item.id} className="flex justify-between py-4 first:pt-0 last:pb-0">
                    <div>
                      <p className="font-medium">{item.paket.namaPaket}</p>
                      <p className="text-sm text-gray-600">
                        {item.paket.jenis} • {item.paket.kategori} • {item.paket.jumlahPax} pax
                      </p>
                    </div>
                    <p className="font-medium text-orange-600">
                      {formatCurrency(item.subtotal)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t pt-4">
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-orange-600">
                    {formatCurrency(pesanan.totalBayar)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Status */}
          {pesanan.pengiriman && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Status Pengiriman
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge variant={pesanan.pengiriman.statusKirim === "TibaDitujuan" ? "success" : "info"}>
                      {getStatusLabel(pesanan.pengiriman.statusKirim)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Kurir:</span>
                    <span className="font-medium">{pesanan.pengiriman.user?.name || "-"}</span>
                  </div>
                  {pesanan.pengiriman.tglKirim && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Tanggal Kirim:</span>
                      <span className="font-medium">{formatDateTime(pesanan.pengiriman.tglKirim)}</span>
                    </div>
                  )}
                  {pesanan.pengiriman.tglTiba && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Tanggal Tiba:</span>
                      <span className="font-medium">{formatDateTime(pesanan.pengiriman.tglTiba)}</span>
                    </div>
                  )}
                  {pesanan.pengiriman.buktiFoto && (
                     <ViewBuktiKirim imageUrl={pesanan.pengiriman.buktiFoto} />
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Info Pesanan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Tanggal Pesan</p>
                  <p className="font-medium">{formatDateTime(pesanan.tglPesan)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Metode Pembayaran</p>
                  <p className="font-medium">{pesanan.jenisPembayaran?.metodePembayaran || "-"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Alamat Pengiriman</p>
                  <p className="font-medium">{pesanan.pelanggan.alamat1 || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Info for Bank/E-Wallet */}
          {pesanan.jenisPembayaran && !pesanan.jenisPembayaran.metodePembayaran.includes("COD") && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-800">Instruksi Pembayaran</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-orange-700 mb-3">
                  Silakan transfer ke rekening berikut:
                </p>
                <div className="rounded-lg bg-white p-4 space-y-2">
                  <p className="font-medium">{pesanan.jenisPembayaran.metodePembayaran}</p>
                  {pesanan.jenisPembayaran.detailJenisPembayarans?.length > 0 && (
                    <div className="space-y-2 border-t pt-2 mt-2">
                      {pesanan.jenisPembayaran.detailJenisPembayarans.map((detail) => (
                        <div key={detail.id} className="text-sm">
                          <p className="font-medium">{detail.tempatBayar}</p>
                          <p className="text-gray-600">No. Rek: {detail.noRek}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-2xl font-bold text-orange-600 pt-2">
                    {formatCurrency(pesanan.totalBayar)}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload Bukti Transfer */}
          <UploadBuktiTransfer
            pesananId={pesanan.id}
            buktiTransfer={pesanan.buktiTransfer}
            metodePembayaran={pesanan.jenisPembayaran?.metodePembayaran || ""}
          />

          {/* COD Info */}
          {pesanan.jenisPembayaran?.metodePembayaran.includes("COD") && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-800">Pembayaran COD</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-700">
                  💵 Siapkan uang tunai sebesar <strong>{formatCurrency(pesanan.totalBayar)}</strong> untuk dibayarkan kepada kurir saat pesanan diterima.
                </p>
              </CardContent>
            </Card>
          )}

          <Link href="/pelanggan/pesanan" className="block">
            <Button variant="outline" className="w-full">
              Kembali ke Daftar Pesanan
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
