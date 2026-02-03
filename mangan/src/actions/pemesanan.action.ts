"use server";

import prisma from "@/lib/prisma";
import { pemesananSchema, type PemesananInput, type PemesananStatusUpdateInput } from "@/lib/validations";
import { generateNoResi } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function createPemesanan(idPelanggan: string, data: PemesananInput) {
  try {
    const validated = pemesananSchema.parse(data);

    // Calculate total
    const totalBayar = validated.items.reduce((sum, item) => sum + item.subtotal, 0);

    // Generate no resi
    const noResi = generateNoResi();

    // Create pemesanan with details
    const pemesanan = await prisma.pemesanan.create({
      data: {
        idPelanggan: BigInt(idPelanggan),
        idJenisBayar: BigInt(validated.idJenisBayar),
        noResi,
        tglPesan: new Date(),
        totalBayar: BigInt(totalBayar),
        detailPemesanans: {
          create: validated.items.map((item) => ({
            idPaket: BigInt(item.idPaket),
            subtotal: BigInt(item.subtotal),
          })),
        },
      },
    });

    revalidatePath("/pelanggan/pesanan");
    revalidatePath("/admin/pesanan");
    return { 
      success: true, 
      message: "Pesanan berhasil dibuat",
      noResi,
      id: pemesanan.id.toString(),
    };
  } catch (error) {
    console.error("Create pemesanan error:", error);
    return { success: false, error: "Terjadi kesalahan saat membuat pesanan" };
  }
}

export async function getPemesananByPelanggan(idPelanggan: string) {
  try {
    const pemesanans = await prisma.pemesanan.findMany({
      where: { idPelanggan: BigInt(idPelanggan) },
      include: {
        jenisPembayaran: true,
        detailPemesanans: {
          include: {
            paket: true,
          },
        },
        pengiriman: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: pemesanans.map((p) => ({
        ...p,
        id: p.id.toString(),
        idPelanggan: p.idPelanggan.toString(),
        idJenisBayar: p.idJenisBayar.toString(),
        totalBayar: Number(p.totalBayar),
        detailPemesanans: p.detailPemesanans.map((d) => ({
          ...d,
          id: d.id.toString(),
          idPemesanan: d.idPemesanan.toString(),
          idPaket: d.idPaket.toString(),
          subtotal: Number(d.subtotal),
          paket: {
            ...d.paket,
            id: d.paket.id.toString(),
          },
        })),
        pengiriman: p.pengiriman
          ? {
              ...p.pengiriman,
              id: p.pengiriman.id.toString(),
              idPesan: p.pengiriman.idPesan.toString(),
              idUser: p.pengiriman.idUser.toString(),
            }
          : null,
        jenisPembayaran: {
          ...p.jenisPembayaran,
          id: p.jenisPembayaran.id.toString(),
        },
      })),
    };
  } catch (error) {
    console.error("Get pemesanan error:", error);
    return { success: false, error: "Terjadi kesalahan", data: [] };
  }
}

export async function getAllPemesanan() {
  try {
    const pemesanans = await prisma.pemesanan.findMany({
      include: {
        pelanggan: {
          select: {
            namaPelanggan: true,
            email: true,
            telepon: true,
            alamat1: true,
          },
        },
        jenisPembayaran: true,
        detailPemesanans: {
          include: {
            paket: true,
          },
        },
        pengiriman: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: pemesanans.map((p) => ({
        ...p,
        id: p.id.toString(),
        idPelanggan: p.idPelanggan.toString(),
        idJenisBayar: p.idJenisBayar.toString(),
        totalBayar: Number(p.totalBayar),
        detailPemesanans: p.detailPemesanans.map((d) => ({
          ...d,
          id: d.id.toString(),
          idPemesanan: d.idPemesanan.toString(),
          idPaket: d.idPaket.toString(),
          subtotal: Number(d.subtotal),
          paket: {
            ...d.paket,
            id: d.paket.id.toString(),
          },
        })),
        pengiriman: p.pengiriman
          ? {
              ...p.pengiriman,
              id: p.pengiriman.id.toString(),
              idPesan: p.pengiriman.idPesan.toString(),
              idUser: p.pengiriman.idUser.toString(),
            }
          : null,
        jenisPembayaran: {
          ...p.jenisPembayaran,
          id: p.jenisPembayaran.id.toString(),
        },
      })),
    };
  } catch (error) {
    console.error("Get all pemesanan error:", error);
    return { success: false, error: "Terjadi kesalahan", data: [] };
  }
}

export async function updatePemesananStatus(id: string, data: PemesananStatusUpdateInput) {
  try {
    await prisma.pemesanan.update({
      where: { id: BigInt(id) },
      data: {
        statusPesan: data.statusPesan,
      },
    });

    revalidatePath("/pelanggan/pesanan");
    revalidatePath("/admin/pesanan");
    return { success: true, message: "Status pesanan berhasil diupdate" };
  } catch (error) {
    console.error("Update status error:", error);
    return { success: false, error: "Terjadi kesalahan saat update status" };
  }
}

export async function getPemesananById(id: string) {
  try {
    const pemesanan = await prisma.pemesanan.findUnique({
      where: { id: BigInt(id) },
      include: {
        pelanggan: true,
        jenisPembayaran: {
          include: {
            detailJenisPembayarans: true,
          },
        },
        detailPemesanans: {
          include: {
            paket: true,
          },
        },
        pengiriman: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!pemesanan) {
      return { success: false, error: "Pesanan tidak ditemukan" };
    }

    return {
      success: true,
      data: {
        ...pemesanan,
        id: pemesanan.id.toString(),
        idPelanggan: pemesanan.idPelanggan.toString(),
        idJenisBayar: pemesanan.idJenisBayar.toString(),
        totalBayar: Number(pemesanan.totalBayar),
        pelanggan: {
          ...pemesanan.pelanggan,
          id: pemesanan.pelanggan.id.toString(),
        },
        detailPemesanans: pemesanan.detailPemesanans.map((d) => ({
          ...d,
          id: d.id.toString(),
          idPemesanan: d.idPemesanan.toString(),
          idPaket: d.idPaket.toString(),
          subtotal: Number(d.subtotal),
          paket: {
            ...d.paket,
            id: d.paket.id.toString(),
          },
        })),
        pengiriman: pemesanan.pengiriman
          ? {
              ...pemesanan.pengiriman,
              id: pemesanan.pengiriman.id.toString(),
              idPesan: pemesanan.pengiriman.idPesan.toString(),
              idUser: pemesanan.pengiriman.idUser.toString(),
            }
          : null,
        jenisPembayaran: {
          ...pemesanan.jenisPembayaran,
          id: pemesanan.jenisPembayaran.id.toString(),
          detailJenisPembayarans: pemesanan.jenisPembayaran.detailJenisPembayarans.map((d) => ({
            ...d,
            id: d.id.toString(),
            idJenisPembayaran: d.idJenisPembayaran.toString(),
          })),
        },
      },
    };
  } catch (error) {
    console.error("Get pemesanan by id error:", error);
    return { success: false, error: "Terjadi kesalahan" };
  }
}
