"use server";

import prisma from "@/lib/prisma";
import { type PengirimanUpdateInput } from "@/lib/validations";
import { uploadImage } from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";

export async function createPengiriman(idPesan: string, idUser: string) {
  try {
    // Check if pengiriman already exists for this order
    const existing = await prisma.pengiriman.findUnique({
      where: { idPesan: BigInt(idPesan) },
    });

    if (existing) {
      return { success: false, error: "Pengiriman sudah ada untuk pesanan ini" };
    }

    await prisma.pengiriman.create({
      data: {
        idPesan: BigInt(idPesan),
        idUser: BigInt(idUser),
        tglKirim: new Date(),
      },
    });

    // Update pemesanan status
    await prisma.pemesanan.update({
      where: { id: BigInt(idPesan) },
      data: { statusPesan: "MenungguKurir" },
    });

    revalidatePath("/kurir/pengiriman");
    revalidatePath("/admin/pesanan");
    return { success: true, message: "Pengiriman berhasil dibuat" };
  } catch (error) {
    console.error("Create pengiriman error:", error);
    return { success: false, error: "Terjadi kesalahan saat membuat pengiriman" };
  }
}

export async function getPengirimanByKurir(idUser: string) {
  try {
    const pengirimans = await prisma.pengiriman.findMany({
      where: { idUser: BigInt(idUser) },
      include: {
        pemesanan: {
          include: {
            pelanggan: {
              select: {
                namaPelanggan: true,
                telepon: true,
                alamat1: true,
                alamat2: true,
                alamat3: true,
              },
            },
            detailPemesanans: {
              include: {
                paket: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: pengirimans.map((p) => ({
        ...p,
        id: p.id.toString(),
        idPesan: p.idPesan.toString(),
        idUser: p.idUser.toString(),
        pemesanan: {
          ...p.pemesanan,
          id: p.pemesanan.id.toString(),
          idPelanggan: p.pemesanan.idPelanggan.toString(),
          idJenisBayar: p.pemesanan.idJenisBayar.toString(),
          totalBayar: Number(p.pemesanan.totalBayar),
          detailPemesanans: p.pemesanan.detailPemesanans.map((d) => ({
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
        },
      })),
    };
  } catch (error) {
    console.error("Get pengiriman error:", error);
    return { success: false, error: "Terjadi kesalahan", data: [] };
  }
}

export async function getAllPengiriman() {
  try {
    const pengirimans = await prisma.pengiriman.findMany({
      include: {
        user: {
          select: {
            name: true,
          },
        },
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
      data: pengirimans.map((p) => ({
        ...p,
        id: p.id.toString(),
        idPesan: p.idPesan.toString(),
        idUser: p.idUser.toString(),
        pemesanan: {
          ...p.pemesanan,
          id: p.pemesanan.id.toString(),
          idPelanggan: p.pemesanan.idPelanggan.toString(),
          idJenisBayar: p.pemesanan.idJenisBayar.toString(),
          totalBayar: Number(p.pemesanan.totalBayar),
        },
      })),
    };
  } catch (error) {
    console.error("Get all pengiriman error:", error);
    return { success: false, error: "Terjadi kesalahan", data: [] };
  }
}

export async function updatePengiriman(
  id: string,
  data: PengirimanUpdateInput,
  buktiFotoBase64?: string
) {
  try {
    let buktiFotoUrl = data.buktiFoto;

    // Upload bukti foto if provided
    if (buktiFotoBase64 && buktiFotoBase64.startsWith("data:image")) {
      buktiFotoUrl = await uploadImage(buktiFotoBase64, "mangan/pengiriman");
    }

    await prisma.pengiriman.update({
      where: { id: BigInt(id) },
      data: {
        statusKirim: data.statusKirim,
        tglKirim: data.tglKirim ? new Date(data.tglKirim) : undefined,
        tglTiba: data.tglTiba ? new Date(data.tglTiba) : undefined,
        buktiFoto: buktiFotoUrl,
      },
    });

    revalidatePath("/kurir/pengiriman");
    revalidatePath("/pelanggan/pesanan");
    revalidatePath("/admin/pesanan");
    return { success: true, message: "Pengiriman berhasil diupdate" };
  } catch (error) {
    console.error("Update pengiriman error:", error);
    return { success: false, error: "Terjadi kesalahan saat update pengiriman" };
  }
}

export async function getPengirimanMenunggu() {
  try {
    const pemesanans = await prisma.pemesanan.findMany({
      where: {
        statusPesan: "MenungguKurir",
        pengiriman: null,
      },
      include: {
        pelanggan: {
          select: {
            namaPelanggan: true,
            telepon: true,
            alamat1: true,
          },
        },
        detailPemesanans: {
          include: {
            paket: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
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
      })),
    };
  } catch (error) {
    console.error("Get pengiriman menunggu error:", error);
    return { success: false, error: "Terjadi kesalahan", data: [] };
  }
}
