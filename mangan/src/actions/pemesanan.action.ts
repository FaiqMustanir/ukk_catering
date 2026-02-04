"use server";

import prisma from "@/lib/prisma";
import { pemesananSchema, type PemesananInput, type PemesananStatusUpdateInput } from "@/lib/validations";
import { generateNoResi } from "@/lib/utils";
import { uploadImage } from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function createPemesanan(idPelanggan: string, data: PemesananInput) {
  try {
    console.log("=== CREATE PEMESANAN DEBUG ===");
    console.log("idPelanggan:", idPelanggan);
    console.log("data:", JSON.stringify(data, null, 2));
    
    const validated = pemesananSchema.parse(data);
    console.log("validated:", JSON.stringify(validated, null, 2));

    // Validate all paket IDs exist
    const paketIds = [...new Set(validated.items.map(item => item.idPaket.toString()))];
    const existingPakets = await prisma.paket.findMany({
      where: { id: { in: paketIds.map(id => BigInt(id)) } },
      select: { id: true }
    });
    
    const existingPaketIds = existingPakets.map(p => p.id.toString());
    const invalidPaketIds = paketIds.filter(id => !existingPaketIds.includes(id));
    
    if (invalidPaketIds.length > 0) {
      console.log("Invalid paket IDs:", invalidPaketIds);
      return { 
        success: false, 
        error: "Beberapa item di keranjang sudah tidak tersedia. Silakan kosongkan keranjang dan pilih ulang dari menu." 
      };
    }

    // Calculate total
    const totalBayar = validated.items.reduce((sum, item) => sum + item.subtotal, 0);
    console.log("totalBayar:", totalBayar);

    // Find or Create Payment Method
    let jenisBayar = await prisma.jenisPembayaran.findFirst({
        where: { metodePembayaran: validated.metodePembayaran }
    });
    console.log("jenisBayar found:", jenisBayar);

    // Note: Since user wants "static" types, we ensure it exists.
    // If not found, we create it to satisfy the constraint.
    if (!jenisBayar) {
        console.log("Creating new jenisBayar...");
        jenisBayar = await prisma.jenisPembayaran.create({
            data: { metodePembayaran: validated.metodePembayaran }
        });
        console.log("jenisBayar created:", jenisBayar);
    }

    // Generate no resi
    const noResi = generateNoResi();
    console.log("noResi:", noResi);

    // Create pemesanan with details
    console.log("Creating pemesanan...");
    const pemesanan = await prisma.pemesanan.create({
      data: {
        idPelanggan: BigInt(idPelanggan),
        idJenisBayar: jenisBayar.id,
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
    console.log("pemesanan created:", pemesanan.id.toString());

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
    const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan saat membuat pesanan";
    return { success: false, error: errorMessage };
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
    revalidatePath("/pelanggan/dashboard");
    revalidatePath("/admin/pesanan");
    revalidatePath("/admin/dashboard");
    revalidatePath("/owner/dashboard");
    revalidatePath("/owner/penjualan");
    revalidatePath("/kurir/pengiriman");
    revalidatePath("/kurir/dashboard");
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

export async function uploadBuktiTransfer(id: string, buktiBase64: string) {
  try {
    // Upload image to cloudinary
    const buktiUrl = await uploadImage(buktiBase64, "mangan/bukti-transfer");

    await prisma.pemesanan.update({
      where: { id: BigInt(id) },
      data: {
        buktiTransfer: buktiUrl,
      },
    });

    revalidatePath("/pelanggan/pesanan");
    revalidatePath("/admin/pesanan");
    return { success: true, message: "Bukti transfer berhasil diupload" };
  } catch (error) {
    console.error("Upload bukti transfer error:", error);
    return { success: false, error: "Terjadi kesalahan saat upload bukti transfer" };
  }
}

export async function deletePemesanan(id: string) {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    const order = await prisma.pemesanan.findUnique({
      where: { id: BigInt(id) },
    });

    if (!order) return { success: false, error: "Pesanan tidak ditemukan" };

    const isPelanggan = session.user.type === "pelanggan";

    if (isPelanggan) {
      if (order.statusPesan !== "MenungguKonfirmasi") {
        return { success: false, error: "Pesanan tidak dapat dibatalkan karena sudah diproses" };
      }
      if (order.buktiTransfer) {
        return { success: false, error: "Bukti transfer sudah diupload. Tunggu konfirmasi admin." };
      }
    }

    await prisma.pemesanan.delete({
      where: { id: BigInt(id) },
    });

    revalidatePath("/pelanggan/pesanan");
    revalidatePath("/admin/pesanan");
    return { success: true, message: "Pesanan berhasil dibatalkan" };
  } catch (error) {
    console.error("Delete pemesanan error:", error);
    return { success: false, error: "Terjadi kesalahan saat membatalkan pesanan" };
  }
}
