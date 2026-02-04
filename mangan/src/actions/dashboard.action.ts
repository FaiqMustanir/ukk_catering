"use server";

import prisma from "@/lib/prisma";

export async function getDashboardStats() {
  try {
    const [
      totalPesanan,
      totalPelanggan,
      totalPaket,
      pesananMenunggu,
      pesananProses,
      pesananSelesai,
      totalPendapatan,
    ] = await Promise.all([
      prisma.pemesanan.count(),
      prisma.pelanggan.count(),
      prisma.paket.count(),
      prisma.pemesanan.count({ where: { statusPesan: "MenungguKonfirmasi" } }),
      prisma.pemesanan.count({ where: { statusPesan: "SedangDiproses" } }),
      // Pesanan selesai = pengiriman sudah TibaDitujuan
      prisma.pengiriman.count({ where: { statusKirim: "TibaDitujuan" } }),
      // Total pendapatan dari pengiriman yang sudah tiba
      prisma.pemesanan.aggregate({
        where: { pengiriman: { statusKirim: "TibaDitujuan" } },
        _sum: { totalBayar: true },
      }),
    ]);

    return {
      success: true,
      data: {
        totalPesanan,
        totalPelanggan,
        totalPaket,
        pesananMenunggu,
        pesananProses,
        pesananSelesai,
        totalPendapatan: Number(totalPendapatan._sum.totalBayar || 0),
      },
    };
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    return { success: false, error: "Terjadi kesalahan" };
  }
}

export async function getPaketTerlaris(limit: number = 5) {
  try {
    const paketStats = await prisma.detailPemesanan.groupBy({
      by: ["idPaket"],
      _count: { idPaket: true },
      orderBy: { _count: { idPaket: "desc" } },
      take: limit,
    });

    const paketIds = paketStats.map((p) => p.idPaket);

    const pakets = await prisma.paket.findMany({
      where: { id: { in: paketIds } },
    });

    const result = paketStats.map((stat) => {
      const paket = pakets.find((p) => p.id === stat.idPaket);
      return {
        id: stat.idPaket.toString(),
        namaPaket: paket?.namaPaket || "Unknown",
        hargaPaket: paket?.hargaPaket || 0,
        jenis: paket?.jenis || "Prasmanan",
        kategori: paket?.kategori || "Pernikahan",
        jumlahTerjual: stat._count.idPaket,
      };
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Get paket terlaris error:", error);
    return { success: false, error: "Terjadi kesalahan", data: [] };
  }
}

export async function getPendapatanBulanan(year: number = new Date().getFullYear()) {
  try {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const pemesanans = await prisma.pemesanan.findMany({
      where: {
        pengiriman: { statusKirim: "TibaDitujuan" },
        tglPesan: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        tglPesan: true,
        totalBayar: true,
      },
    });

    // Group by month
    const monthlyData: Record<number, number> = {};
    for (let i = 0; i < 12; i++) {
      monthlyData[i] = 0;
    }

    pemesanans.forEach((p) => {
      const month = new Date(p.tglPesan).getMonth();
      monthlyData[month] += Number(p.totalBayar);
    });

    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    const result = Object.entries(monthlyData).map(([month, total]) => ({
      bulan: months[parseInt(month)],
      pendapatan: total,
    }));

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Get pendapatan bulanan error:", error);
    return { success: false, error: "Terjadi kesalahan", data: [] };
  }
}

// Get pesanan yang sudah diproses tapi belum di-assign kurir
export async function getPesananMenungguKurir() {
  try {
    // Pesanan yang statusnya "SedangDiproses" dan belum ada pengiriman
    const pesanan = await prisma.pemesanan.findMany({
      where: {
        statusPesan: "SedangDiproses",
        pengiriman: null,
      },
      include: {
        pelanggan: {
          select: {
            namaPelanggan: true,
            alamat1: true,
          },
        },
      },
      orderBy: { tglPesan: "asc" },
      take: 10,
    });

    return {
      success: true,
      data: pesanan.map((p) => ({
        id: p.id.toString(),
        pelanggan: p.pelanggan.namaPelanggan,
        alamat: p.pelanggan.alamat1 || "-",
        tanggal: p.tglPesan,
      })),
    };
  } catch (error) {
    console.error("Get pesanan menunggu kurir error:", error);
    return { success: false, error: "Terjadi kesalahan", data: [] };
  }
}

// Get pengiriman untuk kurir tertentu
export async function getPengirimanKurir(idKurir: string) {
  try {
    const pengiriman = await prisma.pengiriman.findMany({
      where: {
        idUser: BigInt(idKurir),
        statusKirim: { not: "TibaDitujuan" },
      },
      include: {
        pemesanan: {
          include: {
            pelanggan: {
              select: {
                namaPelanggan: true,
                telepon: true,
                alamat1: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: pengiriman.map((p) => ({
        id: p.id.toString(),
        idPesan: p.idPesan.toString(),
        pelanggan: p.pemesanan.pelanggan.namaPelanggan,
        telepon: p.pemesanan.pelanggan.telepon || "-",
        alamat: p.pemesanan.pelanggan.alamat1 || "-",
        status: p.statusKirim,
        tglKirim: p.tglKirim,
      })),
    };
  } catch (error) {
    console.error("Get pengiriman kurir error:", error);
    return { success: false, error: "Terjadi kesalahan", data: [] };
  }
}

// Get stats khusus untuk kurir
export async function getKurirStats(idKurir: string) {
  try {
    const [totalTugas, sedangDikirim, selesai] = await Promise.all([
      prisma.pengiriman.count({ where: { idUser: BigInt(idKurir) } }),
      prisma.pengiriman.count({ where: { idUser: BigInt(idKurir), statusKirim: "SedangDikirim" } }),
      prisma.pengiriman.count({ where: { idUser: BigInt(idKurir), statusKirim: "TibaDitujuan" } }),
    ]);

    return {
      success: true,
      data: {
        totalTugas,
        sedangDikirim,
        selesai,
      },
    };
  } catch (error) {
    console.error("Get kurir stats error:", error);
    return { success: false, error: "Terjadi kesalahan" };
  }
}
