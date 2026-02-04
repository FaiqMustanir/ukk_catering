"use server";

import prisma from "@/lib/prisma";
import { type PengirimanUpdateInput } from "@/lib/validations";
import { uploadImage } from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";

export async function createPengiriman(idPesan: string, idUser: string) {
  try {
    console.log("=== CREATE PENGIRIMAN DEBUG ===");
    console.log("idPesan:", idPesan);
    console.log("idUser:", idUser);

    // Validasi input
    if (!idPesan || !idUser) {
      return { success: false, error: "ID Pesanan dan ID Kurir harus diisi" };
    }

    // Check if pengiriman already exists for this order
    const existing = await prisma.pengiriman.findUnique({
      where: { idPesan: BigInt(idPesan) },
    });

    console.log("Existing pengiriman:", existing);

    if (existing) {
      return { success: false, error: "Pengiriman sudah ada untuk pesanan ini" };
    }

    // Verify pesanan exists
    const pesanan = await prisma.pemesanan.findUnique({
      where: { id: BigInt(idPesan) },
    });

    if (!pesanan) {
      return { success: false, error: "Pesanan tidak ditemukan" };
    }

    console.log("Pesanan found:", pesanan.id.toString(), "status:", pesanan.statusPesan);

    // Verify user (kurir) exists
    const kurir = await prisma.user.findUnique({
      where: { id: BigInt(idUser) },
    });

    if (!kurir) {
      return { success: false, error: "Kurir tidak ditemukan" };
    }

    console.log("Kurir found:", kurir.name);

    // Use transaction to ensure both operations succeed or fail together
    await prisma.$transaction(async (tx) => {
      // Create pengiriman
      const newPengiriman = await tx.pengiriman.create({
        data: {
          idPesan: BigInt(idPesan),
          idUser: BigInt(idUser),
          tglKirim: new Date(),
        },
      });

      console.log("Pengiriman created:", newPengiriman.id.toString());

      // Update pemesanan status ke SedangDikirim karena kurir sudah ditugaskan
      await tx.pemesanan.update({
        where: { id: BigInt(idPesan) },
        data: { statusPesan: "SedangDikirim" },
      });
    });

    console.log("Pesanan status updated to SedangDikirim");

    revalidatePath("/kurir/pengiriman");
    revalidatePath("/kurir/dashboard");
    revalidatePath("/admin/pesanan");
    revalidatePath("/admin/dashboard");
    revalidatePath("/pelanggan/pesanan");
    revalidatePath("/pelanggan/dashboard");
    revalidatePath("/owner/dashboard");
    return { success: true, message: "Pengiriman berhasil dibuat" };
  } catch (error) {
    console.error("Create pengiriman error:", error);
    const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan saat membuat pengiriman";
    return { success: false, error: errorMessage };
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
    let buktiFotoUrl: string | undefined = undefined;

    // Upload bukti foto if provided as base64
    if (buktiFotoBase64 && buktiFotoBase64.startsWith("data:image")) {
      buktiFotoUrl = await uploadImage(buktiFotoBase64, "mangan/pengiriman");
    } else if (data.buktiFoto && data.buktiFoto.startsWith("data:image")) {
      // Handle case where buktiFoto is passed in data object as base64
      buktiFotoUrl = await uploadImage(data.buktiFoto, "mangan/pengiriman");
    } else if (data.buktiFoto && data.buktiFoto.startsWith("http")) {
      // Keep existing cloudinary URL
      buktiFotoUrl = data.buktiFoto;
    }

    const updatePayload: {
      statusKirim: "SedangDikirim" | "TibaDitujuan";
      tglKirim?: Date;
      tglTiba?: Date;
      buktiFoto?: string;
    } = {
      statusKirim: data.statusKirim,
    };

    if (data.tglKirim) {
      updatePayload.tglKirim = new Date(data.tglKirim);
    }
    
    if (data.tglTiba) {
      updatePayload.tglTiba = new Date(data.tglTiba);
    }

    if (buktiFotoUrl) {
      updatePayload.buktiFoto = buktiFotoUrl;
    }

    const updatedPengiriman = await prisma.pengiriman.update({
      where: { id: BigInt(id) },
      data: updatePayload,
    });

    // Sinkronisasi status pemesanan berdasarkan status pengiriman
    if (updatePayload.statusKirim === "SedangDikirim") {
      await prisma.pemesanan.update({
        where: { id: updatedPengiriman.idPesan },
        data: { statusPesan: "SedangDikirim" },
      });
    } else if (updatePayload.statusKirim === "TibaDitujuan") {
      await prisma.pemesanan.update({
        where: { id: updatedPengiriman.idPesan },
        data: { statusPesan: "Selesai" },
      });
    }

    revalidatePath("/kurir/pengiriman");
    revalidatePath("/pelanggan/pesanan");
    revalidatePath("/admin/pesanan");
    revalidatePath("/admin/dashboard");
    revalidatePath("/owner/dashboard");
    revalidatePath("/owner/penjualan");
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
